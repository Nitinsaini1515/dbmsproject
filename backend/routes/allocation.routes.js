import express from 'express';
import {
  getAllAllocations,
  getActiveAllocationsFromView,
  getMyActiveAllocation,
  allocateRoom,
  vacateRoom
} from '../controllers/allocation.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', requireRole('admin'), getAllAllocations);
router.get('/active', requireRole('admin'), getActiveAllocationsFromView);
router.get('/my', getMyActiveAllocation);
router.post('/', requireRole('admin'), allocateRoom);
router.put('/:id/vacate', requireRole('admin'), vacateRoom);

export default router;
