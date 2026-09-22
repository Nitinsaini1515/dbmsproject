import pool from '../config/db.js';

// GET /api/payments (Admin: all payments with search & filters)
export const getAllPayments = async (req, res) => {
  try {
    const { status, student_id, search } = req.query;

    let query = `
      SELECT 
        p.payment_id,
        p.student_id,
        s.name AS student_name,
        s.email AS student_email,
        s.phone AS student_phone,
        r.room_number,
        p.amount,
        p.payment_date,
        p.due_date,
        p.payment_method,
        p.payment_status,
        p.transaction_id,
        p.created_at
      FROM payments p
      JOIN students s ON p.student_id = s.student_id
      LEFT JOIN allocations a ON s.student_id = a.student_id AND a.status = 'Active'
      LEFT JOIN rooms r ON a.room_id = r.room_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND p.payment_status = ?`;
      params.push(status);
    }

    if (student_id) {
      query += ` AND p.student_id = ?`;
      params.push(parseInt(student_id, 10));
    }

    if (search) {
      query += ` AND (s.name LIKE ? OR s.email LIKE ? OR p.transaction_id LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    query += ` ORDER BY p.due_date DESC, p.payment_id DESC`;

    const [rows] = await pool.query(query, params);
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payments.', error: error.message });
  }
};

// GET /api/payments/student/:studentId (CALLS MYSQL STORED PROCEDURE: GetStudentPaymentHistory)
export const getStudentPaymentHistoryProcedure = async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);

    // Security check: Student can only view their own payment history
    if (req.user.role === 'student' && req.user.student_id !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You cannot view another student\'s payment history.'
      });
    }

    // Execute Stored Procedure
    const [resultSets] = await pool.query('CALL GetStudentPaymentHistory(?)', [studentId]);

    // MySQL returns an array of result sets: [ [rows], [summaryRows], OkPacket ]
    const paymentRecords = resultSets[0] || [];
    const summary = (resultSets[1] && resultSets[1][0]) ? resultSets[1][0] : {
      total_invoices: 0,
      total_paid: 0,
      total_pending: 0,
      overdue_count: 0
    };

    res.status(200).json({
      success: true,
      source: 'STORED_PROCEDURE: GetStudentPaymentHistory(?)',
      student_id: studentId,
      summary,
      count: paymentRecords.length,
      data: paymentRecords
    });
  } catch (error) {
    console.error('Error executing GetStudentPaymentHistory stored procedure:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute stored procedure.',
      error: error.message
    });
  }
};

// GET /api/payments/my (Student view for own payments)
export const getMyPayments = async (req, res) => {
  try {
    if (!req.user.student_id) {
      return res.status(400).json({ success: false, message: 'No student profile linked.' });
    }

    // Delegate to stored procedure
    req.params.studentId = req.user.student_id;
    return getStudentPaymentHistoryProcedure(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/payments (Admin creates payment invoice)
export const createPayment = async (req, res) => {
  try {
    const {
      student_id,
      amount,
      due_date,
      payment_date,
      payment_method = 'Pending',
      payment_status = 'Pending',
      transaction_id
    } = req.body;

    if (!student_id || !amount || !due_date) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, amount, and due date are required.'
      });
    }

    // Validate student exists
    const [student] = await pool.query('SELECT student_id, name FROM students WHERE student_id = ?', [student_id]);
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const [result] = await pool.query(
      `INSERT INTO payments (student_id, amount, payment_date, due_date, payment_method, payment_status, transaction_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        parseFloat(amount),
        payment_date || null,
        due_date,
        payment_method,
        payment_status,
        transaction_id || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Payment record created successfully.',
      data: {
        payment_id: result.insertId,
        student_id,
        amount,
        due_date,
        payment_status
      }
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment.', error: error.message });
  }
};

// PUT /api/payments/:id (Update payment / Mark as Paid)
export const updatePayment = async (req, res) => {
  try {
    const paymentId = parseInt(req.params.id, 10);
    const {
      payment_status,
      payment_method,
      payment_date = new Date().toISOString().slice(0, 10),
      transaction_id
    } = req.body;

    const [existing] = await pool.query('SELECT * FROM payments WHERE payment_id = ?', [paymentId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    // Generate transaction ID if marking as Paid and none provided
    const finalTxnId = (payment_status === 'Paid' && !transaction_id && !existing[0].transaction_id)
      ? `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      : (transaction_id || existing[0].transaction_id);

    await pool.query(
      `UPDATE payments 
       SET payment_status = COALESCE(?, payment_status),
           payment_method = COALESCE(?, payment_method),
           payment_date = ?,
           transaction_id = ?
       WHERE payment_id = ?`,
      [
        payment_status || null,
        payment_method || null,
        payment_status === 'Paid' ? payment_date : existing[0].payment_date,
        finalTxnId,
        paymentId
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Payment updated successfully.',
      transaction_id: finalTxnId
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ success: false, message: 'Failed to update payment.', error: error.message });
  }
};
