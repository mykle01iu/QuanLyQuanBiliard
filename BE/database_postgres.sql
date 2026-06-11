-- PostgreSQL version for Render

-- Tạo bảng Users
CREATE TABLE IF NOT EXISTS "Users" (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  fullname VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'employee',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng BilliardTables
CREATE TABLE IF NOT EXISTS "BilliardTables" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'Trống',
  price_per_hour INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng Services
CREATE TABLE IF NOT EXISTS "Services" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price INTEGER NOT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng Invoices
CREATE TABLE IF NOT EXISTS "Invoices" (
  id SERIAL PRIMARY KEY,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP DEFAULT NULL,
  total_time INTEGER DEFAULT 0,
  table_fee INTEGER DEFAULT 0,
  service_fee INTEGER DEFAULT 0,
  total_amount INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Đang chơi',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER DEFAULT NULL,
  table_id INTEGER DEFAULT NULL
);

-- Tạo bảng InvoiceDetails
CREATE TABLE IF NOT EXISTS "InvoiceDetails" (
  id SERIAL PRIMARY KEY,
  quantity INTEGER DEFAULT 1,
  price INTEGER NOT NULL,
  total INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  invoice_id INTEGER DEFAULT NULL,
  service_id INTEGER DEFAULT NULL
);

-- Reset sequences
SELECT setval(pg_get_serial_sequence('"Users"', 'id'), COALESCE(max(id), 0) + 1, false) FROM "Users";
SELECT setval(pg_get_serial_sequence('"BilliardTables"', 'id'), COALESCE(max(id), 0) + 1, false) FROM "BilliardTables";
SELECT setval(pg_get_serial_sequence('"Services"', 'id'), COALESCE(max(id), 0) + 1, false) FROM "Services";
SELECT setval(pg_get_serial_sequence('"Invoices"', 'id'), COALESCE(max(id), 0) + 1, false) FROM "Invoices";
SELECT setval(pg_get_serial_sequence('"InvoiceDetails"', 'id'), COALESCE(max(id), 0) + 1, false) FROM "InvoiceDetails";

-- Insert Users (password: 123456 hashed with bcrypt)
INSERT INTO "Users" (username, password, fullname, role) VALUES
('admin', '$2b$10$QpudyHIjO9xv8.GSU/0Cc.jpGqi1EBA/Gynn7BlVSdb1Qjr/.sh3W', 'Quản trị viên', 'admin'),
('nv1', '$2b$10$QpudyHIjO9xv8.GSU/0Cc.jpGqi1EBA/Gynn7BlVSdb1Qjr/.sh3W', 'Nhân viên 1', 'employee')
ON CONFLICT (username) DO NOTHING;

-- Insert Tables
INSERT INTO "BilliardTables" (name, status, price_per_hour) VALUES
('Bàn 1', 'Trống', 60000),
('Bàn 2', 'Trống', 60000),
('Bàn 3', 'Trống', 60000),
('Bàn 4', 'Trống', 60000),
('Bàn VIP 1', 'Trống', 100000),
('Bàn VIP 2', 'Trống', 100000)
ON CONFLICT DO NOTHING;

-- Insert Services
INSERT INTO "Services" (name, category, price) VALUES
('Sting', 'Nước', 15000),
('Bò húc', 'Nước', 20000),
('Mì xào bò', 'Đồ ăn', 40000),
('Cơm chiên dương châu', 'Đồ ăn', 45000),
('Combo Sinh viên (2 Sting + 1 Mì xào)', 'Combo', 60000)
ON CONFLICT DO NOTHING;
