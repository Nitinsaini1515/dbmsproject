import pool from '../config/db.js';

// GET /api/complaints
export const getAllComplaints = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT 
        c.complaint_id,
        c.student_id,
        s.name AS student_name,
        s.email AS student_email,
        c.room_id,
        r.room_number,
        r.block,
        c.title,
        c.description,
        c.complaint_date,
        c.status,
        c.resolved_date,
        c.created_at
      FROM complaints c
      JOIN students s ON c.student_id = s.student_id
      JOIN rooms r ON c.room_id = r.room_id
      WHERE 1=1
    `;
    const params = [];

    // If student role, restrict strictly to their own complaints
    if (req.user.role === 'student') {
      query += ` AND c.student_id = ?`;
      params.push(req.user.student_id);
    }

    if (status) {
      query += ` AND c.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY c.complaint_date DESC, c.complaint_id DESC`;

    const [rows] = await pool.query(query, params);
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch complaints.', error: error.message });
  }
};

// POST /api/complaints
export const createComplaint = async (req, res) => {
  try {
    let { student_id, room_id, title, description, complaint_date } = req.body;

    // If student is creating, enforce their own student_id
    if (req.user.role === 'student') {
      student_id = req.user.student_id;
    }

    if (!student_id || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required.'
      });
    }

    // Auto-resolve room_id from active allocation if not provided
    if (!room_id) {
      const [alloc] = await pool.query(
        'SELECT room_id FROM allocations WHERE student_id = ? AND status = "Active"',
        [student_id]
      );
      if (alloc.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot file complaint: You do not currently have an active room allocation.'
        });
      }
      room_id = alloc[0].room_id;
    }

    const dateToUse = complaint_date || new Date().toISOString().slice(0, 10);

    const [result] = await pool.query(
      `INSERT INTO complaints (student_id, room_id, title, description, complaint_date, status)
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [student_id, room_id, title, description, dateToUse]
    );

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      data: {
        complaint_id: result.insertId,
        student_id,
        room_id,
        title,
        status: 'Pending',
        complaint_date: dateToUse
      }
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ success: false, message: 'Failed to submit complaint.', error: error.message });
  }
};

// PUT /api/complaints/:id (Admin resolves / updates status)
export const updateComplaint = async (req, res) => {
  try {
    const complaintId = parseInt(req.params.id, 10);
    const { status, resolved_date } = req.body;

    const [existing] = await pool.query('SELECT * FROM complaints WHERE complaint_id = ?', [complaintId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    let finalResolvedDate = existing[0].resolved_date;
    if (status === 'Resolved' && !finalResolvedDate) {
      finalResolvedDate = resolved_date || new Date().toISOString().slice(0, 10);
    } else if (status !== 'Resolved') {
      finalResolvedDate = null;
    }

    await pool.query(
      `UPDATE complaints 
       SET status = COALESCE(?, status),
           resolved_date = ?
       WHERE complaint_id = ?`,
      [status || null, finalResolvedDate, complaintId]
    );

    res.status(200).json({
      success: true,
      message: `Complaint #${complaintId} status updated to '${status}'.`,
      data: {
        complaint_id: complaintId,
        status,
        resolved_date: finalResolvedDate
      }
    });
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({ success: false, message: 'Failed to update complaint.', error: error.message });
  }
};
