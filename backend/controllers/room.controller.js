import pool from '../config/db.js';

// GET /api/rooms (supports query filters for block, floor, type, status)
export const getAllRooms = async (req, res) => {
  try {
    const { block, floor, room_type, status, search } = req.query;

    let query = `
      SELECT 
        r.room_id,
        r.room_number,
        r.block,
        r.floor,
        r.room_type,
        r.capacity,
        r.occupied,
        (r.capacity - r.occupied) AS available_beds,
        r.rent,
        r.status,
        r.created_at,
        GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') AS current_occupants
      FROM rooms r
      LEFT JOIN allocations a ON r.room_id = a.room_id AND a.status = 'Active'
      LEFT JOIN students s ON a.student_id = s.student_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND r.room_number LIKE ?`;
      params.push(`%${search}%`);
    }

    if (block) {
      query += ` AND r.block = ?`;
      params.push(block);
    }

    if (floor) {
      query += ` AND r.floor = ?`;
      params.push(parseInt(floor, 10));
    }

    if (room_type) {
      query += ` AND r.room_type = ?`;
      params.push(room_type);
    }

    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }

    query += ` GROUP BY r.room_id ORDER BY r.block ASC, r.room_number ASC`;

    const [rows] = await pool.query(query, params);
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch rooms.', error: error.message });
  }
};

// GET /api/rooms/available (Filtered helper for allocation dropdown)
export const getAvailableRooms = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        room_id,
        room_number,
        block,
        floor,
        room_type,
        capacity,
        occupied,
        (capacity - occupied) AS available_beds,
        rent,
        status
      FROM rooms 
      WHERE status = 'Available' AND occupied < capacity
      ORDER BY block ASC, room_number ASC`
    );
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch available rooms.', error: error.message });
  }
};

// GET /api/rooms/:id
export const getRoomById = async (req, res) => {
  try {
    const roomId = parseInt(req.params.id, 10);
    const [rooms] = await pool.query('SELECT * FROM rooms WHERE room_id = ?', [roomId]);

    if (rooms.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    // Fetch active occupants
    const [occupants] = await pool.query(
      `SELECT 
        a.allocation_id,
        a.allocation_date,
        a.check_in_date,
        s.student_id,
        s.name,
        s.email,
        s.phone,
        s.course,
        s.year
      FROM allocations a
      JOIN students s ON a.student_id = s.student_id
      WHERE a.room_id = ? AND a.status = 'Active'`,
      [roomId]
    );

    res.status(200).json({
      success: true,
      data: {
        ...rooms[0],
        occupants
      }
    });
  } catch (error) {
    console.error('Error fetching room by ID:', error);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// POST /api/rooms (Admin only)
export const createRoom = async (req, res) => {
  try {
    const {
      room_number,
      block,
      floor,
      room_type,
      capacity,
      rent,
      status = 'Available'
    } = req.body;

    if (!room_number || !block || floor === undefined || !room_type || !capacity || !rent) {
      return res.status(400).json({
        success: false,
        message: 'Room number, block, floor, room type, capacity, and rent are required.'
      });
    }

    // Check duplicate room_number
    const [existing] = await pool.query('SELECT room_id FROM rooms WHERE room_number = ?', [room_number]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'A room with this room number already exists.' });
    }

    const [result] = await pool.query(
      `INSERT INTO rooms (room_number, block, floor, room_type, capacity, occupied, rent, status)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        room_number.trim().toUpperCase(),
        block.trim().toUpperCase(),
        parseInt(floor, 10),
        room_type,
        parseInt(capacity, 10),
        parseFloat(rent),
        status
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Room created successfully.',
      data: {
        room_id: result.insertId,
        room_number,
        block,
        floor,
        room_type,
        capacity,
        occupied: 0,
        rent,
        status
      }
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ success: false, message: 'Failed to create room.', error: error.message });
  }
};

// PUT /api/rooms/:id (Admin only)
export const updateRoom = async (req, res) => {
  try {
    const roomId = parseInt(req.params.id, 10);
    const [existing] = await pool.query('SELECT * FROM rooms WHERE room_id = ?', [roomId]);

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    const room = existing[0];
    const {
      room_number,
      block,
      floor,
      room_type,
      capacity,
      rent,
      status
    } = req.body;

    const newCapacity = capacity !== undefined ? parseInt(capacity, 10) : room.capacity;
    if (newCapacity < room.occupied) {
      return res.status(400).json({
        success: false,
        message: `Cannot reduce room capacity to ${newCapacity}. Room currently has ${room.occupied} active occupants.`
      });
    }

    // Calculate status automatically if full
    let finalStatus = status || room.status;
    if (room.occupied >= newCapacity) {
      finalStatus = 'Full';
    } else if (finalStatus === 'Full' && room.occupied < newCapacity) {
      finalStatus = 'Available';
    }

    await pool.query(
      `UPDATE rooms 
       SET room_number = COALESCE(?, room_number),
           block = COALESCE(?, block),
           floor = COALESCE(?, floor),
           room_type = COALESCE(?, room_type),
           capacity = ?,
           rent = COALESCE(?, rent),
           status = ?
       WHERE room_id = ?`,
      [
        room_number ? room_number.trim().toUpperCase() : null,
        block ? block.trim().toUpperCase() : null,
        floor !== undefined ? parseInt(floor, 10) : null,
        room_type || null,
        newCapacity,
        rent !== undefined ? parseFloat(rent) : null,
        finalStatus,
        roomId
      ]
    );

    res.status(200).json({ success: true, message: 'Room updated successfully.' });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ success: false, message: 'Failed to update room.', error: error.message });
  }
};

// DELETE /api/rooms/:id (Admin only)
export const deleteRoom = async (req, res) => {
  try {
    const roomId = parseInt(req.params.id, 10);

    const [room] = await pool.query('SELECT * FROM rooms WHERE room_id = ?', [roomId]);
    if (room.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    if (room[0].occupied > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room with active occupants. Please vacate all students first.'
      });
    }

    await pool.query('DELETE FROM rooms WHERE room_id = ?', [roomId]);
    res.status(200).json({ success: true, message: 'Room deleted successfully.' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ success: false, message: 'Failed to delete room.', error: error.message });
  }
};
