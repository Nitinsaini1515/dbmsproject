import pool from '../config/db.js';

// GET /api/dashboard/stats (Real MySQL calculated metrics for Admin Dashboard)
export const getAdminStats = async (req, res) => {
  try {
    // 1. Total Students
    const [[{ total_students }]] = await pool.query('SELECT COUNT(*) AS total_students FROM students');

    // 2. Room Statistics (Total, Available, Full, Maintenance, Total Capacity, Total Occupied Beds)
    const [[roomStats]] = await pool.query(`
      SELECT 
        COUNT(*) AS total_rooms,
        COALESCE(SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END), 0) AS available_rooms,
        COALESCE(SUM(CASE WHEN status = 'Full' THEN 1 ELSE 0 END), 0) AS full_rooms,
        COALESCE(SUM(CASE WHEN status = 'Maintenance' THEN 1 ELSE 0 END), 0) AS maintenance_rooms,
        COALESCE(SUM(capacity), 0) AS total_capacity,
        COALESCE(SUM(occupied), 0) AS occupied_beds,
        COALESCE(SUM(capacity - occupied), 0) AS available_beds
      FROM rooms
    `);

    // 3. Pending Complaints
    const [[{ pending_complaints }]] = await pool.query(
      'SELECT COUNT(*) AS pending_complaints FROM complaints WHERE status != "Resolved"'
    );

    // 4. Financial Statistics (Pending Payments, Overdue Payments, Total Dues)
    const [[paymentStats]] = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN payment_status IN ('Pending', 'Overdue') THEN 1 ELSE 0 END), 0) AS pending_payments_count,
        COALESCE(SUM(CASE WHEN payment_status IN ('Pending', 'Overdue') THEN amount ELSE 0 END), 0) AS total_pending_amount,
        COALESCE(SUM(CASE WHEN payment_status = 'Paid' THEN amount ELSE 0 END), 0) AS total_collected_amount
      FROM payments
    `);

    // 5. Active Allocations count
    const [[{ active_allocations }]] = await pool.query(
      'SELECT COUNT(*) AS active_allocations FROM allocations WHERE status = "Active"'
    );

    // 6. Block-wise occupancy breakdown (Group By demonstration for viva)
    const [blockStats] = await pool.query(`
      SELECT 
        block,
        COUNT(*) AS total_rooms,
        SUM(capacity) AS total_capacity,
        SUM(occupied) AS occupied_beds,
        ROUND((SUM(occupied) / SUM(capacity)) * 100, 1) AS occupancy_rate,
        ROUND(AVG(rent), 2) AS avg_rent
      FROM rooms
      GROUP BY block
      ORDER BY block ASC
    `);

    // 7. Recent 5 complaints for dashboard feed
    const [recentComplaints] = await pool.query(`
      SELECT 
        c.complaint_id,
        c.title,
        c.status,
        c.complaint_date,
        s.name AS student_name,
        r.room_number
      FROM complaints c
      JOIN students s ON c.student_id = s.student_id
      JOIN rooms r ON c.room_id = r.room_id
      ORDER BY c.complaint_date DESC, c.complaint_id DESC
      LIMIT 5
    `);

    // 8. Recent 5 payments for dashboard feed
    const [recentPayments] = await pool.query(`
      SELECT 
        p.payment_id,
        p.amount,
        p.payment_date,
        p.due_date,
        p.payment_status,
        p.payment_method,
        s.name AS student_name
      FROM payments p
      JOIN students s ON p.student_id = s.student_id
      ORDER BY p.due_date DESC, p.payment_id DESC
      LIMIT 5
    `);

    res.status(200).json({
      success: true,
      data: {
        total_students,
        total_rooms: roomStats.total_rooms,
        available_rooms: roomStats.available_rooms,
        full_rooms: roomStats.full_rooms,
        maintenance_rooms: roomStats.maintenance_rooms,
        total_capacity: roomStats.total_capacity,
        occupied_beds: roomStats.occupied_beds,
        available_beds: roomStats.available_beds,
        pending_complaints,
        pending_payments: paymentStats.pending_payments_count,
        total_pending_amount: paymentStats.total_pending_amount,
        total_collected_amount: paymentStats.total_collected_amount,
        active_allocations,
        block_stats: blockStats,
        recent_complaints: recentComplaints,
        recent_payments: recentPayments
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate dashboard statistics.', error: error.message });
  }
};

// GET /api/dashboard/student-stats (Student Dashboard Metrics)
export const getStudentStats = async (req, res) => {
  try {
    if (!req.user.student_id) {
      return res.status(400).json({ success: false, message: 'Logged in user has no student profile.' });
    }

    const studentId = req.user.student_id;

    // 1. Student Profile
    const [[student]] = await pool.query('SELECT * FROM students WHERE student_id = ?', [studentId]);

    // 2. Current Room Allocation
    const [allocations] = await pool.query(`
      SELECT 
        a.allocation_id,
        a.allocation_date,
        a.check_in_date,
        r.room_id,
        r.room_number,
        r.block,
        r.floor,
        r.room_type,
        r.rent,
        r.capacity,
        r.occupied
      FROM allocations a
      JOIN rooms r ON a.room_id = r.room_id
      WHERE a.student_id = ? AND a.status = 'Active'
    `, [studentId]);

    const activeRoom = allocations.length > 0 ? allocations[0] : null;

    // 3. Roommates (if any)
    let roommates = [];
    if (activeRoom) {
      const [rm] = await pool.query(`
        SELECT s.student_id, s.name, s.course, s.year, s.phone, s.email
        FROM allocations a
        JOIN students s ON a.student_id = s.student_id
        WHERE a.room_id = ? AND a.status = 'Active' AND a.student_id != ?
      `, [activeRoom.room_id, studentId]);
      roommates = rm;
    }

    // 4. Payment summary
    const [[paymentSummary]] = await pool.query(`
      SELECT 
        COUNT(*) AS total_invoices,
        COALESCE(SUM(CASE WHEN payment_status = 'Paid' THEN amount ELSE 0 END), 0) AS total_paid,
        COALESCE(SUM(CASE WHEN payment_status IN ('Pending', 'Overdue') THEN amount ELSE 0 END), 0) AS total_pending,
        COUNT(CASE WHEN payment_status = 'Overdue' THEN 1 END) AS overdue_count
      FROM payments
      WHERE student_id = ?
    `, [studentId]);

    // 5. Recent complaints
    const [recentComplaints] = await pool.query(`
      SELECT complaint_id, title, description, complaint_date, status, resolved_date
      FROM complaints
      WHERE student_id = ?
      ORDER BY complaint_date DESC, complaint_id DESC
      LIMIT 5
    `, [studentId]);

    // 6. Recent attendance
    const [recentAttendance] = await pool.query(`
      SELECT attendance_id, date, check_in, check_out
      FROM attendance
      WHERE student_id = ?
      ORDER BY date DESC
      LIMIT 7
    `, [studentId]);

    res.status(200).json({
      success: true,
      data: {
        student,
        allocated_room: activeRoom,
        roommates,
        financials: paymentSummary,
        recent_complaints: recentComplaints,
        recent_attendance: recentAttendance
      }
    });
  } catch (error) {
    console.error('Error fetching student dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student dashboard data.', error: error.message });
  }
};

// GET /api/dashboard/dbms-demo (Live showcase of DBMS Concepts for Viva)
export const getDbmsShowcase = async (req, res) => {
  try {
    // 1. Execute Database View
    const [viewResult] = await pool.query('SELECT * FROM active_allocations_view LIMIT 5');

    // 2. Execute Stored Procedure
    const [procResult] = await pool.query('CALL GetStudentPaymentHistory(1)');

    // 3. Complex Aggregation Query with GROUP BY & HAVING
    const [aggResult] = await pool.query(`
      SELECT 
        room_type,
        COUNT(*) AS room_count,
        SUM(capacity) AS total_capacity,
        SUM(occupied) AS total_occupied,
        ROUND(AVG(rent), 2) AS average_rent
      FROM rooms
      GROUP BY room_type
      HAVING room_count > 0
      ORDER BY room_count DESC
    `);

    // 4. Subquery demonstration
    const [subqueryResult] = await pool.query(`
      SELECT student_id, name, course, email 
      FROM students 
      WHERE student_id NOT IN (
        SELECT student_id FROM allocations WHERE status = 'Active'
      )
    `);

    res.status(200).json({
      success: true,
      dbms_concepts: {
        database_view: {
          name: 'active_allocations_view',
          description: 'Eliminates repetitive 3-way joins (allocations + students + rooms)',
          sample_data: viewResult
        },
        stored_procedure: {
          name: 'GetStudentPaymentHistory(1)',
          description: 'Returns student payment ledger and dynamic financial summary',
          payments: procResult[0] || [],
          summary: procResult[1] ? procResult[1][0] : null
        },
        group_by_having: {
          description: 'Aggregates room inventory statistics grouped by room type with HAVING filter',
          data: aggResult
        },
        subquery: {
          description: 'Subquery to find all unallocated students: WHERE student_id NOT IN (SELECT student_id FROM allocations WHERE status = "Active")',
          unallocated_students: subqueryResult
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error running DBMS showcase queries.', error: error.message });
  }
};
