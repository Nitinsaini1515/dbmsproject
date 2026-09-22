import express from 'express';
import {
  getAllRooms,
  getAvailableRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
} from '../controllers/room.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllRooms);
router.get('/available', getAvailableRooms);
router.get('/:id', getRoomById);
router.post('/', requireRole('admin'), createRoom);
router.put('/:id', requireRole('admin'), updateRoom);
router.delete('/:id', requireRole('admin'), deleteRoom);

export default router;
