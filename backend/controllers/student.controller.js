import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

// GET /api/students (Admin only, supports search and filter)
export const getAllStudents = async (req, res) => {
  try {
    const { search, course, year, allocated } = req.query;

    let query = `
      SELECT 
        s.student_id,
        s.user_id,
        s.name,
        s.gender,
        s.phone,
        s.email,
        s.course,
        s.year,
        s.address,
        s.guardian_name,
        s.guardian_phone,
        s.created_at,
        r.room_id,
        r.room_number,
        r.block,
        r.floor,
        a.allocation_id,
        a.status AS allocation_status
      FROM students s
      LEFT JOIN allocations a ON s.student_id = a.student_id AND a.status = 'Active'
      LEFT JOIN rooms r ON a.room_id = r.room_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (s.name LIKE ? OR s.email LIKE ? OR s.phone LIKE ? OR r.room_number LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (course) {
      query += ` AND s.course = ?`;
      params.push(course);
    }

    if (year) {
      query += ` AND s.year = ?`;
      params.push(parseInt(year, 10));
    }

    if (allocated === 'true') {
      query += ` AND a.status = 'Active'`;
    } else if (allocated === 'false') {
      query += ` AND (a.status IS NULL OR a.status != 'Active')`;
    }

    query += ` ORDER BY s.name ASC`;

    const [rows] = await pool.query(query, params);
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch students.', error: error.message });
  }
};

// GET /api/students/:id (Admin or own profile)
export const getStudentById = async (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);

    // Security check: Student can only view their own profile
    if (req.user.role === 'student' && req.user.student_id !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You cannot view another student\'s profile.'
      });
    }

    const [studentRows] = await pool.query(
      `SELECT 
        s.student_id,
        s.user_id,
        s.name,
        s.gender,
        s.phone,
        s.email,
        s.course,
        s.year,
        s.address,
        s.guardian_name,
        s.guardian_phone,
        s.created_at,
        r.room_id,
        r.room_number,
        r.block,
        r.floor,
        r.room_type,
        r.rent,
        a.allocation_id,
        a.allocation_date,
        a.check_in_date,
        a.status AS allocation_status
      FROM students s
      LEFT JOIN allocations a ON s.student_id = a.student_id AND a.status = 'Active'
      LEFT JOIN rooms r ON a.room_id = r.room_id
      WHERE s.student_id = ?`,
      [studentId]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    res.status(200).json({ success: true, data: studentRows[0] });
  } catch (error) {
    console.error('Error fetching student by ID:', error);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// POST /api/students (Admin only - creates user account + student record in transaction)
export const createStudent = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      name,
      email,
      password = 'student123',
      phone,
      gender,
      course,
      year,
      address,
      guardian_name,
      guardian_phone
    } = req.body;

    if (!name || !email || !gender || !course || !year || !guardian_name || !guardian_phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, gender, course, year, guardian name, and guardian phone are required.'
      });
    }

    // Check duplicate email
    const [existing] = await connection.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }

    await connection.beginTransaction();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 1. Insert into users table
    const [userRes] = await connection.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, "student", ?)',
      [name, email, hashedPassword, phone || null]
    );
    const userId = userRes.insertId;

    // 2. Insert into students table
    const [studentRes] = await connection.query(
      `INSERT INTO students (user_id, name, gender, phone, email, course, year, address, guardian_name, guardian_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        gender,
        phone || '',
        email,
        course,
        parseInt(year, 10),
        address || 'Hostel Campus',
        guardian_name,
        guardian_phone
      ]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Student registered successfully.',
      data: {
        student_id: studentRes.insertId,
        user_id: userId,
        name,
        email,
        course,
        year
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating student:', error);
    res.status(500).json({ success: false, message: 'Failed to create student.', error: error.message });
  } finally {
    connection.release();
  }
};

// PUT /api/students/:id (Admin or own profile update)
export const updateStudent = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const studentId = parseInt(req.params.id, 10);

    // Security check
    if (req.user.role === 'student' && req.user.student_id !== studentId) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const [existing] = await connection.query('SELECT user_id, email FROM students WHERE student_id = ?', [studentId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const {
      name,
      phone,
      gender,
      course,
      year,
      address,
      guardian_name,
      guardian_phone
    } = req.body;

    await connection.beginTransaction();

    await connection.query(
      `UPDATE students 
       SET name = COALESCE(?, name),
           phone = COALESCE(?, phone),
           gender = COALESCE(?, gender),
           course = COALESCE(?, course),
           year = COALESCE(?, year),
           address = COALESCE(?, address),
           guardian_name = COALESCE(?, guardian_name),
           guardian_phone = COALESCE(?, guardian_phone)
       WHERE student_id = ?`,
      [name, phone, gender, course, year ? parseInt(year, 10) : null, address, guardian_name, guardian_phone, studentId]
    );

    // Also update users name & phone
    if (name || phone) {
      await connection.query(
        'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE user_id = ?',
        [name, phone, existing[0].user_id]
      );
    }

    await connection.commit();

    res.status(200).json({ success: true, message: 'Student updated successfully.' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating student:', error);
    res.status(500).json({ success: false, message: 'Failed to update student.', error: error.message });
  } finally {
    connection.release();
  }
};

// DELETE /api/students/:id (Admin only)
export const deleteStudent = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const studentId = parseInt(req.params.id, 10);

    // Check active allocation
    const [activeAlloc] = await connection.query(
      'SELECT allocation_id FROM allocations WHERE student_id = ? AND status = "Active"',
      [studentId]
    );
    if (activeAlloc.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete student with an active room allocation. Please vacate the student first.'
      });
    }

    const [student] = await connection.query('SELECT user_id FROM students WHERE student_id = ?', [studentId]);
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    await connection.beginTransaction();

    // Deleting from users will cascade delete from students, allocations, payments, complaints, etc.
    await connection.query('DELETE FROM users WHERE user_id = ?', [student[0].user_id]);

    await connection.commit();

    res.status(200).json({ success: true, message: 'Student deleted successfully.' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting student:', error);
    res.status(500).json({ success: false, message: 'Failed to delete student.', error: error.message });
  } finally {
    connection.release();
  }
};
