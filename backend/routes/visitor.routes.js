import express from 'express';
import {
  getAllVisitors,
  createVisitor,
  updateVisitor
} from '../controllers/visitor.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllVisitors);
router.post('/', createVisitor);
router.put('/:id', updateVisitor);

export default router;
