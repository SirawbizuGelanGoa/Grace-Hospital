-- Database Migration Script for Grace Hospital Website
-- This script fixes common database issues and ensures proper schema

-- Fix site_settings table to use auto-increment ID
-- First, check if the table exists and has the right structure
DESCRIBE site_settings;

-- If the site_settings table has a VARCHAR/TEXT id column, we need to fix it
-- This is a safe migration that preserves data

-- Step 1: Create a backup of existing data (if any)
CREATE TABLE IF NOT EXISTS site_settings_backup AS SELECT * FROM site_settings;

-- Step 2: Drop the existing table (only if it has the wrong schema)
-- Note: Only run this if your site_settings table has a VARCHAR/TEXT id column
-- DROP TABLE IF EXISTS site_settings;

-- Step 3: Create the correct site_settings table structure
CREATE TABLE IF NOT EXISTS site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hospitalName VARCHAR(255) NOT NULL,
    logoUrl TEXT NULL,
    facebookUrl VARCHAR(500) NULL,
    tiktokUrl VARCHAR(500) NULL,
    telegramUrl VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Insert default data if the table is empty
INSERT IGNORE INTO site_settings (id, hospitalName, logoUrl, facebookUrl, tiktokUrl, telegramUrl)
VALUES (1, 'Grace Hospital', NULL, NULL, NULL, NULL);

-- Ensure about_content table has the correct structure
CREATE TABLE IF NOT EXISTS about_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    mission TEXT NOT NULL,
    vision TEXT NOT NULL,
    imageUrl TEXT NULL,
    imageHint VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default about content if empty
INSERT IGNORE INTO about_content (id, title, description, mission, vision, imageUrl, imageHint)
VALUES (1, 'About Grace Hospital', 'Welcome to Grace Hospital, where we provide exceptional healthcare services.', 'Our mission is to provide compassionate, high-quality healthcare to our community.', 'Our vision is to be the leading healthcare provider in the region.', NULL, 'hospital building');

-- Ensure all other tables have proper structure
CREATE TABLE IF NOT EXISTS hero_slides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    src TEXT NOT NULL,
    alt VARCHAR(255) NOT NULL,
    hint VARCHAR(255) NULL,
    title VARCHAR(255) NULL,
    subtitle TEXT NULL,
    ctaLink VARCHAR(500) NULL,
    ctaText VARCHAR(100) NULL,
    position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    detailedDescription TEXT NOT NULL,
    iconName VARCHAR(100) DEFAULT 'HelpCircle',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS facilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    iconName VARCHAR(100) DEFAULT 'Building',
    imageUrl TEXT NULL,
    imageHint VARCHAR(255) NULL,
    detailedDescription TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    iconName VARCHAR(100) NOT NULL,
    detailedDescription TEXT NOT NULL,
    headOfDepartmentImage TEXT NULL,
    headOfDepartmentImageHint VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gallery_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('photo', 'video') NOT NULL,
    src TEXT NOT NULL,
    alt VARCHAR(255) NOT NULL,
    hint VARCHAR(255) NULL,
    position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    summary TEXT NOT NULL,
    fullContent TEXT NOT NULL,
    image TEXT NOT NULL,
    link VARCHAR(255) NOT NULL UNIQUE,
    hint VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NULL,
    email VARCHAR(255) NULL,
    address TEXT NULL,
    emergencyPhone VARCHAR(20) NULL,
    workingHours TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default contact info if empty
INSERT IGNORE INTO contact_info (id, phone, email, address, emergencyPhone, workingHours)
VALUES (1, '+1-234-567-8900', 'info@gracehospital.com', '123 Healthcare Ave, Medical City, MC 12345', '+1-234-567-8911', 'Monday - Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 4:00 PM\nSunday: Emergency only');

-- Clean up any orphaned image references
UPDATE hero_slides SET src = NULL WHERE src LIKE '/uploads/%' AND src NOT IN (
    SELECT CONCAT('/uploads/', filename) FROM (
        SELECT SUBSTRING_INDEX(src, '/', -1) as filename FROM hero_slides WHERE src LIKE '/uploads/%'
    ) as temp
);

-- Show final table structures
SHOW TABLES;

-- Show row counts
SELECT 'site_settings' as table_name, COUNT(*) as row_count FROM site_settings
UNION ALL
SELECT 'about_content', COUNT(*) FROM about_content
UNION ALL
SELECT 'hero_slides', COUNT(*) FROM hero_slides
UNION ALL
SELECT 'services', COUNT(*) FROM services
UNION ALL
SELECT 'facilities', COUNT(*) FROM facilities
UNION ALL
SELECT 'departments', COUNT(*) FROM departments
UNION ALL
SELECT 'gallery_items', COUNT(*) FROM gallery_items
UNION ALL
SELECT 'news_events', COUNT(*) FROM news_events
UNION ALL
SELECT 'contact_info', COUNT(*) FROM contact_info;
