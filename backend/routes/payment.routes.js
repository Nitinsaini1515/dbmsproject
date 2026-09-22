import express from 'express';
import {
  getAllPayments,
  getStudentPaymentHistoryProcedure,
  getMyPayments,
  createPayment,
  updatePayment
} from '../controllers/payment.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', requireRole('admin'), getAllPayments);
router.get('/my', getMyPayments);
router.get('/student/:studentId', getStudentPaymentHistoryProcedure);
router.post('/', requireRole('admin'), createPayment);
router.put('/:id', updatePayment);

export default router;
