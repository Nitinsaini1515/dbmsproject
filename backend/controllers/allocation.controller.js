import pool from '../config/db.js';

// GET /api/allocations (All allocations with search & filter)
export const getAllAllocations = async (req, res) => {
  try {
    const { status, student_id, room_id } = req.query;

    let query = `
      SELECT 
        a.allocation_id,
        a.student_id,
        s.name AS student_name,
        s.email AS student_email,
        s.phone AS student_phone,
        s.course,
        s.year,
        a.room_id,
        r.room_number,
        r.block,
        r.floor,
        r.room_type,
        r.rent,
        a.allocation_date,
        a.check_in_date,
        a.check_out_date,
        a.status
      FROM allocations a
      JOIN students s ON a.student_id = s.student_id
      JOIN rooms r ON a.room_id = r.room_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    if (student_id) {
      query += ` AND a.student_id = ?`;
      params.push(parseInt(student_id, 10));
    }

    if (room_id) {
      query += ` AND a.room_id = ?`;
      params.push(parseInt(room_id, 10));
    }

    query += ` ORDER BY a.allocation_date DESC, a.allocation_id DESC`;

    const [rows] = await pool.query(query, params);
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching allocations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch allocations.', error: error.message });
  }
};

// GET /api/allocations/active (QUERIES THE DATABASE VIEW: active_allocations_view)
export const getActiveAllocationsFromView = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM active_allocations_view ORDER BY room_number ASC');
    res.status(200).json({
      success: true,
      source: 'DATABASE_VIEW: active_allocations_view',
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching from active_allocations_view:', error);
    res.status(500).json({ success: false, message: 'Failed to query active allocations view.', error: error.message });
  }
};

// GET /api/allocations/my (For Student dashboard)
export const getMyActiveAllocation = async (req, res) => {
  try {
    if (!req.user.student_id) {
      return res.status(400).json({ success: false, message: 'Logged in user is not associated with a student record.' });
    }

    const [rows] = await pool.query(
      `SELECT 
        a.allocation_id,
        a.allocation_date,
        a.check_in_date,
        a.status AS allocation_status,
        r.room_id,
        r.room_number,
        r.block,
        r.floor,
        r.room_type,
        r.capacity,
        r.occupied,
        r.rent,
        r.status AS room_status
       FROM allocations a
       JOIN rooms r ON a.room_id = r.room_id
       WHERE a.student_id = ? AND a.status = 'Active'`,
      [req.user.student_id]
    );

    if (rows.length === 0) {
      return res.status(200).json({ success: true, hasAllocation: false, data: null });
    }

    const allocation = rows[0];

    // Also fetch roommates (other active students in the same room)
    const [roommates] = await pool.query(
      `SELECT s.student_id, s.name, s.course, s.year, s.phone 
       FROM allocations a
       JOIN students s ON a.student_id = s.student_id
       WHERE a.room_id = ? AND a.status = 'Active' AND a.student_id != ?`,
      [allocation.room_id, req.user.student_id]
    );

    res.status(200).json({
      success: true,
      hasAllocation: true,
      data: {
        ...allocation,
        roommates
      }
    });
  } catch (error) {
    console.error('Error fetching student allocation:', error);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// POST /api/allocations (ACID Transaction-based Room Allocation)
export const allocateRoom = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      student_id,
      room_id,
      allocation_date = new Date().toISOString().slice(0, 10),
      check_in_date = new Date().toISOString().slice(0, 10)
    } = req.body;

    if (!student_id || !room_id) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Room ID are required for room allocation.'
      });
    }

    // BEGIN MySQL TRANSACTION
    await connection.beginTransaction();

    // 1. Verify student exists
    const [students] = await connection.query(
      'SELECT student_id, name FROM students WHERE student_id = ? FOR UPDATE',
      [student_id]
    );
    if (students.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: `Student ID #${student_id} does not exist.` });
    }

    // 2. Verify student does not already have an active allocation
    const [existingAlloc] = await connection.query(
      'SELECT allocation_id, room_id FROM allocations WHERE student_id = ? AND status = "Active" FOR UPDATE',
      [student_id]
    );
    if (existingAlloc.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Student "${students[0].name}" already has an active room allocation (Allocation #${existingAlloc[0].allocation_id}).`
      });
    }

    // 3. Verify room exists with row lock
    const [rooms] = await connection.query(
      'SELECT room_id, room_number, capacity, occupied, status FROM rooms WHERE room_id = ? FOR UPDATE',
      [room_id]
    );
    if (rooms.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: `Room ID #${room_id} does not exist.` });
    }

    const room = rooms[0];

    // 4. Verify room status is available
    if (room.status !== 'Available') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Room ${room.room_number} is currently marked as '${room.status}' and cannot accept new allocations.`
      });
    }

    // 5. Verify occupied < capacity
    if (room.occupied >= room.capacity) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Room ${room.room_number} is at maximum capacity (${room.occupied}/${room.capacity}).`
      });
    }

    // 6. Create allocation record
    const [allocResult] = await connection.query(
      `INSERT INTO allocations (student_id, room_id, allocation_date, check_in_date, status)
       VALUES (?, ?, ?, ?, 'Active')`,
      [student_id, room_id, allocation_date, check_in_date]
    );

    // 7. Increase room occupancy by 1
    const newOccupied = room.occupied + 1;

    // 8. If occupied becomes equal to capacity, automatically change room status to 'Full'
    const newStatus = newOccupied >= room.capacity ? 'Full' : 'Available';

    await connection.query(
      'UPDATE rooms SET occupied = ?, status = ? WHERE room_id = ?',
      [newOccupied, newStatus, room_id]
    );

    // 9. COMMIT TRANSACTION
    await connection.commit();

    res.status(201).json({
      success: true,
      message: `Student "${students[0].name}" successfully allocated to Room ${room.room_number}.`,
      data: {
        allocation_id: allocResult.insertId,
        student_id,
        student_name: students[0].name,
        room_id,
        room_number: room.room_number,
        occupied: newOccupied,
        capacity: room.capacity,
        room_status: newStatus
      }
    });
  } catch (error) {
    // ROLLBACK ON ERROR
    await connection.rollback();
    console.error('Room allocation transaction failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to allocate room. Database transaction rolled back.',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// PUT /api/allocations/:id/vacate (ACID Transaction-based Vacate Room)
export const vacateRoom = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const allocationId = parseInt(req.params.id, 10);
    const checkOutDate = req.body.check_out_date || new Date().toISOString().slice(0, 10);

    // BEGIN MySQL TRANSACTION
    await connection.beginTransaction();

    // 1. Find active allocation with lock
    const [allocations] = await connection.query(
      `SELECT a.allocation_id, a.student_id, a.room_id, a.status, s.name AS student_name, r.room_number, r.occupied, r.capacity, r.status AS room_status
       FROM allocations a
       JOIN students s ON a.student_id = s.student_id
       JOIN rooms r ON a.room_id = r.room_id
       WHERE a.allocation_id = ? FOR UPDATE`,
      [allocationId]
    );

    if (allocations.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Allocation record not found.' });
    }

    const alloc = allocations[0];

    if (alloc.status === 'Vacated') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Allocation #${allocationId} has already been marked as Vacated.`
      });
    }

    // 2. Update allocation status to 'Vacated' and set checkout date
    await connection.query(
      'UPDATE allocations SET status = "Vacated", check_out_date = ? WHERE allocation_id = ?',
      [checkOutDate, allocationId]
    );

    // 3. Decrease room occupancy by 1 (never allow below 0)
    const newOccupied = Math.max(0, alloc.occupied - 1);

    // 4. If room was 'Full' or now has beds, set back to 'Available' (unless Maintenance)
    let newStatus = alloc.room_status;
    if (alloc.room_status === 'Full') {
      newStatus = 'Available';
    }

    await connection.query(
      'UPDATE rooms SET occupied = ?, status = ? WHERE room_id = ?',
      [newOccupied, newStatus, alloc.room_id]
    );

    // 5. COMMIT TRANSACTION
    await connection.commit();

    res.status(200).json({
      success: true,
      message: `Student "${alloc.student_name}" successfully vacated Room ${alloc.room_number}.`,
      data: {
        allocation_id: allocationId,
        student_id: alloc.student_id,
        room_id: alloc.room_id,
        room_number: alloc.room_number,
        occupied: newOccupied,
        capacity: alloc.capacity,
        room_status: newStatus,
        check_out_date: checkOutDate
      }
    });
  } catch (error) {
    // ROLLBACK ON ERROR
    await connection.rollback();
    console.error('Room vacate transaction failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to vacate room. Database transaction rolled back.',
      error: error.message
    });
  } finally {
    connection.release();
  }
};
