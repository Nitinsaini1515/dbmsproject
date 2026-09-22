import express from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} from '../controllers/student.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All student routes require valid JWT
router.use(verifyToken);

router.get('/', requireRole('admin'), getAllStudents);
router.get('/:id', getStudentById);
router.post('/', requireRole('admin'), createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', requireRole('admin'), deleteStudent);

export default router;
