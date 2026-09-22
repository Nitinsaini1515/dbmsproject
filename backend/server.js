import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { testConnection } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import studentRoutes from './routes/student.routes.js';
import roomRoutes from './routes/room.routes.js';
import allocationRoutes from './routes/allocation.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import complaintRoutes from './routes/complaint.routes.js';
import visitorRoutes from './routes/visitor.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend applications
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parser
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'AMRT Accommodation Management System API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`\n🚀 AMRT Accommodation Backend Server running on http://localhost:${PORT}`);
  await testConnection();
});

export default app;
