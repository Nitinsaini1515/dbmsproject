import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'amrt_jwt_super_secret_key_2026_dbms_viva';

// POST /api/auth/register
export const register = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      name,
      email,
      password,
      role = 'student',
      phone,
      gender,
      course,
      year,
      address,
      guardian_name,
      guardian_phone
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    // Check duplicate email
    const [existing] = await connection.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    await connection.beginTransaction();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, phone || null]
    );
    const userId = userResult.insertId;

    let studentId = null;
    // If student role, create student profile
    if (role === 'student') {
      if (!gender || !course || !year || !guardian_name || !guardian_phone) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Student registration requires gender, course, year, guardian name, and guardian phone.'
        });
      }

      const [studentResult] = await connection.query(
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
      studentId = studentResult.insertId;
    }

    await connection.commit();

    // Sign JWT
    const token = jwt.sign(
      { user_id: userId, email, role, student_id: studentId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        user_id: userId,
        name,
        email,
        role,
        phone,
        student_id: studentId
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // Query user with joined student_id if available
    const [users] = await pool.query(
      `SELECT u.user_id, u.name, u.email, u.password, u.role, u.phone, s.student_id 
       FROM users u 
       LEFT JOIN students s ON u.user_id = s.user_id 
       WHERE u.email = ?`,
      [email.trim().toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role, student_id: user.student_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        student_id: user.student_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
      error: error.message
    });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
