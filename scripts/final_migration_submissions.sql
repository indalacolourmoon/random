-- ==========================================================
-- 🚀 FINAL CONSOLIDATED MIGRATION SCRIPT (VERIFIED V3)
-- ==========================================================
/*
   Final Audit Checks:
   - ✅ Mapping verified against your _user_id_mapping table.
   - ✅ user_profiles schema aligned with physical table (id, user_id, full_name, institute, etc.).
   - ✅ Main Authors included in submission_authors.
   - ✅ Review assignments linked to correct UUIDs.
*/

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- 1. SETUP ARCHIVE (VOLUME & ISSUE)
-- --------------------------------------------------------
INSERT IGNORE INTO `volumes_issues` (id, volume_number, issue_number, year, month_range, status)
VALUES (1, 1, 1, 2026, 'March', 'published');

-- --------------------------------------------------------
-- 2. CREATE MISSING AUTHORS & PROFILES
-- --------------------------------------------------------
SET @DUMMY_PASS = '$2a$12$M2tKWAune7p18LlnZgnfkecIDlaQvQ6SkhDYrbMiX.9fOAPFpqYVy';

-- [USER 13] Gulshan Sri Babu
SET @USER_13 = 'u13-gulshan-sri-babu-uuid-001';
INSERT IGNORE INTO `users` (id, email, password_hash, role, is_active, is_email_verified)
VALUES (@USER_13, 'gulshansribabu@gmail.com', @DUMMY_PASS, 'author', 1, 1);
INSERT IGNORE INTO `user_profiles` (user_id, full_name, institute, nationality)
VALUES (@USER_13, 'THORLAPATI GULSHAN SRI BABU', 'VIGNAN\'S INSTITUTE OF INFORMATION TECHNOLOGY', 'India');

-- [USER 18] CH M V SUBBARAO
SET @USER_18 = 'u18-subbarao-uuid-002';
INSERT IGNORE INTO `users` (id, email, password_hash, role, is_active, is_email_verified)
VALUES (@USER_18, 'subbaraochappa@gmail.com', @DUMMY_PASS, 'author', 1, 1);
INSERT IGNORE INTO `user_profiles` (user_id, full_name, institute, nationality)
VALUES (@USER_18, 'CH M V SUBBARAO', 'DEPARTMENT OF ECE, JNTU GV', 'India');

-- [USER 19] Mahendra
SET @USER_19 = 'u19-mahendra-uuid-003';
INSERT IGNORE INTO `users` (id, email, password_hash, role, is_active, is_email_verified)
VALUES (@USER_19, 'narlamahendracai@gpcet.ac.in', @DUMMY_PASS, 'author', 1, 1);
INSERT IGNORE INTO `user_profiles` (user_id, full_name, institute, nationality)
VALUES (@USER_19, 'Mahendra', 'Department of CAI, G. Pullaiah College of Engineering and Technology', 'India');

-- --------------------------------------------------------
-- 3. MIGRATE SUBMISSIONS & PUBLICATIONS (METADATA INCLUDED)
-- --------------------------------------------------------
-- Verified UUIDs from your mapping
SET @USER_SWAPNA = '79dd4a83-31c1-11f1-ad3e-c05465fbbdc2';
SET @ADMIN_ID = '79daefad-31c1-11f1-ad3e-c05465fbbdc2';

-- [PAPER 13]
INSERT IGNORE INTO `submissions` (id, paper_id, slug, status, corresponding_author_id, issue_id, submitted_at, updated_at)
VALUES (13, 'IJITEST-2026-001', 'digital-revolution-informatics-industry', 'published', @USER_13, 1, '2026-03-03 13:44:42', '2026-03-30 17:33:17');
INSERT IGNORE INTO `submission_versions` (id, submission_id, version_number, title, abstract, keywords) VALUES
(13, 13, 1, 'Digital Revolution: The Role of Informatics in Industry 4.0 and 5.0', 'The emergence of Industry 5.0 predicts a paradigm shift toward human-centric systems...', 'Industry 4.0, Industry 5.0, Informatics, Automation');
INSERT IGNORE INTO `submission_files` (version_id, file_type, file_url, original_name) VALUES
(13, 'main_manuscript', '/uploads/submissions/manuscript-13-1774891817005.pdf', 'manuscript.pdf');
INSERT IGNORE INTO `publications` (submission_id, issue_id, final_pdf_url, start_page, end_page, published_at)
VALUES (13, 1, '/uploads/published/IJITEST-2026-001-published.pdf', 1, 7, '2026-03-15 22:49:44');
INSERT IGNORE INTO `submission_authors` (submission_id, name, email, is_corresponding, order_index, institution) VALUES
(13, 'THORLAPATI GULSHAN SRI BABU', 'gulshansribabu@gmail.com', 1, 0, 'VIGNAN\'S INSTITUTE OF INFORMATION TECHNOLOGY'),
(13, 'Chekatla Swapna Priya', 'swapnachsp@gmail.com', 0, 1, 'Vignan\'s Institute of Information Technology (A)'),
(13, 'Suseela Kocho', 'jackbenison12@gmail.com', 0, 2, 'Department of school education, India');

-- [PAPER 15]
INSERT IGNORE INTO `submissions` (id, paper_id, slug, status, corresponding_author_id, issue_id, submitted_at, updated_at)
VALUES (15, 'IJITEST-2026-002', 'optimization-ris-integrated-hybrid-precoding', 'published', @USER_SWAPNA, 1, '2026-03-26 15:53:00', '2026-03-30 09:06:12');
INSERT IGNORE INTO `submission_versions` (id, submission_id, version_number, title, abstract, keywords) VALUES
(15, 15, 1, 'Optimization and Performance Evaluation of RIS-Integrated Hybrid Precoding', 'The evolution toward sixth-generation (6G) wireless systems requires high efficiency...', 'Reconfigurable Intelligent Surfaces, mmWave Massive MIMO, 6G Wireless');
INSERT IGNORE INTO `submission_files` (version_id, file_type, file_url, original_name) VALUES
(15, 'main_manuscript', '/uploads/submissions/1774540380450-x26s7q.docx', 'manuscript.docx'),
(15, 'pdf_version', '/uploads/submissions/secure-15-1774669245557.pdf', 'secure.pdf');
INSERT IGNORE INTO `publications` (submission_id, issue_id, final_pdf_url, start_page, end_page, published_at)
VALUES (15, 1, '/uploads/submissions/secure-15-1774669245557.pdf', 8, 15, '2026-03-30 09:06:12');
INSERT IGNORE INTO `submission_authors` (submission_id, name, email, is_corresponding, order_index, institution) VALUES
(15, 'Cheekatla Swapna Priya', 'swapnachsp@gmail.com', 1, 0, 'VIGNAN\'S INSTITUTE OF INFORMATION TECHNOLOGY(A)'),
(15, 'V.N.S.Vijay Kumar', 'vijaykumarlce@gmail.com', 0, 1, 'Vardhaman college of Engineering, Hyderabad');

-- [PAPER 16]
INSERT IGNORE INTO `submissions` (id, paper_id, slug, status, corresponding_author_id, issue_id, submitted_at, updated_at)
VALUES (16, 'IJITEST-2026-003', 'quantum-enabled-security-framework-6g', 'published', @USER_SWAPNA, 1, '2026-03-30 15:28:11', '2026-04-01 15:23:29');
INSERT IGNORE INTO `submission_versions` (id, submission_id, version_number, title, abstract, keywords) VALUES
(16, 16, 1, 'Quantum-Enabled Security Framework for 6G Communications', 'Ultra-high data rates and efficient use of the terahertz spectrum present security challenges...', '5G and 6G wireless communications, Quantum Key Distribution, Network Security');
INSERT IGNORE INTO `submission_files` (version_id, file_type, file_url, original_name) VALUES
(16, 'main_manuscript', '/uploads/submissions/1774884491840-wm8v5k.docx', 'manuscript.docx'),
(16, 'pdf_version', '/uploads/submissions/secure-16-1774888411617.pdf', 'secure.pdf');
INSERT IGNORE INTO `publications` (submission_id, issue_id, final_pdf_url, start_page, end_page, published_at)
VALUES (16, 1, '/uploads/submissions/secure-16-1774888411617.pdf', 16, 22, '2026-04-01 15:23:29');
INSERT IGNORE INTO `submission_authors` (submission_id, name, email, is_corresponding, order_index, institution) VALUES
(16, 'Cheekatla Swapna Priya', 'swapnachsp@gmail.com', 1, 0, 'VIGNANAS INSTITUTE OF INFORMATION TECHNOLOGY'),
(16, 'thorlapati gulshan sribabu', 'gulshansribabu@gmail.com', 0, 1, 'vignan\'s institute of Information technology');

-- [PAPER 18]
INSERT IGNORE INTO `submissions` (id, paper_id, slug, status, corresponding_author_id, issue_id, submitted_at, updated_at)
VALUES (18, 'IJITEST-2026-004', 'energy-efficient-ternary-logic-cntfet', 'published', @USER_18, 1, '2026-04-01 15:44:51', '2026-04-01 15:56:06');
INSERT IGNORE INTO `submission_versions` (id, submission_id, version_number, title, abstract, keywords) VALUES
(18, 18, 1, 'Energy-Efficient Ternary Logic Processor Using CNTFETs', 'The demand for energy-efficient computing has led to explorations beyond binary logic...', 'Ternary Logic Processor, CNTFET, Low-Power Computing');
INSERT IGNORE INTO `submission_files` (version_id, file_type, file_url, original_name) VALUES
(18, 'main_manuscript', '/uploads/submissions/1775058291152-4dzxo9.pdf', 'manuscript.pdf');
INSERT IGNORE INTO `publications` (submission_id, issue_id, final_pdf_url, start_page, end_page, published_at)
VALUES (18, 1, '/uploads/submissions/secure-18-1775058470749.pdf', 23, 30, '2026-04-01 15:56:06');
INSERT IGNORE INTO `submission_authors` (submission_id, name, email, is_corresponding, order_index, institution) VALUES
(18, 'CH M V SUBBARAO', 'subbaraochappa@gmail.com', 1, 0, 'DEPARTMENT OF ECE ,JNTU GV');

-- [PAPER 19]
INSERT IGNORE INTO `submissions` (id, paper_id, slug, status, corresponding_author_id, issue_id, submitted_at, updated_at)
VALUES (19, 'IJITEST-2026-005', 'rnn-cnn-em-gamp-sparse-channel', 'published', @USER_19, 1, '2026-04-01 16:01:53', '2026-04-01 16:10:46');
INSERT IGNORE INTO `submission_versions` (id, submission_id, version_number, title, abstract, keywords) VALUES
(19, 19, 1, 'RNN and CNN–Enhanced EM-GAMP for Sparse Channel Estimation', 'Quantum Compressed Sensing (QCS) is an efficient framework for signal processing...', 'Quantum Compressed Sensing, OMP-based methods, Signal Processing');
INSERT IGNORE INTO `submission_files` (version_id, file_type, file_url, original_name) VALUES
(19, 'main_manuscript', '/uploads/submissions/1775059313407-hpa05k.pdf', 'manuscript.pdf');
INSERT IGNORE INTO `publications` (submission_id, issue_id, final_pdf_url, start_page, end_page, published_at)
VALUES (19, 1, '/uploads/submissions/secure-19-1775059566911.pdf', 31, 38, '2026-04-01 16:10:46');
INSERT IGNORE INTO `submission_authors` (submission_id, name, email, is_corresponding, order_index, institution) VALUES
(19, 'Mahendra', 'narlamahendracai@gpcet.ac.in', 1, 0, 'Department of CAI, G. Pullaiah College of Engineering');

-- --------------------------------------------------------
-- 4. MIGRATE REVIEWS
-- --------------------------------------------------------
SET @REVIEWER_TRB = '79dc1011-31c1-11f1-ad3e-c05465fbbdc2';
SET @REVIEWER_MANOHAR = '79dcbb44-31c1-11f1-ad3e-c05465fbbdc2';

INSERT IGNORE INTO `review_assignments` (id, submission_id, reviewer_id, version_id, assigned_by, status, assigned_at)
VALUES (4, 13, @REVIEWER_TRB, 13, @ADMIN_ID, 'completed', '2026-03-10 16:30:17');
INSERT IGNORE INTO `reviews` (assignment_id, decision, comments_to_author, created_at, submitted_at)
VALUES (4, 'accept', 'accepted if modify the minor reviews', '2026-03-10 16:30:17', '2026-03-10 16:30:17');

-- Review for Paper 15 (Manohar)
INSERT IGNORE INTO `review_assignments` (id, submission_id, reviewer_id, version_id, assigned_by, status, assigned_at)
VALUES (5, 15, @REVIEWER_MANOHAR, 15, @ADMIN_ID, 'completed', '2026-03-28 03:40:45');
INSERT IGNORE INTO `reviews` (assignment_id, decision, comments_to_author, created_at, submitted_at)
VALUES (5, 'accept', 'The integration of RIS with hybrid precoding shows promising results...', '2026-03-28 03:40:45', '2026-03-28 03:40:45');

-- --------------------------------------------------------
-- 5. MIGRATE PAYMENTS
-- --------------------------------------------------------
INSERT IGNORE INTO `payments` (submission_id, amount, status, transaction_id, paid_at, created_at) VALUES
(13, 2000.00, 'paid', 'order_SPaqo2m3n7KLO4', '2026-03-14 07:58:23', '2026-03-10 16:42:52'),
(15, 0.00, 'waived', NULL, '2026-03-30 09:06:12', '2026-03-30 09:05:40'),
(16, 0.00, 'waived', NULL, '2026-04-01 15:23:29', '2026-04-01 15:22:56'),
(18, 0.00, 'waived', NULL, '2026-04-01 15:56:06', '2026-04-01 15:55:46'),
(19, 0.00, 'waived', NULL, '2026-04-01 16:10:46', '2026-04-01 16:10:41');

SET FOREIGN_KEY_CHECKS = 1;
