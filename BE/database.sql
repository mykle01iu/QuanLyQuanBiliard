-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 29, 2026 at 02:00 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `billiards_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `billiards_db`;

-- 
-- This file is for reference or initial import if needed, 
-- but Sequelize will auto-sync tables. 
-- Here is some dummy data you can insert after Sequelize creates the tables.
-- 

CREATE TABLE IF NOT EXISTS `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `role` enum('admin','employee') DEFAULT 'employee',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `BilliardTables` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `status` enum('Trống','Đang sử dụng') DEFAULT 'Trống',
  `price_per_hour` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `Services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `category` enum('Nước','Đồ ăn','Combo') NOT NULL,
  `price` int(11) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `Invoices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `total_time` int(11) DEFAULT 0,
  `table_fee` int(11) DEFAULT 0,
  `service_fee` int(11) DEFAULT 0,
  `total_amount` int(11) DEFAULT 0,
  `status` enum('Đang chơi','Đã thanh toán') DEFAULT 'Đang chơi',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `table_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `InvoiceDetails` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` int(11) NOT NULL,
  `total` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `invoice_id` int(11) DEFAULT NULL,
  `service_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert Dummy Users (password is '123456' hashed with bcrypt, round 10)
-- Admin: admin / 123456
-- Employee: nv1 / 123456
INSERT INTO `Users` (`id`, `username`, `password`, `fullname`, `role`, `createdAt`, `updatedAt`) VALUES
(1, 'admin', '$2a$10$E9sA2/x3V1BkVhF/jC4YGuX6ZJ61a29B56I5I3YvB098xG6.b3jE2', 'Quản trị viên', 'admin', NOW(), NOW()),
(2, 'nv1', '$2a$10$E9sA2/x3V1BkVhF/jC4YGuX6ZJ61a29B56I5I3YvB098xG6.b3jE2', 'Nhân viên 1', 'employee', NOW(), NOW());

-- Insert Dummy Tables
INSERT INTO `BilliardTables` (`id`, `name`, `status`, `price_per_hour`, `createdAt`, `updatedAt`) VALUES
(1, 'Bàn 1', 'Trống', 60000, NOW(), NOW()),
(2, 'Bàn 2', 'Trống', 60000, NOW(), NOW()),
(3, 'Bàn 3', 'Trống', 60000, NOW(), NOW()),
(4, 'Bàn 4', 'Trống', 60000, NOW(), NOW()),
(5, 'Bàn VIP 1', 'Trống', 100000, NOW(), NOW()),
(6, 'Bàn VIP 2', 'Trống', 100000, NOW(), NOW());

-- Insert Dummy Services
INSERT INTO `Services` (`id`, `name`, `category`, `price`, `createdAt`, `updatedAt`) VALUES
(1, 'Sting', 'Nước', 15000, NOW(), NOW()),
(2, 'Bò húc', 'Nước', 20000, NOW(), NOW()),
(3, 'Mì xào bò', 'Đồ ăn', 40000, NOW(), NOW()),
(4, 'Cơm chiên dương châu', 'Đồ ăn', 45000, NOW(), NOW()),
(5, 'Combo Sinh viên (2 Sting + 1 Mì xào)', 'Combo', 60000, NOW(), NOW());

COMMIT;
