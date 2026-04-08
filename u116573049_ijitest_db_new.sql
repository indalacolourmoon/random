-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 08, 2026 at 02:30 PM
-- Server version: 12.3.1-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u116573049_ijitest_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` varchar(255) NOT NULL,
  `action` varchar(100) NOT NULL,
  `performed_by` varchar(36) DEFAULT NULL,
  `metadata` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `id` int(11) NOT NULL,
  `type` enum('reviewer','editor') NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `designation` varchar(255) NOT NULL,
  `institute` varchar(255) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `reviewed_by` varchar(36) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `cv_url` varchar(500) DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `application_interests`
--

CREATE TABLE `application_interests` (
  `id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `interest_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `status` enum('pending','resolved','archived') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `name`, `email`, `subject`, `message`, `status`, `created_at`) VALUES
(1, 'moahn', 'indalamohankumar@gmail.com', 'test subject dsfdsf df', 'sdfdsf,mn,msd', 'pending', '2026-04-07 14:46:15'),
(2, 'maohan', 'indalamohankumar@gmail.com', 'test  for contact', 'a  test for message submission ', 'pending', '2026-04-07 15:15:50');

-- --------------------------------------------------------

--
-- Table structure for table `master_interests`
--

CREATE TABLE `master_interests` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `type` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `action_link` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `submission_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'INR',
  `status` enum('pending','paid','verified','failed','waived') NOT NULL DEFAULT 'pending',
  `provider` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `submission_id`, `amount`, `currency`, `status`, `provider`, `transaction_id`, `paid_at`, `created_at`) VALUES
(1, 13, 2000.00, 'INR', 'paid', NULL, 'order_SPaqo2m3n7KLO4', '2026-03-14 07:58:23', '2026-03-10 16:42:52'),
(2, 15, 0.00, 'INR', 'waived', NULL, NULL, '2026-03-30 09:06:12', '2026-03-30 09:05:40'),
(3, 16, 0.00, 'INR', 'waived', NULL, NULL, '2026-04-01 15:23:29', '2026-04-01 15:22:56'),
(4, 18, 0.00, 'INR', 'waived', NULL, NULL, '2026-04-01 15:56:06', '2026-04-01 15:55:46'),
(5, 19, 0.00, 'INR', 'waived', NULL, NULL, '2026-04-01 16:10:46', '2026-04-01 16:10:41');

-- --------------------------------------------------------

--
-- Table structure for table `publications`
--

CREATE TABLE `publications` (
  `id` int(11) NOT NULL,
  `submission_id` int(11) NOT NULL,
  `issue_id` int(11) NOT NULL,
  `final_pdf_url` varchar(500) NOT NULL,
  `start_page` int(11) DEFAULT NULL,
  `end_page` int(11) DEFAULT NULL,
  `doi` varchar(100) DEFAULT NULL,
  `published_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `publications`
--

INSERT INTO `publications` (`id`, `submission_id`, `issue_id`, `final_pdf_url`, `start_page`, `end_page`, `doi`, `published_at`) VALUES
(1, 13, 1, '/uploads/published/IJITEST-2026-001-published.pdf', 1, 7, NULL, '2026-03-15 22:49:44'),
(2, 15, 1, '/uploads/submissions/secure-15-1774669245557.pdf', 8, 15, NULL, '2026-03-30 09:06:12'),
(3, 16, 1, '/uploads/submissions/secure-16-1774888411617.pdf', 16, 22, NULL, '2026-04-01 15:23:29'),
(4, 18, 1, '/uploads/submissions/secure-18-1775058470749.pdf', 23, 30, NULL, '2026-04-01 15:56:06'),
(5, 19, 1, '/uploads/submissions/secure-19-1775059566911.pdf', 31, 38, NULL, '2026-04-01 16:10:46');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `decision` enum('accept','minor_revision','major_revision','reject') NOT NULL,
  `score` int(11) DEFAULT NULL,
  `confidence` int(11) DEFAULT NULL,
  `comments_to_author` text DEFAULT NULL,
  `comments_to_editor` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `submitted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `assignment_id`, `decision`, `score`, `confidence`, `comments_to_author`, `comments_to_editor`, `created_at`, `submitted_at`) VALUES
(2, 4, 'accept', NULL, NULL, 'accepted if modify the minor reviews', NULL, '2026-03-10 16:30:17', '2026-03-10 16:30:17'),
(3, 5, 'accept', NULL, NULL, 'The integration of RIS with hybrid precoding shows promising results...', NULL, '2026-03-28 03:40:45', '2026-03-28 03:40:45');

-- --------------------------------------------------------

--
-- Table structure for table `review_assignments`
--

CREATE TABLE `review_assignments` (
  `id` int(11) NOT NULL,
  `submission_id` int(11) NOT NULL,
  `reviewer_id` varchar(36) NOT NULL,
  `version_id` int(11) NOT NULL,
  `assigned_by` varchar(36) NOT NULL,
  `review_round` int(11) NOT NULL DEFAULT 1,
  `status` enum('assigned','accepted','declined','completed') NOT NULL DEFAULT 'assigned',
  `deadline` date DEFAULT NULL,
  `assigned_at` timestamp NULL DEFAULT current_timestamp(),
  `responded_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `review_assignments`
--

INSERT INTO `review_assignments` (`id`, `submission_id`, `reviewer_id`, `version_id`, `assigned_by`, `review_round`, `status`, `deadline`, `assigned_at`, `responded_at`) VALUES
(4, 13, '79dc1011-31c1-11f1-ad3e-c05465fbbdc2', 13, '79daefad-31c1-11f1-ad3e-c05465fbbdc2', 1, 'completed', NULL, '2026-03-10 16:30:17', NULL),
(5, 15, '79dcbb44-31c1-11f1-ad3e-c05465fbbdc2', 15, '79daefad-31c1-11f1-ad3e-c05465fbbdc2', 1, 'completed', NULL, '2026-03-28 03:40:45', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`setting_key`, `setting_value`, `updated_at`) VALUES
('apc_description', 'APC covers DOI assignment, long-term hosting, indexing maintenance, and editorial handling. There are no submission or processing charges before acceptance.', '2026-04-01 19:17:58'),
('apc_inr', '0', '2026-04-01 19:17:58'),
('apc_usd', '0', '2026-04-01 19:17:58'),
('copyright_url', '/docs/copyright-form.docx', '2026-04-01 19:17:58'),
('is_promotion_active', 'true', '2026-04-01 19:17:58'),
('issn_number', 'XXXX-XXXX', '2026-04-01 19:17:58'),
('journal_name', 'International Journal of Innovative Trends in Engineering Science and Technology', '2026-04-01 19:17:58'),
('journal_short_name', 'IJITEST', '2026-04-01 19:17:58'),
('office_address', 'Felix Academic Publications, Madhurawada, Visakhapatnam, AP, India', '2026-04-01 19:17:59'),
('publisher_name', 'Felix Academic Publications', '2026-04-01 19:17:59'),
('submission_sequence_2026', '1', '2026-04-07 13:38:29'),
('support_email', 'support@ijitest.org', '2026-04-01 19:17:59'),
('support_phone', '+91 8919643590', '2026-04-01 19:17:59'),
('template_url', '/docs/template-url.docx', '2026-04-01 19:17:59');

-- --------------------------------------------------------

--
-- Table structure for table `submissions`
--

CREATE TABLE `submissions` (
  `id` int(11) NOT NULL,
  `paper_id` varchar(100) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `status` enum('submitted','editor_assigned','under_review','revision_requested','accepted','rejected','payment_pending','published') NOT NULL DEFAULT 'submitted',
  `final_decision` enum('accept','reject','withdrawn') DEFAULT NULL,
  `decision_at` timestamp NULL DEFAULT NULL,
  `decision_by` varchar(36) DEFAULT NULL,
  `corresponding_author_id` varchar(36) NOT NULL,
  `issue_id` int(11) DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `submissions`
--

INSERT INTO `submissions` (`id`, `paper_id`, `slug`, `status`, `final_decision`, `decision_at`, `decision_by`, `corresponding_author_id`, `issue_id`, `submitted_at`, `updated_at`, `deleted_at`) VALUES
(13, 'IJITEST-2026-001', 'digital-revolution-informatics-industry', 'published', NULL, NULL, NULL, 'u13-gulshan-sri-babu-uuid-001', 1, '2026-03-03 13:44:42', '2026-03-30 17:33:17', NULL),
(15, 'IJITEST-2026-002', 'optimization-ris-integrated-hybrid-precoding', 'published', NULL, NULL, NULL, '79dd4a83-31c1-11f1-ad3e-c05465fbbdc2', 1, '2026-03-26 15:53:00', '2026-03-30 09:06:12', NULL),
(16, 'IJITEST-2026-003', 'quantum-enabled-security-framework-6g', 'published', NULL, NULL, NULL, '79dd4a83-31c1-11f1-ad3e-c05465fbbdc2', 1, '2026-03-30 15:28:11', '2026-04-01 15:23:29', NULL),
(18, 'IJITEST-2026-004', 'energy-efficient-ternary-logic-cntfet', 'published', NULL, NULL, NULL, 'u18-subbarao-uuid-002', 1, '2026-04-01 15:44:51', '2026-04-01 15:56:06', NULL),
(19, 'IJITEST-2026-005', 'rnn-cnn-em-gamp-sparse-channel', 'published', NULL, NULL, NULL, 'u19-mahendra-uuid-003', 1, '2026-04-01 16:01:53', '2026-04-01 16:10:46', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `submission_authors`
--

CREATE TABLE `submission_authors` (
  `id` int(11) NOT NULL,
  `submission_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `is_corresponding` tinyint(1) NOT NULL DEFAULT 0,
  `order_index` int(11) NOT NULL DEFAULT 0,
  `phone` varchar(20) DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `institution` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `submission_authors`
--

INSERT INTO `submission_authors` (`id`, `submission_id`, `name`, `email`, `is_corresponding`, `order_index`, `phone`, `designation`, `institution`) VALUES
(3, 13, 'THORLAPATI GULSHAN SRI BABU', 'gulshansribabu@gmail.com', 1, 0, NULL, NULL, 'VIGNAN\'S INSTITUTE OF INFORMATION TECHNOLOGY'),
(4, 13, 'Chekatla Swapna Priya', 'swapnachsp@gmail.com', 0, 1, NULL, NULL, 'Vignan\'s Institute of Information Technology (A)'),
(5, 13, 'Suseela Kocho', 'jackbenison12@gmail.com', 0, 2, NULL, NULL, 'Department of school education, India'),
(6, 15, 'Cheekatla Swapna Priya', 'swapnachsp@gmail.com', 1, 0, NULL, NULL, 'VIGNAN\'S INSTITUTE OF INFORMATION TECHNOLOGY(A)'),
(7, 15, 'V.N.S.Vijay Kumar', 'vijaykumarlce@gmail.com', 0, 1, NULL, NULL, 'Vardhaman college of Engineering, Hyderabad'),
(8, 16, 'Cheekatla Swapna Priya', 'swapnachsp@gmail.com', 1, 0, NULL, NULL, 'VIGNANAS INSTITUTE OF INFORMATION TECHNOLOGY'),
(9, 16, 'thorlapati gulshan sribabu', 'gulshansribabu@gmail.com', 0, 1, NULL, NULL, 'vignan\'s institute of Information technology'),
(10, 18, 'CH M V SUBBARAO', 'subbaraochappa@gmail.com', 1, 0, NULL, NULL, 'DEPARTMENT OF ECE ,JNTU GV'),
(11, 19, 'Mahendra', 'narlamahendracai@gpcet.ac.in', 1, 0, NULL, NULL, 'Department of CAI, G. Pullaiah College of Engineering'),
(12, 13, 'THORLAPATI GULSHAN SRI BABU', 'gulshansribabu@gmail.com', 1, 0, NULL, NULL, 'VIGNAN\'S INSTITUTE OF INFORMATION TECHNOLOGY'),
(13, 13, 'Chekatla Swapna Priya', 'swapnachsp@gmail.com', 0, 1, NULL, NULL, 'Vignan\'s Institute of Information Technology (A)'),
(14, 13, 'Suseela Kocho', 'jackbenison12@gmail.com', 0, 2, NULL, NULL, 'Department of school education, India'),
(15, 15, 'Cheekatla Swapna Priya', 'swapnachsp@gmail.com', 1, 0, NULL, NULL, 'VIGNAN\'S INSTITUTE OF INFORMATION TECHNOLOGY(A)'),
(16, 15, 'V.N.S.Vijay Kumar', 'vijaykumarlce@gmail.com', 0, 1, NULL, NULL, 'Vardhaman college of Engineering, Hyderabad'),
(17, 16, 'Cheekatla Swapna Priya', 'swapnachsp@gmail.com', 1, 0, NULL, NULL, 'VIGNANAS INSTITUTE OF INFORMATION TECHNOLOGY'),
(18, 16, 'thorlapati gulshan sribabu', 'gulshansribabu@gmail.com', 0, 1, NULL, NULL, 'vignan\'s institute of Information technology'),
(19, 18, 'CH M V SUBBARAO', 'subbaraochappa@gmail.com', 1, 0, NULL, NULL, 'DEPARTMENT OF ECE ,JNTU GV'),
(20, 19, 'Mahendra', 'narlamahendracai@gpcet.ac.in', 1, 0, NULL, NULL, 'Department of CAI, G. Pullaiah College of Engineering');

-- --------------------------------------------------------

--
-- Table structure for table `submission_editors`
--

CREATE TABLE `submission_editors` (
  `submission_id` int(11) NOT NULL,
  `editor_id` varchar(36) NOT NULL,
  `assigned_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `submission_files`
--

CREATE TABLE `submission_files` (
  `id` int(11) NOT NULL,
  `version_id` int(11) NOT NULL,
  `file_type` enum('main_manuscript','pdf_version','copyright_form','supplementary','feedback','payment_proof') NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `submission_files`
--

INSERT INTO `submission_files` (`id`, `version_id`, `file_type`, `file_url`, `original_name`, `file_size`, `created_at`) VALUES
(4, 13, 'main_manuscript', '/uploads/submissions/manuscript-13-1774891817005.pdf', 'manuscript.pdf', NULL, '2026-04-08 14:24:12'),
(5, 15, 'main_manuscript', '/uploads/submissions/1774540380450-x26s7q.docx', 'manuscript.docx', NULL, '2026-04-08 14:24:12'),
(6, 15, 'pdf_version', '/uploads/submissions/secure-15-1774669245557.pdf', 'secure.pdf', NULL, '2026-04-08 14:24:12'),
(7, 16, 'main_manuscript', '/uploads/submissions/1774884491840-wm8v5k.docx', 'manuscript.docx', NULL, '2026-04-08 14:24:12'),
(8, 16, 'pdf_version', '/uploads/submissions/secure-16-1774888411617.pdf', 'secure.pdf', NULL, '2026-04-08 14:24:12'),
(9, 18, 'main_manuscript', '/uploads/submissions/1775058291152-4dzxo9.pdf', 'manuscript.pdf', NULL, '2026-04-08 14:24:12'),
(10, 19, 'main_manuscript', '/uploads/submissions/1775059313407-hpa05k.pdf', 'manuscript.pdf', NULL, '2026-04-08 14:24:12'),
(11, 13, 'main_manuscript', '/uploads/submissions/manuscript-13-1774891817005.pdf', 'manuscript.pdf', NULL, '2026-04-08 14:25:58'),
(12, 15, 'main_manuscript', '/uploads/submissions/1774540380450-x26s7q.docx', 'manuscript.docx', NULL, '2026-04-08 14:25:58'),
(13, 15, 'pdf_version', '/uploads/submissions/secure-15-1774669245557.pdf', 'secure.pdf', NULL, '2026-04-08 14:25:58'),
(14, 16, 'main_manuscript', '/uploads/submissions/1774884491840-wm8v5k.docx', 'manuscript.docx', NULL, '2026-04-08 14:25:58'),
(15, 16, 'pdf_version', '/uploads/submissions/secure-16-1774888411617.pdf', 'secure.pdf', NULL, '2026-04-08 14:25:58'),
(16, 18, 'main_manuscript', '/uploads/submissions/1775058291152-4dzxo9.pdf', 'manuscript.pdf', NULL, '2026-04-08 14:25:58'),
(17, 19, 'main_manuscript', '/uploads/submissions/1775059313407-hpa05k.pdf', 'manuscript.pdf', NULL, '2026-04-08 14:25:58');

-- --------------------------------------------------------

--
-- Table structure for table `submission_versions`
--

CREATE TABLE `submission_versions` (
  `id` int(11) NOT NULL,
  `submission_id` int(11) NOT NULL,
  `version_number` int(11) NOT NULL DEFAULT 1,
  `title` text NOT NULL,
  `abstract` text DEFAULT NULL,
  `keywords` text DEFAULT NULL,
  `subject_area` varchar(255) DEFAULT NULL,
  `changelog` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `submission_versions`
--

INSERT INTO `submission_versions` (`id`, `submission_id`, `version_number`, `title`, `abstract`, `keywords`, `subject_area`, `changelog`, `created_at`) VALUES
(13, 13, 1, 'Digital Revolution: The Role of Informatics in Industry 4.0 and 5.0', 'The emergence of Industry 5.0 predicts a paradigm shift toward human-centric systems...', 'Industry 4.0, Industry 5.0, Informatics, Automation', NULL, NULL, '2026-04-08 14:24:12'),
(15, 15, 1, 'Optimization and Performance Evaluation of RIS-Integrated Hybrid Precoding', 'The evolution toward sixth-generation (6G) wireless systems requires high efficiency...', 'Reconfigurable Intelligent Surfaces, mmWave Massive MIMO, 6G Wireless', NULL, NULL, '2026-04-08 14:24:12'),
(16, 16, 1, 'Quantum-Enabled Security Framework for 6G Communications', 'Ultra-high data rates and efficient use of the terahertz spectrum present security challenges...', '5G and 6G wireless communications, Quantum Key Distribution, Network Security', NULL, NULL, '2026-04-08 14:24:12'),
(18, 18, 1, 'Energy-Efficient Ternary Logic Processor Using CNTFETs', 'The demand for energy-efficient computing has led to explorations beyond binary logic...', 'Ternary Logic Processor, CNTFET, Low-Power Computing', NULL, NULL, '2026-04-08 14:24:12'),
(19, 19, 1, 'RNN and CNN–Enhanced EM-GAMP for Sparse Channel Estimation', 'Quantum Compressed Sensing (QCS) is an efficient framework for signal processing...', 'Quantum Compressed Sensing, OMP-based methods, Signal Processing', NULL, NULL, '2026-04-08 14:24:12');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` enum('admin','editor','reviewer','author') NOT NULL DEFAULT 'author',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `has_seen_promotion` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `role`, `is_active`, `is_email_verified`, `email_verified_at`, `created_at`, `updated_at`, `deleted_at`, `has_seen_promotion`) VALUES
('79daefad-31c1-11f1-ad3e-c05465fbbdc2', 'editor@ijitest.org', '$2b$10$HpElpKNYCXaqdUpivIxWA.CLDniLlVW/GIb7VyiDv4Syl3WsKsdqy', 'admin', 1, 0, NULL, '2026-02-04 12:30:42', '2026-04-06 18:44:07', NULL, 1),
('79db5a7a-31c1-11f1-ad3e-c05465fbbdc2', 'indalamohankumar@gmail.com', '$2b$10$2nF2wRdIXIfGGFeFYJHYtOhuyufINNFC/pvZr/bAftSh6l4mql3H2', 'reviewer', 1, 0, NULL, '2026-02-06 14:08:13', '2026-04-07 17:29:28', NULL, 0),
('79dbcba4-31c1-11f1-ad3e-c05465fbbdc2', 'indalamohankumar21@gmail.com', '$2b$10$m6iHhngwesUoMWr/iPAuaepnWyTSiWv7ubOwAnVl0jwdzHdiICDAa', 'editor', 1, 0, NULL, '2026-02-06 14:24:33', '2026-04-06 14:04:06', NULL, 0),
('79dc1011-31c1-11f1-ad3e-c05465fbbdc2', 'razh1976@gmail.com', '$2b$10$82mvRvTC4qGrcZWaIxe37eAvSGyfLNu45aKuiogg29q1NRLGZgMRa', 'reviewer', 1, 0, NULL, '2026-02-14 15:49:00', '2026-04-06 14:04:06', NULL, 0),
('79dc7b1c-31c1-11f1-ad3e-c05465fbbdc2', 'somasekhar.ece@anits.edu.in', '$2b$10$p83k/rGRp24YN44Uao3xFeLoYFHfEZna9pY8sg5qdq2jShzvXRK/W', 'editor', 1, 0, NULL, '2026-02-15 12:22:35', '2026-04-06 14:04:06', NULL, 0),
('79dcbb44-31c1-11f1-ad3e-c05465fbbdc2', 'manohar@gvpcdpgc.edu.in', '$2b$10$AD6WPbFIDVEoOoPZUCZAfeHqZ4YoQjexBjQOO6.3bDReU30H20AFK', 'reviewer', 1, 0, NULL, '2026-02-19 16:12:14', '2026-04-06 14:04:06', NULL, 0),
('79dcf791-31c1-11f1-ad3e-c05465fbbdc2', 'venkatesh15793@gmail.com', '$2b$10$vCuOl9r0XinmX3pezxSBqOLGzBD3P5UgMh/D1XZWyDdtnisNaDmtK', 'reviewer', 1, 0, NULL, '2026-02-19 16:12:20', '2026-04-06 14:04:06', NULL, 0),
('79dd4a83-31c1-11f1-ad3e-c05465fbbdc2', 'swapnachsp@gmail.com', '$2b$10$S3VJhjb7uats5M8.eKctHeoiu2fIDsZfvimEDmMTOY8UFMoiFh12m', 'editor', 1, 0, NULL, '2026-03-03 14:06:00', '2026-04-06 14:04:06', NULL, 0),
('79dd80d7-31c1-11f1-ad3e-c05465fbbdc2', 'skaredla@gitam.edu', NULL, 'editor', 1, 0, NULL, '2026-03-03 14:08:13', '2026-04-06 14:04:06', NULL, 0),
('79ddcf7f-31c1-11f1-ad3e-c05465fbbdc2', 'jackbenison12@gmail.com', NULL, 'editor', 1, 0, NULL, '2026-03-03 14:09:25', '2026-04-06 14:04:06', NULL, 0),
('79de0a1f-31c1-11f1-ad3e-c05465fbbdc2', 'norsuzila@salam.uitm.edu.my', '$2b$10$SoJp3xko/HImNINIVY2RjO9Vk17ERTTcijrIXECZ.f1/2EtiEwZfm', 'editor', 1, 0, NULL, '2026-03-03 14:29:56', '2026-04-06 14:04:06', NULL, 0),
('79de63c3-31c1-11f1-ad3e-c05465fbbdc2', 'razh1977@gmail.com', NULL, 'editor', 1, 0, NULL, '2026-03-03 15:34:37', '2026-04-06 14:04:06', NULL, 0),
('79df667a-31c1-11f1-ad3e-c05465fbbdc2', 'trinadhphd33@gmail.com', NULL, 'editor', 1, 0, NULL, '2026-03-05 15:56:46', '2026-04-06 14:04:06', NULL, 0),
('79dfcee0-31c1-11f1-ad3e-c05465fbbdc2', 'mr.challa33@gmail.com', NULL, 'reviewer', 1, 0, NULL, '2026-03-05 15:56:53', '2026-04-06 14:04:06', NULL, 0),
('a6692808-5464-4ac5-af21-e27dc56a5a8f', 'mohan@colourmoon.com', NULL, 'author', 1, 0, NULL, '2026-04-07 13:38:29', '2026-04-07 13:38:29', NULL, 0),
('u13-gulshan-sri-babu-uuid-001', 'gulshansribabu@gmail.com', '$2a$12$M2tKWAune7p18LlnZgnfkecIDlaQvQ6SkhDYrbMiX.9fOAPFpqYVy', 'author', 1, 1, NULL, '2026-04-08 14:24:12', '2026-04-08 14:24:12', NULL, 0),
('u18-subbarao-uuid-002', 'subbaraochappa@gmail.com', '$2a$12$M2tKWAune7p18LlnZgnfkecIDlaQvQ6SkhDYrbMiX.9fOAPFpqYVy', 'author', 1, 1, NULL, '2026-04-08 14:24:12', '2026-04-08 14:24:12', NULL, 0),
('u19-mahendra-uuid-003', 'narlamahendracai@gpcet.ac.in', '$2a$12$M2tKWAune7p18LlnZgnfkecIDlaQvQ6SkhDYrbMiX.9fOAPFpqYVy', 'author', 1, 1, NULL, '2026-04-08 14:24:12', '2026-04-08 14:24:12', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `user_invitations`
--

CREATE TABLE `user_invitations` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum('editor','reviewer') NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `invited_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_invitations`
--

INSERT INTO `user_invitations` (`id`, `email`, `role`, `token`, `expires_at`, `invited_by`, `created_at`) VALUES
(1, 'skaredla@gitam.edu', 'editor', '09de0294e967aeb6a30abfeda5a51c62340e2d9aeb8a20b4e1143bdd46f95c3d', '2026-03-04 14:08:13', NULL, '2026-03-03 14:08:13'),
(2, 'jackbenison12@gmail.com', 'editor', 'c606a2bab40b8cdae84258591cbd5da5e7fd771750d5ee06337519e2abb54438', '2026-03-04 14:09:25', NULL, '2026-03-03 14:09:25'),
(3, 'razh1977@gmail.com', 'editor', 'a52772afc7c330f652056cdb27b926b8a7de3476dbb421a69981f3d2cc2d28b2', '2026-03-31 08:51:10', NULL, '2026-03-03 15:34:37'),
(4, 'trinadhphd33@gmail.com', 'editor', '46a219ab8c1a6157080a9886c7342c574ce6595408da12cdbcdb637f4cf53088', '2026-03-06 15:56:46', NULL, '2026-03-05 15:56:46'),
(5, 'mr.challa33@gmail.com', 'reviewer', '2f0d0f6f1068bb271034e7e22878c5660fa2e090e756ff31d6d898c5f73b8b52', '2026-03-06 15:56:53', NULL, '2026-03-05 15:56:53');

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

CREATE TABLE `user_profiles` (
  `id` int(11) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `institute` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `orcid_id` varchar(50) DEFAULT NULL,
  `nationality` varchar(100) DEFAULT 'India',
  `bio` text DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_profiles`
--

INSERT INTO `user_profiles` (`id`, `user_id`, `full_name`, `designation`, `institute`, `phone`, `orcid_id`, `nationality`, `bio`, `photo_url`, `created_at`, `updated_at`) VALUES
(1, '79daefad-31c1-11f1-ad3e-c05465fbbdc2', 'Dr. Ravi Babu T', 'Associate Professor', 'MES Group of Institution', '+91 8919643590', NULL, 'India', NULL, NULL, '2026-04-06 14:04:06', '2026-04-06 14:04:06'),
(2, '79db5a7a-31c1-11f1-ad3e-c05465fbbdc2', 'Mohan Kumar Indala', 'professor', 'vignan', '7780123277', NULL, 'India', NULL, NULL, '2026-04-06 14:04:06', '2026-04-07 13:07:37'),
(3, '79dbcba4-31c1-11f1-ad3e-c05465fbbdc2', 'Indala Mohankumar', NULL, NULL, NULL, NULL, 'India', NULL, NULL, '2026-04-06 14:04:06', '2026-04-06 14:04:06'),
(4, '79dc1011-31c1-11f1-ad3e-c05465fbbdc2', 'T R babu', 'Associate Professor', 'Miracle Educational Society Group of Institutions', NULL, NULL, 'India', NULL, '/uploads/reviewer-apps/1771082901394-IMG20230527071713.jpg', '2026-04-06 14:04:06', '2026-04-06 14:04:06'),
(5, '79dc7b1c-31c1-11f1-ad3e-c05465fbbdc2', 'Dr.B.Somasekhar', 'Professor', 'Anil Neerukonda Institute of Technology & Sciences', NULL, NULL, 'India', NULL, '/uploads/reviewer-apps/1771156198892-Dr._Borugadda_Soma_Sekhar_100443_Professor__ECE_Department.png', '2026-04-06 14:04:06', '2026-04-06 14:04:06'),
(6, '79dcbb44-31c1-11f1-ad3e-c05465fbbdc2', 'Dr Ch Manohar Kumar', 'Associate Professor', 'gayatri Vidya Parishad College for Degree and PG Courses(A)', NULL, NULL, 'India', NULL, '/uploads/reviewer-apps/1771489588377-Mr.-Ch.-Manohar-Kumar.jpg', '2026-04-06 14:04:06', '2026-04-06 14:04:06'),
(7, '79dcf791-31c1-11f1-ad3e-c05465fbbdc2', 'Dr Appalabathula Venkatesh', 'Assistant Professor', 'Anil Neerukonda Institute of Technology and Sciences', NULL, NULL, 'India', 'APPALABATHULA VENKATESH (Professional Member, IEEE) received a Bachelor\'s in Engineering in Electrical and Electronics Engineering from Lendi Institute of Technology and Sciences in 2014 and a Master\'s in Engineering in Control Systems in 2018, from Anil Neerukonda Institute of Technology and Sciences, Andhra Pradesh, India, and a Ph.D. in the Area of Hybrid Electric Vehicles from the National Institute of Engineering, Mysuru, Karnataka, India, in 2023. \r\n\r\nHe has over five years of teaching experience and is currently an Assistant Professor in the Department of Electrical and Electronics Engineering at Anil Neerukonda Institute of Technology and Sciences, India. He also served as a Post-Doctoral Research Intern in the Department of Electrical and Electronics Engineering, School of Engineering and Sciences, SRM University, Amaravati, India.\r\n\r\nHe has published His research interests include electric and hybrid electric vehicles, fuel cell-based vehicle systems, intelligent control design for power electronic converters, heuristic optimization, bidirectional DC–DC converters, grid-integrated hybrid renewable systems, and AI/ML-based control strategies. \r\n\r\nHe currently serves as an IEEE VTS Young Professionals (YP) Ambassador and Lead Entrepreneurship Ambassador of the IEEE Vizag Bay Section (2024–2025). He is also a member of the IEEE Region 10 Adhoc Committee on Entrepreneurship and Innovation (ACEI), Innovation Ambassador.', '/uploads/profiles/undefined-1774919094662-Screenshot-2026-02-19-124056.jpg', '2026-04-06 14:04:06', '2026-04-06 14:04:06'),
(8, '79dd4a83-31c1-11f1-ad3e-c05465fbbdc2', 'Dr. CH. Swapna Priya ', NULL, 'Dept of Computer Science Engineering, Vigyan Institute of Technology, India', NULL, NULL, 'India', NULL, NULL, '2026-04-06 14:04:06', '2026-04-06 14:04:06'),
(9, '79dd80d7-31c1-11f1-ad3e-c05465fbbdc2', 'Dr. K. Srinivas', NULL, 'Dept of Management, MES Group of Institutions, India', NULL, NULL, 'India', NULL, NULL, '2026-04-06 14:04:06', '2026-04-06 14:04:06'),
(10, '79ddcf7f-31c1-11f1-ad3e-c05465fbbdc2', 'Dr. T.  babu', NULL, NULL, NULL, NULL, 'India', NULL, NULL, '2026-04-06 14:04:06', '2026-04-06 14:04:06'),
(11, '79de0a1f-31c1-11f1-ad3e-c05465fbbdc2', 'Prof.Ir.Gs.Ts. Dr. Norsuzila Ya\'acob', NULL, 'Faculty of Electrical Engineering University of Teknologi MARA,Shah Alam, Malaysia', NULL, NULL, 'Malaysia', NULL, NULL, '2026-04-06 14:04:06', '2026-04-06 14:04:06'),
(12, '79de63c3-31c1-11f1-ad3e-c05465fbbdc2', 'T R', NULL, NULL, NULL, NULL, 'India', NULL, NULL, '2026-04-06 14:04:06', '2026-04-06 14:04:06'),
(13, '79df667a-31c1-11f1-ad3e-c05465fbbdc2', 'Dr.Trinadha Rao challa', 'Associate Professor', 'Jntugv University ', NULL, NULL, 'India', NULL, '/uploads/reviewer-apps/1772620698103-Trinadh-Rao-Challa.jpg', '2026-04-06 14:04:06', '2026-04-06 14:04:06'),
(14, '79dfcee0-31c1-11f1-ad3e-c05465fbbdc2', 'Dr.Trinadha Rao challa', 'Associate Professor', 'Jntugv University ', NULL, NULL, 'India', NULL, '/uploads/reviewer-apps/1772620431806-Trinadh-Rao-Challa-(1).jpg', '2026-04-06 14:04:06', '2026-04-06 14:04:06'),
(15, 'a6692808-5464-4ac5-af21-e27dc56a5a8f', 'mohan', 'B-tech UG', 'Vignan  Institute of Information Technology', '7780123277', NULL, 'India', NULL, NULL, '2026-04-07 13:38:29', '2026-04-07 13:38:29'),
(16, 'u13-gulshan-sri-babu-uuid-001', 'THORLAPATI GULSHAN SRI BABU', NULL, 'VIGNAN\'S INSTITUTE OF INFORMATION TECHNOLOGY', NULL, NULL, 'India', NULL, NULL, '2026-04-08 14:24:12', '2026-04-08 14:24:12'),
(17, 'u18-subbarao-uuid-002', 'CH M V SUBBARAO', NULL, 'DEPARTMENT OF ECE, JNTU GV', NULL, NULL, 'India', NULL, NULL, '2026-04-08 14:24:12', '2026-04-08 14:24:12'),
(18, 'u19-mahendra-uuid-003', 'Mahendra', NULL, 'Department of CAI, G. Pullaiah College of Engineering and Technology', NULL, NULL, 'India', NULL, NULL, '2026-04-08 14:24:12', '2026-04-08 14:24:12');

-- --------------------------------------------------------

--
-- Table structure for table `volumes_issues`
--

CREATE TABLE `volumes_issues` (
  `id` int(11) NOT NULL,
  `volume_number` int(11) NOT NULL,
  `issue_number` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `month_range` varchar(100) DEFAULT NULL,
  `status` enum('open','published') NOT NULL DEFAULT 'open',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `volumes_issues`
--

INSERT INTO `volumes_issues` (`id`, `volume_number`, `issue_number`, `year`, `month_range`, `status`, `created_at`) VALUES
(1, 1, 1, 2026, 'March', 'published', '2026-04-08 14:24:12');

-- --------------------------------------------------------

--
-- Table structure for table `_user_id_mapping`
--

CREATE TABLE `_user_id_mapping` (
  `old_id` int(11) NOT NULL,
  `new_uuid` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_user_id_mapping`
--

INSERT INTO `_user_id_mapping` (`old_id`, `new_uuid`, `email`) VALUES
(1, '79daefad-31c1-11f1-ad3e-c05465fbbdc2', 'editor@ijitest.org'),
(2, '79db5a7a-31c1-11f1-ad3e-c05465fbbdc2', 'indalamohankumar@gmail.com'),
(3, '79dbcba4-31c1-11f1-ad3e-c05465fbbdc2', 'indalamohankumar21@gmail.com'),
(4, '79dc1011-31c1-11f1-ad3e-c05465fbbdc2', 'razh1976@gmail.com'),
(5, '79dc7b1c-31c1-11f1-ad3e-c05465fbbdc2', 'somasekhar.ece@anits.edu.in'),
(6, '79dcbb44-31c1-11f1-ad3e-c05465fbbdc2', 'manohar@gvpcdpgc.edu.in'),
(7, '79dcf791-31c1-11f1-ad3e-c05465fbbdc2', 'venkatesh15793@gmail.com'),
(12, '79dd4a83-31c1-11f1-ad3e-c05465fbbdc2', 'swapnachsp@gmail.com'),
(13, '79dd80d7-31c1-11f1-ad3e-c05465fbbdc2', 'skaredla@gitam.edu'),
(17, '79ddcf7f-31c1-11f1-ad3e-c05465fbbdc2', 'jackbenison12@gmail.com'),
(22, '79de0a1f-31c1-11f1-ad3e-c05465fbbdc2', 'norsuzila@salam.uitm.edu.my'),
(23, '79de63c3-31c1-11f1-ad3e-c05465fbbdc2', 'razh1977@gmail.com'),
(24, '79df667a-31c1-11f1-ad3e-c05465fbbdc2', 'trinadhphd33@gmail.com'),
(25, '79dfcee0-31c1-11f1-ad3e-c05465fbbdc2', 'mr.challa33@gmail.com');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activity_logs_performed_by_users_id_fk` (`performed_by`);

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `app_email_type_unique` (`email`,`type`),
  ADD KEY `applications_reviewed_by_users_id_fk` (`reviewed_by`);

--
-- Indexes for table `application_interests`
--
ALTER TABLE `application_interests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `application_interests_application_id_applications_id_fk` (`application_id`),
  ADD KEY `application_interests_interest_id_master_interests_id_fk` (`interest_id`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `master_interests`
--
ALTER TABLE `master_interests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `master_interests_name_unique` (`name`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notif_user_idx` (`user_id`,`is_read`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payments_submission_id_unique` (`submission_id`),
  ADD UNIQUE KEY `payments_transaction_id_unique` (`transaction_id`);

--
-- Indexes for table `publications`
--
ALTER TABLE `publications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `publications_submission_id_unique` (`submission_id`),
  ADD UNIQUE KEY `publications_doi_unique` (`doi`),
  ADD KEY `publications_issue_id_volumes_issues_id_fk` (`issue_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reviews_assignment_id_unique` (`assignment_id`);

--
-- Indexes for table `review_assignments`
--
ALTER TABLE `review_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_assignment` (`submission_id`,`reviewer_id`,`version_id`,`review_round`),
  ADD KEY `review_assignments_reviewer_id_users_id_fk` (`reviewer_id`),
  ADD KEY `review_assignments_version_id_submission_versions_id_fk` (`version_id`),
  ADD KEY `review_assignments_assigned_by_users_id_fk` (`assigned_by`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`setting_key`);

--
-- Indexes for table `submissions`
--
ALTER TABLE `submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `submissions_paper_id_unique` (`paper_id`),
  ADD UNIQUE KEY `submissions_slug_unique` (`slug`),
  ADD KEY `submissions_decision_by_users_id_fk` (`decision_by`),
  ADD KEY `submissions_issue_id_volumes_issues_id_fk` (`issue_id`),
  ADD KEY `status_idx` (`status`),
  ADD KEY `author_idx` (`corresponding_author_id`);

--
-- Indexes for table `submission_authors`
--
ALTER TABLE `submission_authors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sub_author_idx` (`submission_id`),
  ADD KEY `author_order_idx` (`submission_id`,`order_index`);

--
-- Indexes for table `submission_editors`
--
ALTER TABLE `submission_editors`
  ADD PRIMARY KEY (`submission_id`,`editor_id`),
  ADD KEY `submission_editors_editor_id_users_id_fk` (`editor_id`);

--
-- Indexes for table `submission_files`
--
ALTER TABLE `submission_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `file_version_idx` (`version_id`);

--
-- Indexes for table `submission_versions`
--
ALTER TABLE `submission_versions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `submission_version_unique` (`submission_id`,`version_number`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `role_idx` (`role`);

--
-- Indexes for table `user_invitations`
--
ALTER TABLE `user_invitations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_invitations_token_unique` (`token`),
  ADD KEY `user_invitations_invited_by_users_id_fk` (`invited_by`);

--
-- Indexes for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_profiles_user_id_unique` (`user_id`);

--
-- Indexes for table `volumes_issues`
--
ALTER TABLE `volumes_issues`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vol_issue_year` (`volume_number`,`issue_number`,`year`);

--
-- Indexes for table `_user_id_mapping`
--
ALTER TABLE `_user_id_mapping`
  ADD PRIMARY KEY (`old_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `application_interests`
--
ALTER TABLE `application_interests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `master_interests`
--
ALTER TABLE `master_interests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `publications`
--
ALTER TABLE `publications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `review_assignments`
--
ALTER TABLE `review_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `submissions`
--
ALTER TABLE `submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `submission_authors`
--
ALTER TABLE `submission_authors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `submission_files`
--
ALTER TABLE `submission_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `submission_versions`
--
ALTER TABLE `submission_versions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `user_invitations`
--
ALTER TABLE `user_invitations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `user_profiles`
--
ALTER TABLE `user_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `volumes_issues`
--
ALTER TABLE `volumes_issues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_performed_by_users_id_fk` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `applications_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `application_interests`
--
ALTER TABLE `application_interests`
  ADD CONSTRAINT `application_interests_application_id_applications_id_fk` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `application_interests_interest_id_master_interests_id_fk` FOREIGN KEY (`interest_id`) REFERENCES `master_interests` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `publications`
--
ALTER TABLE `publications`
  ADD CONSTRAINT `publications_issue_id_volumes_issues_id_fk` FOREIGN KEY (`issue_id`) REFERENCES `volumes_issues` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `publications_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_assignment_id_review_assignments_id_fk` FOREIGN KEY (`assignment_id`) REFERENCES `review_assignments` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `review_assignments`
--
ALTER TABLE `review_assignments`
  ADD CONSTRAINT `review_assignments_assigned_by_users_id_fk` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `review_assignments_reviewer_id_users_id_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `review_assignments_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `review_assignments_version_id_submission_versions_id_fk` FOREIGN KEY (`version_id`) REFERENCES `submission_versions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `submissions`
--
ALTER TABLE `submissions`
  ADD CONSTRAINT `submissions_corresponding_author_id_users_id_fk` FOREIGN KEY (`corresponding_author_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `submissions_decision_by_users_id_fk` FOREIGN KEY (`decision_by`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `submissions_issue_id_volumes_issues_id_fk` FOREIGN KEY (`issue_id`) REFERENCES `volumes_issues` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `submission_authors`
--
ALTER TABLE `submission_authors`
  ADD CONSTRAINT `submission_authors_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `submission_editors`
--
ALTER TABLE `submission_editors`
  ADD CONSTRAINT `submission_editors_editor_id_users_id_fk` FOREIGN KEY (`editor_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `submission_editors_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `submission_files`
--
ALTER TABLE `submission_files`
  ADD CONSTRAINT `submission_files_version_id_submission_versions_id_fk` FOREIGN KEY (`version_id`) REFERENCES `submission_versions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `submission_versions`
--
ALTER TABLE `submission_versions`
  ADD CONSTRAINT `submission_versions_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `user_invitations`
--
ALTER TABLE `user_invitations`
  ADD CONSTRAINT `user_invitations_invited_by_users_id_fk` FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD CONSTRAINT `user_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
