import express from 'express';
import {
  getAdminStats,
  getStudentStats,
  getDbmsShowcase
} from '../controllers/dashboard.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/stats', requireRole('admin'), getAdminStats);
router.get('/student-stats', getStudentStats);
router.get('/dbms-showcase', getDbmsShowcase);

export default router;
