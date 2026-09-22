-- =============================================================================
-- AMRT Accommodation Management System - Seed Data (MySQL 8.x)
-- Realistic College Project Demo Dataset
--
-- Passwords:
-- Admin:    admin@amrt.edu    / admin123
-- Students: student1@amrt.edu / student123 (to student12@amrt.edu)
-- =============================================================================

USE `amrt_accommodation`;

SET FOREIGN_KEY_CHECKS = 0;

-- Clean existing data
TRUNCATE TABLE `attendance`;
TRUNCATE TABLE `visitors`;
TRUNCATE TABLE `complaints`;
TRUNCATE TABLE `payments`;
TRUNCATE TABLE `allocations`;
TRUNCATE TABLE `rooms`;
TRUNCATE TABLE `students`;
TRUNCATE TABLE `users`;

-- =============================================================================
-- 1. SEED USERS
-- =============================================================================
INSERT INTO `users` (`user_id`, `name`, `email`, `password`, `role`, `phone`) VALUES
(1,  'Prof. R. K. Sharma (Chief Warden)', 'admin@amrt.edu', '$2a$10$7mEhKli/7maGkrr8cAxsuu4VQvlu1k5ZZHdHgf2TT.PhGO7cXJ7FC', 'admin', '+91 98112 34567'),
(2,  'Aarav Mehta',       'student1@amrt.edu',  '$2a$10$LnsF13.1rshpkg7uhHHJDuwC3nYvz5g.EKWXcLWQoqvtjeKioBD3e', 'student', '+91 98765 01001'),
(3,  'Priya Nair',        'student2@amrt.edu',  '$2a$10$LnsF13.1rshpkg7uhHHJDuwC3nYvz5g.EKWXcLWQoqvtjeKioBD3e', 'student', '+91 98765 01002'),
(4,  'Rohan Verma',       'student3@amrt.edu',  '$2a$10$LnsF13.1rshpkg7uhHHJDuwC3nYvz5g.EKWXcLWQoqvtjeKioBD3e', 'student', '+91 98765 01003'),
(5,  'Ananya Iyer',       'student4@amrt.edu',  '$2a$10$LnsF13.1rshpkg7uhHHJDuwC3nYvz5g.EKWXcLWQoqvtjeKioBD3e', 'student', '+91 98765 01004'),
(6,  'Vikramaditya Rao',  'student5@amrt.edu',  '$2a$10$LnsF13.1rshpkg7uhHHJDuwC3nYvz5g.EKWXcLWQoqvtjeKioBD3e', 'student', '+91 98765 01005'),
(7,  'Sneha Kulkarni',    'student6@amrt.edu',  '$2a$10$LnsF13.1rshpkg7uhHHJDuwC3nYvz5g.EKWXcLWQoqvtjeKioBD3e', 'student', '+91 98765 01006'),
(8,  'Aditya Deshmukh',   'student7@amrt.edu',  '$2a$10$LnsF13.1rshpkg7uhHHJDuwC3nYvz5g.EKWXcLWQoqvtjeKioBD3e', 'student', '+91 98765 01007'),
(9,  'Tanvi Sengupta',    'student8@amrt.edu',  '$2a$10$LnsF13.1rshpkg7uhHHJDuwC3nYvz5g.EKWXcLWQoqvtjeKioBD3e', 'student', '+91 98765 01008'),
(10, 'Kabir Malhotra',    'student9@amrt.edu',  '$2a$10$LnsF13.1rshpkg7uhHHJDuwC3nYvz5g.EKWXcLWQoqvtjeKioBD3e', 'student', '+91 98765 01009'),
(11, 'Ishita Banerjee',   'student10@amrt.edu', '$2a$10$LnsF13.1rshpkg7uhHHJDuwC3nYvz5g.EKWXcLWQoqvtjeKioBD3e', 'student', '+91 98765 01010'),
(12, 'Harsh Vardhan',     'student11@amrt.edu', '$2a$10$LnsF13.1rshpkg7uhHHJDuwC3nYvz5g.EKWXcLWQoqvtjeKioBD3e', 'student', '+91 98765 01011'),
(13, 'Rhea Chawla',       'student12@amrt.edu', '$2a$10$LnsF13.1rshpkg7uhHHJDuwC3nYvz5g.EKWXcLWQoqvtjeKioBD3e', 'student', '+91 98765 01012');

-- =============================================================================
-- 2. SEED STUDENTS
-- =============================================================================
INSERT INTO `students` (`student_id`, `user_id`, `name`, `gender`, `phone`, `email`, `course`, `year`, `address`, `guardian_name`, `guardian_phone`) VALUES
(1,  2,  'Aarav Mehta',       'Male',   '+91 98765 01001', 'student1@amrt.edu',  'B.Tech CSE', 3, 'Flat 402, Green Glen Layout, Bengaluru, Karnataka', 'Sanjay Mehta',   '+91 94480 12345'),
(2,  3,  'Priya Nair',        'Female', '+91 98765 01002', 'student2@amrt.edu',  'B.Tech ECE', 2, '12/A, Keston Road, Thiruvananthapuram, Kerala',      'Gopinath Nair',  '+91 94470 54321'),
(3,  4,  'Rohan Verma',       'Male',   '+91 98765 01003', 'student3@amrt.edu',  'B.Tech IT',  3, 'Sector 15, Vasundhara, Ghaziabad, UP',              'Mahesh Verma',   '+91 98100 67890'),
(4,  5,  'Ananya Iyer',       'Female', '+91 98765 01004', 'student4@amrt.edu',  'MCA',        1, '24, R.K. Mutt Road, Mylapore, Chennai, TN',        'Subramanian Iyer','+91 98400 11223'),
(5,  6,  'Vikramaditya Rao',  'Male',   '+91 98765 01005', 'student5@amrt.edu',  'B.Tech Mech',4, 'Plot 88, Banjara Hills, Hyderabad, Telangana',       'Prabhakar Rao',  '+91 98490 33445'),
(6,  7,  'Sneha Kulkarni',    'Female', '+91 98765 01006', 'student6@amrt.edu',  'MBA',        2, 'C-3, Model Colony, Shivajinagar, Pune, Maharashtra','Dileep Kulkarni', '+91 98220 55667'),
(7,  8,  'Aditya Deshmukh',   'Male',   '+91 98765 01007', 'student7@amrt.edu',  'B.Tech CSE', 2, '45/2, Ring Road, Nagpur, Maharashtra',               'Sunil Deshmukh', '+91 98230 77889'),
(8,  9,  'Tanvi Sengupta',    'Female', '+91 98765 01008', 'student8@amrt.edu',  'B.Tech IT',  4, 'Salt Lake Sector 2, Kolkata, West Bengal',          'Debashis Sengupta','+91 98300 99001'),
(9,  10, 'Kabir Malhotra',    'Male',   '+91 98765 01009', 'student9@amrt.edu',  'B.Tech ECE', 3, '78, Civil Lines, Jaipur, Rajasthan',                 'Rajeev Malhotra','+91 94140 22334'),
(10, 11, 'Ishita Banerjee',   'Female', '+91 98765 01010', 'student10@amrt.edu', 'B.Tech CSE', 1, 'Lake Gardens, Kolkata, West Bengal',                'Amit Banerjee',  '+91 98310 44556'),
(11, 12, 'Harsh Vardhan',     'Male',   '+91 98765 01011', 'student11@amrt.edu', 'B.Tech Civil',2, 'Aliganj Sector B, Lucknow, UP',                     'Virendra Singh', '+91 94150 66778'),
(12, 13, 'Rhea Chawla',       'Female', '+91 98765 01012', 'student12@amrt.edu', 'MBA',        1, 'Vasant Kunj Pocket C, New Delhi',                  'Ashok Chawla',   '+91 98110 88990');

-- =============================================================================
-- 3. SEED ROOMS
-- (12 Rooms across Blocks A, B, C; Floors 1, 2, 3)
-- =============================================================================
INSERT INTO `rooms` (`room_id`, `room_number`, `block`, `floor`, `room_type`, `capacity`, `occupied`, `rent`, `status`) VALUES
(1,  'A-101', 'A', 1, 'Single',       1, 1, 8500.00, 'Full'),
(2,  'A-102', 'A', 1, 'Double',       2, 2, 6000.00, 'Full'),
(3,  'A-201', 'A', 2, 'Double',       2, 1, 6000.00, 'Available'),
(4,  'A-202', 'A', 2, 'Triple',       3, 2, 4500.00, 'Available'),
(5,  'A-301', 'A', 3, 'Single',       1, 0, 8500.00, 'Available'),
(6,  'B-101', 'B', 1, 'Single',       1, 1, 8500.00, 'Full'),
(7,  'B-102', 'B', 1, 'Double',       2, 0, 6000.00, 'Available'),
(8,  'B-201', 'B', 2, 'Triple',       3, 0, 4500.00, 'Available'),
(9,  'B-301', 'B', 3, 'Four-Sharing', 4, 0, 3800.00, 'Maintenance'),
(10, 'C-101', 'C', 1, 'Single',       1, 0, 9000.00, 'Available'),
(11, 'C-102', 'C', 1, 'Double',       2, 0, 6500.00, 'Available'),
(12, 'C-201', 'C', 2, 'Triple',       3, 0, 4800.00, 'Available');

-- =============================================================================
-- 4. SEED ALLOCATIONS
-- Students 1-7 have Active allocations matching room occupancy:
-- A-101 (cap 1, occ 1) -> Student 1
-- A-102 (cap 2, occ 2) -> Student 2, Student 3
-- A-201 (cap 2, occ 1) -> Student 4
-- A-202 (cap 3, occ 2) -> Student 5, Student 6
-- B-101 (cap 1, occ 1) -> Student 7
-- Students 8-9 had past allocations (Vacated)
-- Students 10, 11, 12 are Unallocated (ready for live allocation demo!)
-- =============================================================================
INSERT INTO `allocations` (`allocation_id`, `student_id`, `room_id`, `allocation_date`, `check_in_date`, `check_out_date`, `status`) VALUES
(1, 1, 1, '2026-08-01', '2026-08-01', NULL,         'Active'),
(2, 2, 2, '2026-08-01', '2026-08-01', NULL,         'Active'),
(3, 3, 2, '2026-08-02', '2026-08-02', NULL,         'Active'),
(4, 4, 3, '2026-08-05', '2026-08-06', NULL,         'Active'),
(5, 5, 4, '2026-08-05', '2026-08-05', NULL,         'Active'),
(6, 6, 4, '2026-08-07', '2026-08-08', NULL,         'Active'),
(7, 7, 6, '2026-08-10', '2026-08-10', NULL,         'Active'),
(8, 8, 3, '2026-01-10', '2026-01-10', '2026-06-30', 'Vacated'),
(9, 9, 5, '2026-01-15', '2026-01-15', '2026-07-15', 'Vacated');

-- =============================================================================
-- 5. SEED PAYMENTS
-- Covers Paid, Pending, and Overdue statuses for Stored Procedure viva demo
-- =============================================================================
INSERT INTO `payments` (`payment_id`, `student_id`, `amount`, `payment_date`, `due_date`, `payment_method`, `payment_status`, `transaction_id`) VALUES
(1,  1, 8500.00, '2026-08-02', '2026-08-05', 'UPI',         'Paid',    'TXN_UPI_20260802_001'),
(2,  1, 8500.00, '2026-09-02', '2026-09-05', 'Net Banking','Paid',    'TXN_NB_20260902_002'),
(3,  1, 8500.00, NULL,         '2026-10-05', 'Pending',     'Pending', NULL),
(4,  2, 6000.00, '2026-08-03', '2026-08-05', 'Card',        'Paid',    'TXN_CRD_20260803_003'),
(5,  2, 6000.00, NULL,         '2026-09-05', 'Pending',     'Overdue', NULL),
(6,  3, 6000.00, '2026-08-04', '2026-08-05', 'UPI',         'Paid',    'TXN_UPI_20260804_004'),
(7,  3, 6000.00, '2026-09-03', '2026-09-05', 'UPI',         'Paid',    'TXN_UPI_20260903_005'),
(8,  4, 6000.00, '2026-08-06', '2026-08-10', 'Net Banking','Paid',    'TXN_NB_20260806_006'),
(9,  5, 4500.00, '2026-08-05', '2026-08-10', 'Cash',        'Paid',    'TXN_CSH_20260805_007'),
(10, 6, 4500.00, NULL,         '2026-09-10', 'Pending',     'Pending', NULL),
(11, 7, 8500.00, '2026-08-11', '2026-08-15', 'UPI',         'Paid',    'TXN_UPI_20260811_008');

-- =============================================================================
-- 6. SEED COMPLAINTS
-- Covers Pending, In Progress, and Resolved maintenance issues
-- =============================================================================
INSERT INTO `complaints` (`complaint_id`, `student_id`, `room_id`, `title`, `description`, `complaint_date`, `status`, `resolved_date`) VALUES
(1, 1, 1, 'Study table lamp not functioning', 'The desk electrical outlet and table light have stopped supplying power since yesterday evening.', '2026-09-18', 'Pending', NULL),
(2, 2, 2, 'Bathroom shower faucet leaking',     'Continuous water leakage in shower mixer tap causing water wastage on 1st floor.',             '2026-09-15', 'In Progress', NULL),
(3, 3, 2, 'Wi-Fi access point weak signal',     'Wi-Fi signal drops frequently in the corner of Room A-102 during evening study hours.',          '2026-09-10', 'Resolved', '2026-09-12'),
(4, 5, 4, 'Wardrobe latch jammed',              'The internal sliding lock of wardrobe 2 in Room A-202 is stuck.',                               '2026-09-19', 'Pending', NULL),
(5, 7, 6, 'Air conditioner filter cleaning',    'AC unit in B-101 requires routine seasonal dust cleaning and cooling check.',                   '2026-09-08', 'Resolved', '2026-09-09');

-- =============================================================================
-- 7. SEED VISITORS
-- Realistic guest logs
-- =============================================================================
INSERT INTO `visitors` (`visitor_id`, `student_id`, `visitor_name`, `phone`, `relation`, `visit_date`, `in_time`, `out_time`, `purpose`) VALUES
(1, 1, 'Sanjay Mehta',      '+91 94480 12345', 'Father',  '2026-09-14', '10:30:00', '13:00:00', 'Parental semester visit and fee document submission'),
(2, 2, 'Meenakshi Nair',    '+91 94470 54322', 'Mother',  '2026-09-16', '14:00:00', '16:30:00', 'Family meetup and bringing winter clothing'),
(3, 4, 'Kavya Iyer',        '+91 98400 99887', 'Sister',  '2026-09-20', '11:15:00', '14:45:00', 'Weekend greeting and festival sweets handover'),
(4, 5, 'Rohan Rao',         '+91 98490 11223', 'Brother', '2026-09-21', '16:00:00', '18:15:00', 'Academic project materials handover'),
(5, 7, 'Col. Sunil Deshmukh','+91 98230 77889', 'Uncle',  '2026-09-22', '09:45:00', NULL,       'Local guardian check-in and medical verification');

-- =============================================================================
-- 8. SEED ATTENDANCE
-- Daily hostel logs
-- =============================================================================
INSERT INTO `attendance` (`attendance_id`, `student_id`, `date`, `check_in`, `check_out`) VALUES
(1,  1, '2026-09-21', '21:15:00', '08:30:00'),
(2,  2, '2026-09-21', '21:40:00', '08:45:00'),
(3,  3, '2026-09-21', '20:55:00', '09:00:00'),
(4,  4, '2026-09-21', '21:30:00', '08:20:00'),
(5,  5, '2026-09-21', '22:05:00', '08:50:00'),
(6,  6, '2026-09-21', '21:10:00', '08:15:00'),
(7,  7, '2026-09-21', '21:50:00', '09:10:00'),
(8,  1, '2026-09-22', '21:05:00', '08:30:00'),
(9,  2, '2026-09-22', '21:35:00', '08:40:00'),
(10, 3, '2026-09-22', '21:20:00', '08:55:00'),
(11, 4, '2026-09-22', '21:45:00', '08:25:00'),
(12, 5, '2026-09-22', '21:00:00', '09:00:00');

SET FOREIGN_KEY_CHECKS = 1;
