-- IJITEST Ultimate Database Initialization Script
-- This script contains the complete schema for the IJITEST Editorial Management System.
-- It includes all migrations and schema changes extracted from various .sql and .ts files.

-- 1. Create Users Table (Admins, Editors, Reviewers)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NULL, -- Nullable for pending invitations
    full_name VARCHAR(255),
    designation VARCHAR(255),
    institute VARCHAR(255),
    phone VARCHAR(20),
    bio TEXT,
    photo_url VARCHAR(500),
    role ENUM('admin', 'editor', 'reviewer') DEFAULT 'admin',
    invitation_token VARCHAR(255) UNIQUE NULL,
    invitation_expires TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Volumes and Issues Tracking
CREATE TABLE IF NOT EXISTS volumes_issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    volume_number INT NOT NULL,
    issue_number INT NOT NULL,
    year INT NOT NULL,
    month_range VARCHAR(100), -- e.g., 'Jan - Mar'
    status ENUM('open', 'published') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Submissions Table (Papers)
CREATE TABLE IF NOT EXISTS submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paper_id VARCHAR(50) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    abstract TEXT,
    keywords TEXT,
    author_name VARCHAR(255) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    affiliation TEXT,
    status ENUM('submitted', 'under_review', 'accepted', 'rejected', 'published', 'paid') DEFAULT 'submitted',
    is_free_publish BOOLEAN DEFAULT FALSE,
    file_path VARCHAR(500),
    issue_id INT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (issue_id) REFERENCES volumes_issues(id)
);

-- 4. Peer Review Tracking
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    deadline DATE,
    feedback TEXT,
    feedback_file_path VARCHAR(500),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id)
);

-- 5. Payment Tracking
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status ENUM('unpaid', 'paid', 'verified') DEFAULT 'unpaid',
    transaction_id VARCHAR(255),
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id)
);

-- 6. Contact Messages (Inbox)
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    reply_text TEXT NULL,
    replied_at TIMESTAMP NULL,
    status ENUM('unread', 'read', 'archived') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Join Us Applications (Reviewers/Editors)
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_type ENUM('reviewer', 'editor') NOT NULL DEFAULT 'reviewer',
    full_name VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    institute VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    cv_url VARCHAR(500) NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. System Settings
CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==========================================================
-- INITIAL DATA & SEEDING
-- ==========================================================

-- Initial Settings Data
INSERT INTO settings (setting_key, setting_value) VALUES 
('journal_name', 'International Journal of Innovative Trends in Engineering Science and Technology'),
('journal_short_name', 'IJITEST'),
('issn_number', 'XXXX-XXXX'),
('apc_inr', '2500'),
('apc_usd', '50'),
('publisher_name', 'Felix Academic Publications'),
('apc_description', 'APC covers DOI assignment, long-term hosting, indexing maintenance, and editorial handling. There are no submission or processing charges before acceptance.'),
('template_url', '/docs/template.docx'),
('copyright_url', '/docs/copyright-form.docx')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Initial Volume 1, Issue 1
INSERT INTO volumes_issues (volume_number, issue_number, year, month_range, status)
SELECT 1, 1, 2026, 'Jan - Mar', 'published'
WHERE NOT EXISTS (SELECT 1 FROM volumes_issues WHERE volume_number = 1 AND issue_number = 1 AND year = 2026);

-- Initial Admin Account (Optional/Manual)
-- Note: Replace password_hash with a secure hash if manually inserting.
-- The following corresponds to 'admin@ijitest.org' / 'password_123'
-- INSERT INTO users (email, password_hash, full_name, role) 
-- VALUES ('admin@ijitest.org', '$2a$10$7Z8l9G.V6EaT.W7p5K.E.OaT.W7p5K.E.OaT.W7p5K.E.', 'Admin User', 'admin')
-- ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);
