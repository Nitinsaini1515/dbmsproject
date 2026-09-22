import pool from '../config/db.js';

// GET /api/visitors
export const getAllVisitors = async (req, res) => {
  try {
    const { date, student_id } = req.query;

    let query = `
      SELECT 
        v.visitor_id,
        v.student_id,
        s.name AS student_name,
        s.email AS student_email,
        r.room_number,
        v.visitor_name,
        v.phone,
        v.relation,
        v.visit_date,
        v.in_time,
        v.out_time,
        v.purpose,
        v.created_at
      FROM visitors v
      JOIN students s ON v.student_id = s.student_id
      LEFT JOIN allocations a ON s.student_id = a.student_id AND a.status = 'Active'
      LEFT JOIN rooms r ON a.room_id = r.room_id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'student') {
      query += ` AND v.student_id = ?`;
      params.push(req.user.student_id);
    } else if (student_id) {
      query += ` AND v.student_id = ?`;
      params.push(parseInt(student_id, 10));
    }

    if (date) {
      query += ` AND v.visit_date = ?`;
      params.push(date);
    }

    query += ` ORDER BY v.visit_date DESC, v.in_time DESC`;

    const [rows] = await pool.query(query, params);
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching visitors:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch visitors.', error: error.message });
  }
};

// POST /api/visitors
export const createVisitor = async (req, res) => {
  try {
    let { student_id, visitor_name, phone, relation, visit_date, in_time, out_time, purpose } = req.body;

    if (req.user.role === 'student') {
      student_id = req.user.student_id;
    }

    if (!student_id || !visitor_name || !phone || !relation || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, visitor name, phone, relation, and purpose are required.'
      });
    }

    const todayDate = visit_date || new Date().toISOString().slice(0, 10);
    const nowTime = in_time || new Date().toTimeString().slice(0, 8);

    const [result] = await pool.query(
      `INSERT INTO visitors (student_id, visitor_name, phone, relation, visit_date, in_time, out_time, purpose)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, visitor_name, phone, relation, todayDate, nowTime, out_time || null, purpose]
    );

    res.status(201).json({
      success: true,
      message: 'Visitor logged successfully.',
      data: {
        visitor_id: result.insertId,
        student_id,
        visitor_name,
        visit_date: todayDate,
        in_time: nowTime
      }
    });
  } catch (error) {
    console.error('Error logging visitor:', error);
    res.status(500).json({ success: false, message: 'Failed to log visitor.', error: error.message });
  }
};

// PUT /api/visitors/:id (Update visitor entry, e.g., set out_time)
export const updateVisitor = async (req, res) => {
  try {
    const visitorId = parseInt(req.params.id, 10);
    const { out_time = new Date().toTimeString().slice(0, 8) } = req.body;

    await pool.query('UPDATE visitors SET out_time = ? WHERE visitor_id = ?', [out_time, visitorId]);
    res.status(200).json({ success: true, message: 'Visitor departure recorded successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
