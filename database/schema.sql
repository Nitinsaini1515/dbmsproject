-- =============================================================================
-- AMRT Accommodation Management System - Database Schema (MySQL 8.x)
-- College DBMS Project Specification (Normalized to 3NF, Views, Stored Procedures)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `amrt_accommodation`;
USE `amrt_accommodation`;

-- Disable foreign key checks during schema creation
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables, views, and procedures if any
DROP VIEW IF EXISTS `active_allocations_view`;
DROP PROCEDURE IF EXISTS `GetStudentPaymentHistory`;
DROP TABLE IF EXISTS `attendance`;
DROP TABLE IF EXISTS `visitors`;
DROP TABLE IF EXISTS `complaints`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `allocations`;
DROP TABLE IF EXISTS `rooms`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `users`;

-- =============================================================================
-- 1. USERS TABLE (Authentication & Role Base)
-- =============================================================================
CREATE TABLE `users` (
    `user_id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'student') NOT NULL DEFAULT 'student',
    `phone` VARCHAR(20) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_user_email` (`email`),
    INDEX `idx_user_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 2. STUDENTS TABLE (Academic Profile & Guardian Details)
-- Normalized 1-to-1 extension of users for student profiles
-- =============================================================================
CREATE TABLE `students` (
    `student_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `name` VARCHAR(100) NOT NULL,
    `gender` ENUM('Male', 'Female', 'Other') NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `course` VARCHAR(100) NOT NULL,
    `year` INT NOT NULL CHECK (`year` BETWEEN 1 AND 5),
    `address` TEXT NOT NULL,
    `guardian_name` VARCHAR(100) NOT NULL,
    `guardian_phone` VARCHAR(20) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_student_course` (`course`),
    INDEX `idx_student_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 3. ROOMS TABLE (Hostel Accommodation Inventory)
-- Includes CHECK constraints for capacity and occupancy integrity
-- =============================================================================
CREATE TABLE `rooms` (
    `room_id` INT AUTO_INCREMENT PRIMARY KEY,
    `room_number` VARCHAR(20) NOT NULL UNIQUE,
    `block` VARCHAR(20) NOT NULL,
    `floor` INT NOT NULL,
    `room_type` ENUM('Single', 'Double', 'Triple', 'Four-Sharing') NOT NULL,
    `capacity` INT NOT NULL CHECK (`capacity` > 0),
    `occupied` INT NOT NULL DEFAULT 0,
    `rent` DECIMAL(10,2) NOT NULL CHECK (`rent` >= 0),
    `status` ENUM('Available', 'Full', 'Maintenance') NOT NULL DEFAULT 'Available',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_room_occupancy_positive` CHECK (`occupied` >= 0),
    CONSTRAINT `chk_room_occupancy_limit` CHECK (`occupied` <= `capacity`),
    INDEX `idx_room_status` (`status`),
    INDEX `idx_room_block` (`block`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 4. ALLOCATIONS TABLE (Hostel Room Assignments)
-- Junction tracking active vs historical student room tenancies
-- =============================================================================
CREATE TABLE `allocations` (
    `allocation_id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT NOT NULL,
    `room_id` INT NOT NULL,
    `allocation_date` DATE NOT NULL,
    `check_in_date` DATE NOT NULL,
    `check_out_date` DATE NULL,
    `status` ENUM('Active', 'Vacated') NOT NULL DEFAULT 'Active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (`room_id`) REFERENCES `rooms`(`room_id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_alloc_status` (`status`),
    INDEX `idx_alloc_student` (`student_id`),
    INDEX `idx_alloc_room` (`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5. PAYMENTS TABLE (Hostel Rent & Fee Invoices)
-- =============================================================================
CREATE TABLE `payments` (
    `payment_id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT NOT NULL,
    `amount` DECIMAL(10,2) NOT NULL CHECK (`amount` > 0),
    `payment_date` DATE NULL,
    `due_date` DATE NOT NULL,
    `payment_method` ENUM('Cash', 'UPI', 'Net Banking', 'Card', 'Pending') NOT NULL DEFAULT 'Pending',
    `payment_status` ENUM('Paid', 'Pending', 'Overdue') NOT NULL DEFAULT 'Pending',
    `transaction_id` VARCHAR(100) UNIQUE NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_pay_status` (`payment_status`),
    INDEX `idx_pay_student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 6. COMPLAINTS TABLE (Hostel Maintenance & Grievances)
-- =============================================================================
CREATE TABLE `complaints` (
    `complaint_id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT NOT NULL,
    `room_id` INT NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `complaint_date` DATE NOT NULL,
    `status` ENUM('Pending', 'In Progress', 'Resolved') NOT NULL DEFAULT 'Pending',
    `resolved_date` DATE NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`room_id`) REFERENCES `rooms`(`room_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_complaint_status` (`status`),
    INDEX `idx_complaint_student` (`student_id`),
    INDEX `idx_complaint_room` (`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 7. VISITORS TABLE (Hostel Visitor Security Register)
-- =============================================================================
CREATE TABLE `visitors` (
    `visitor_id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT NOT NULL,
    `visitor_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `relation` VARCHAR(50) NOT NULL,
    `visit_date` DATE NOT NULL,
    `in_time` TIME NOT NULL,
    `out_time` TIME NULL,
    `purpose` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_visitor_student` (`student_id`),
    INDEX `idx_visitor_date` (`visit_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 8. ATTENDANCE TABLE (Daily Hostel In-Out Tracking)
-- =============================================================================
CREATE TABLE `attendance` (
    `attendance_id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT NOT NULL,
    `date` DATE NOT NULL,
    `check_in` TIME NULL,
    `check_out` TIME NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uniq_student_attendance_date` (`student_id`, `date`),
    FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_attendance_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 9. DATABASE VIEW: active_allocations_view
-- Demonstrates multi-table INNER JOIN, eliminating redundant join queries in reports
-- =============================================================================
CREATE OR REPLACE VIEW `active_allocations_view` AS
SELECT 
    a.`allocation_id`,
    a.`student_id`,
    s.`name` AS `student_name`,
    s.`email` AS `student_email`,
    s.`phone` AS `student_phone`,
    s.`course`,
    s.`year`,
    s.`gender`,
    r.`room_id`,
    r.`room_number`,
    r.`block`,
    r.`floor`,
    r.`room_type`,
    r.`capacity`,
    r.`occupied`,
    r.`rent`,
    a.`allocation_date`,
    a.`check_in_date`,
    a.`status` AS `allocation_status`
FROM `allocations` a
INNER JOIN `students` s ON a.`student_id` = s.`student_id`
INNER JOIN `rooms` r ON a.`room_id` = r.`room_id`
WHERE a.`status` = 'Active';

-- =============================================================================
-- 10. STORED PROCEDURE: GetStudentPaymentHistory
-- Demonstrates DBMS Stored Procedures, Parameters, Control flow & Aggregations
-- =============================================================================
DELIMITER $$

CREATE PROCEDURE `GetStudentPaymentHistory`(IN p_student_id INT)
BEGIN
    -- Query 1: Individual Payment Records for the requested student
    SELECT 
        `payment_id`,
        `student_id`,
        `amount`,
        `payment_date`,
        `due_date`,
        `payment_method`,
        `payment_status`,
        `transaction_id`,
        `created_at`
    FROM `payments`
    WHERE `student_id` = p_student_id
    ORDER BY `due_date` DESC;

    -- Query 2: Aggregate Financial Summary
    SELECT 
        COUNT(*) AS `total_invoices`,
        COALESCE(SUM(CASE WHEN `payment_status` = 'Paid' THEN `amount` ELSE 0 END), 0) AS `total_paid`,
        COALESCE(SUM(CASE WHEN `payment_status` IN ('Pending', 'Overdue') THEN `amount` ELSE 0 END), 0) AS `total_pending`,
        COUNT(CASE WHEN `payment_status` = 'Overdue' THEN 1 END) AS `overdue_count`
    FROM `payments`
    WHERE `student_id` = p_student_id;
END$$

DELIMITER ;
