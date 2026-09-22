import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'amrt_jwt_super_secret_key_2026_dbms_viva';

// Middleware to verify JWT token
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid Bearer token.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user to ensure user still exists and role is current
    const [rows] = await pool.query(
      `SELECT u.user_id, u.name, u.email, u.role, u.phone, s.student_id 
       FROM users u 
       LEFT JOIN students s ON u.user_id = s.user_id 
       WHERE u.user_id = ?`,
      [decoded.user_id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User account associated with this token was not found.'
      });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid or malformed authentication token.'
    });
  }
};

// Middleware to restrict routes by role (e.g. requireRole('admin'))
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of [${allowedRoles.join(', ')}] roles.`
      });
    }

    next();
  };
};

// Middleware ensuring student can only view/modify their own records, while admin can access any
export const checkStudentAccess = (paramName = 'studentId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    const requestedStudentId = parseInt(req.params[paramName] || req.body[paramName] || req.query[paramName], 10);
    if (!requestedStudentId || req.user.student_id !== requestedStudentId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You are not authorized to access another student\'s data.'
      });
    }

    next();
  };
};
