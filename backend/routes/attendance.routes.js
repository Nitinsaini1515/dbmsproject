import express from 'express';
import {
  getAttendance,
  logAttendance
} from '../controllers/attendance.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getAttendance);
router.post('/', logAttendance);

export default router;
