-- ============================================================
--  Flipkart Clone — Database Setup Script
--  Run: mysql -u root -p < setup.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS flipkart_clone
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE flipkart_clone;

CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(100)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  is_verified BOOLEAN       DEFAULT FALSE,
  otp         VARCHAR(6)    DEFAULT NULL,
  otp_expiry  DATETIME      DEFAULT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Optional: verify structure
DESCRIBE users;
