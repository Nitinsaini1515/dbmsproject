import express from 'express';
import {
  getAllComplaints,
  createComplaint,
  updateComplaint
} from '../controllers/complaint.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllComplaints);
router.post('/', createComplaint);
router.put('/:id', requireRole('admin'), updateComplaint);

export default router;
