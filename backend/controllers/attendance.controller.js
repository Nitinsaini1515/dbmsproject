import pool from '../config/db.js';

// GET /api/attendance
export const getAttendance = async (req, res) => {
  try {
    const { date, student_id } = req.query;

    let query = `
      SELECT 
        att.attendance_id,
        att.student_id,
        s.name AS student_name,
        s.email AS student_email,
        r.room_number,
        att.date,
        att.check_in,
        att.check_out,
        att.created_at
      FROM attendance att
      JOIN students s ON att.student_id = s.student_id
      LEFT JOIN allocations a ON s.student_id = a.student_id AND a.status = 'Active'
      LEFT JOIN rooms r ON a.room_id = r.room_id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'student') {
      query += ` AND att.student_id = ?`;
      params.push(req.user.student_id);
    } else if (student_id) {
      query += ` AND att.student_id = ?`;
      params.push(parseInt(student_id, 10));
    }

    if (date) {
      query += ` AND att.date = ?`;
      params.push(date);
    }

    query += ` ORDER BY att.date DESC, att.check_in DESC`;

    const [rows] = await pool.query(query, params);
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance.', error: error.message });
  }
};

// POST /api/attendance (Log or update attendance)
export const logAttendance = async (req, res) => {
  try {
    let { student_id, date, check_in, check_out } = req.body;

    if (req.user.role === 'student') {
      student_id = req.user.student_id;
    }

    if (!student_id) {
      return res.status(400).json({ success: false, message: 'Student ID is required.' });
    }

    const targetDate = date || new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toTimeString().slice(0, 8);

    const checkInVal = check_in !== undefined ? check_in : nowTime;
    const checkOutVal = check_out !== undefined ? check_out : null;

    // Use INSERT ... ON DUPLICATE KEY UPDATE to handle check_in and check_out seamlessly
    await pool.query(
      `INSERT INTO attendance (student_id, date, check_in, check_out)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         check_in = COALESCE(VALUES(check_in), check_in),
         check_out = COALESCE(VALUES(check_out), check_out)`,
      [student_id, targetDate, checkInVal, checkOutVal]
    );

    res.status(200).json({
      success: true,
      message: 'Attendance recorded successfully.',
      data: {
        student_id,
        date: targetDate,
        check_in: checkInVal,
        check_out: checkOutVal
      }
    });
  } catch (error) {
    console.error('Error logging attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to record attendance.', error: error.message });
  }
};
