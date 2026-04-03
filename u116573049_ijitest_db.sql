-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 01, 2026 at 05:57 PM
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
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `id` int(11) NOT NULL,
  `application_type` enum('reviewer','editor') NOT NULL DEFAULT 'reviewer',
  `full_name` varchar(255) NOT NULL,
  `designation` varchar(255) NOT NULL,
  `institute` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `cv_url` varchar(500) NOT NULL,
  `photo_url` varchar(500) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `nationality` varchar(100) DEFAULT 'India',
  `rejection_reason` text DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `application_interests`
--

CREATE TABLE `application_interests` (
  `id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `interest` varchar(255) NOT NULL
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
  `reply_text` text DEFAULT NULL,
  `replied_at` timestamp NULL DEFAULT NULL,
  `status` enum('pending','resolved','archived') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `resolved_at` timestamp NULL DEFAULT NULL,
  `resolved_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `submission_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'INR',
  `status` enum('unpaid','paid','verified') DEFAULT 'unpaid',
  `transaction_id` varchar(255) DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `submission_id`, `amount`, `currency`, `status`, `transaction_id`, `paid_at`, `created_at`) VALUES
(13, 13, 2000.00, 'INR', '', 'order_SPaqo2m3n7KLO4', '2026-03-14 07:58:23', '2026-03-10 16:42:52'),
(14, 15, 0.00, 'INR', '', NULL, '2026-03-30 09:06:12', '2026-03-30 09:05:40'),
(15, 16, 0.00, 'INR', '', NULL, '2026-04-01 15:23:29', '2026-04-01 15:22:56'),
(16, 18, 0.00, 'INR', '', NULL, '2026-04-01 15:56:06', '2026-04-01 15:55:46'),
(17, 19, 0.00, 'INR', '', NULL, '2026-04-01 16:10:46', '2026-04-01 16:10:41');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `submission_id` int(11) NOT NULL,
  `reviewer_id` int(11) NOT NULL,
  `status` enum('pending','in_progress','completed') DEFAULT 'pending',
  `deadline` date DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `feedback_file_path` varchar(500) DEFAULT NULL,
  `assigned_at` timestamp NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `submission_id`, `reviewer_id`, `status`, `deadline`, `feedback`, `feedback_file_path`, `assigned_at`, `completed_at`) VALUES
(4, 13, 4, 'completed', '2026-03-13', 'accepted if modify the minor reviews', NULL, '2026-03-10 16:30:17', NULL),
(5, 15, 6, 'completed', '2026-03-30', 'The results demonstrate that integrating Reconfigurable Intelligent Surfaces (RIS) with hybrid analog–digital precoding significantly enhances mmWave massive MIMO system performance. Increasing the number of RIS elements improves energy efficiency and coverage due to better signal reflection and beamforming gain. The proposed RIS-assisted hybrid scheme consistently outperforms fully digital precoding in terms of energy efficiency while maintaining comparable or improved spectral efficiency.\r\n\r\nAdditionally, performance improves with higher SNR, where the hybrid approach achieves lower bit error rates (BER) and higher throughput. The architecture also reduces hardware complexity by minimizing the number of required RF chains. Overall, the proposed system provides an effective trade-off between performance, energy consumption, and implementation cost, making it a strong candidate for future 6G wireless networks.', NULL, '2026-03-28 03:40:45', NULL),
(6, 16, 7, 'completed', '2026-04-01', 'The manuscript titled \"Quantum-Enabled Security Framework for 6G\r\nCommunications Based on QKD-OFDM Integration\" should have the following changes before it is accepted.\r\n1. The Index terms should be a minimum of 4 as per the template, and suggested to include additional terms.\r\n2. There are uneven spaces throughout the manuscript, suggesting that uneven spaces should be removed.\r\n3. Citations should be properly included in the text as per the journal format.\r\n4. Suggested to include citations/references in Table 1.\r\n5. The quality of Figure 1 should be improved.\r\n6. Suggested to include quantitative analysis based on the obtained simulation results.\r\n', NULL, '2026-03-30 16:33:31', NULL),
(7, 18, 4, 'completed', '2026-04-03', 'The manuscript Energy-Efficient Ternary Logic Processor Using CNTFETs for Advanced Nanotechnology applications, paper is accepted when minor corrections corrected.\r\n1. Add Recent publications in biblography.\r\n2. Give any block diagram if required.  ', NULL, '2026-04-01 15:47:50', NULL),
(8, 19, 4, 'completed', '2026-04-03', 'Add recent references \r\nBetter to give more numarical part for simulation graphs\r\n\r\nThe paper is accepted if minor changes corrected.', NULL, '2026-04-01 16:06:06', NULL);

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
('apc_description', 'APC covers DOI assignment, long-term hosting, indexing maintenance, and editorial handling. There are no submission or processing charges before acceptance.', '2026-02-09 17:21:31'),
('apc_inr', '0', '2026-03-10 17:32:54'),
('apc_usd', '0', '2026-03-10 17:32:54'),
('copyright_url', '/docs/copyright-form.docx', '2026-02-09 17:21:31'),
('is_promotion_active', 'true', '2026-03-10 15:29:45'),
('issn_number', 'XXXX-XXXX', '2026-02-09 17:13:37'),
('journal_name', 'International Journal of Innovative Trends in Engineering Science and Technology', '2026-02-06 12:13:34'),
('journal_short_name', 'IJITEST', '2026-02-09 17:21:31'),
('office_address', 'Felix Academic Publications, Madhurawada, Visakhapatnam, AP, India', '2026-02-08 17:09:15'),
('publisher_name', 'Felix Academic Publications', '2026-02-09 17:21:31'),
('support_email', 'support@ijitest.org', '2026-02-22 16:42:23'),
('support_phone', '+91 8919643590', '2026-02-08 17:09:15'),
('template_url', '/docs/template-url.docx', '2026-03-10 16:55:19');

-- --------------------------------------------------------

--
-- Table structure for table `submissions`
--

CREATE TABLE `submissions` (
  `id` int(11) NOT NULL,
  `paper_id` varchar(50) NOT NULL,
  `title` text NOT NULL,
  `abstract` text DEFAULT NULL,
  `keywords` text DEFAULT NULL,
  `author_name` varchar(255) NOT NULL,
  `author_email` varchar(255) NOT NULL,
  `affiliation` varchar(500) DEFAULT NULL,
  `status` enum('submitted','under_review','accepted','rejected','published','paid','retracted') DEFAULT 'submitted',
  `file_path` varchar(500) DEFAULT NULL,
  `pdf_url` varchar(500) DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `issue_id` int(11) DEFAULT NULL,
  `is_free_publish` tinyint(1) DEFAULT 0,
  `co_authors` text DEFAULT NULL,
  `published_at` timestamp NULL DEFAULT NULL,
  `start_page` int(11) DEFAULT NULL,
  `end_page` int(11) DEFAULT NULL,
  `submission_mode` enum('current','archive') DEFAULT 'archive',
  `retraction_notice_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `submissions`
--

INSERT INTO `submissions` (`id`, `paper_id`, `title`, `abstract`, `keywords`, `author_name`, `author_email`, `affiliation`, `status`, `file_path`, `pdf_url`, `submitted_at`, `updated_at`, `issue_id`, `is_free_publish`, `co_authors`, `published_at`, `start_page`, `end_page`, `submission_mode`, `retraction_notice_url`) VALUES
(13, 'IJITEST-2026-001', 'Digital Revolution: The Role of Informatics in Industry 4.0 and 5.0', 'The emergence of Industry 5.0 predicts a paradigm shift in industrial development, as cutting-edge devices—such as AI-enhanced robots—collaborate harmoniously with human labourers to maximize productivity. This phase emphasizes the significance of human engagement while emphasizing sustainability and resilience.  This development based on innovations has led to industry 4.0, the fourth industrial revolution has changed production and production techniques. Changes are motivated by the strong progress of automation, robots, Big data, Internet of Things, Machine learning, artificial intelligence and virtualization. In addition to the successful automation and technological integration of its predecessor, largely related to production and efficiency stimulation, industry 5.0 to create both sustainable innovations and focus on people. Looking for a long -term balance between technology development and environmental protection and the happiness of our society is the main goal. This requires intentional approach to innovation, ensuring that our progress increases the living standards of people while benefiting our natural systems to support us.\r\n', 'Industry 4.0, Industry 5.0', 'THORLAPATI GULSHAN SRI BABU ', 'gulshansribabu@gmail.com', 'VIGNAN\'S INSTITUTE OF INFORMATION TECHNOLOGY ', 'paid', '/uploads/published/IJITEST-2026-001-published.pdf', '/uploads/submissions/manuscript-13-1774891817005.pdf', '2026-03-03 13:44:42', '2026-03-30 17:33:17', NULL, 0, '[\n  {\n    \"name\": \"Chekatla Swapna Priya\",\n    \"email\": \"swapnachsp@gmail.com\",\n    \"phone\": \"0000000000\",\n    \"designation\": \"Assistant Professor, CSE\",\n    \"institution\": \"Vignan\'s Institute of Information Technology (A), Visakhapatnam, India\"\n  },\n  {\n    \"name\": \"Suseela Kocho\",\n    \"email\": \"jackbenison12@gmail.com\",\n    \"phone\": \"0000000000\",\n    \"designation\": \"SGT\",\n    \"institution\": \"Department of school education, India (Orcid ID: 0000-0002-1567-7896)\"\n  }\n]\n', '2026-03-15 22:49:44', 1, 7, 'archive', NULL),
(15, 'IJITEST-2026-002', 'Optimization and Performance Evaluation of  RIS-Integrated Hybrid Precoding in Millimeter Wave Massive MIMO', 'The evolution toward sixth-generation (6G) wireless systems requires extremely high data rates, massive device connectivity, very low latency, and improved energy efficiency. Millimeter-wave (mmWave) communication is considered a key enabler due to its large available bandwidth and ability to support multi-gigabit transmission. Nevertheless, mmWave signals experience high path loss, vulnerability to blockage, and increased implementation complexity caused by large antenna arrays and multiple RF chains. To overcome these limitations, this thesis explores the integration of Reconfigurable Intelligent Surfaces (RIS) with hybrid analog–digital precoding in mmWave Massive MIMO systems. RIS enables intelligent control of signal propagation by adjusting the phase of reflected waves, while hybrid precoding reduces hardware cost and power consumption without significantly degrading performance. A detailed system model, mathematical analysis, and optimization strategies for precoders and RIS phase shifts are presented. Performance evaluation based on spectral efficiency, energy efficiency, and hardware complexity demonstrates that RIS-assisted hybrid architectures provide notable improvements in coverage, achievable rate, and power utilization. ', 'Reconfigurable Intelligent Surfaces, mmWave Massive MIMO systems, Precoders and RIS phase shifters', 'Cheekatla Swapna Priya', 'swapnachsp@gmail.com', 'VIGNAN\'S INSTITUTE OF INFORMATION TECHNOLOGY(A)', 'paid', '/uploads/submissions/1774540380450-x26s7q.docx', '/uploads/submissions/secure-15-1774669245557.pdf', '2026-03-26 15:53:00', '2026-03-30 09:06:12', NULL, 0, '[{\"name\":\"V.N.S.Vijay Kumar \",\"email\":\"vijaykumarlce@gmail.com\",\"phone\":\"94412 37013\",\"designation\":\"Assistant Professor\",\"institution\":\"Vardhaman college of Engineering, Hyderabad Telangana, INDIA\"}]', NULL, NULL, NULL, 'archive', NULL),
(16, 'IJITEST-2026-003', 'Quantum-Enabled Security Framework for 6G Communications Based on QKD-OFDM Integration', '– Ultra-high data rates, efficient use of the terahertz spectrum, and significant connectivity are anticipated as Sixth Generation (6G) wireless communication emerges. However, traditional cryptographic algorithms like RSA and Elliptic Curve Cryptography, which are currently employed in wireless networks, are seriously threatened by the quick development of quantum computing. Future 6G systems must incorporate quantum-safe security measures to allay this worry. The incorporation of Quantum Key Distribution (QKD) into the physical layer of 6G communication networks is investigated in this paper. To facilitate secure key exchange and identify eavesdropping, QKD makes use of quantum concepts like superposition, entanglement, and the no-cloning theorem. Realistic wireless channel conditions are used to analyze the BB84 and E91 protocols. A proposed 6G channel model incorporates Nakagami-m fading, additive white Gaussian noise, and path loss. Detector noise and channel disturbances are taken into account when modeling the Quantum Bit Error Rate (QBER). In an OFDM framework, MATLAB simulations evaluate the secure key rate performance with respect to signal-to-noise ratio, transmission distance, and noise probability. The findings highlight the potential of QKD for secure 6G communications by showing that secure key generation is possible when the QBER stays below the theoretical threshold.\r\n', '5G and 6G wireless communications, Quantum Key Distribution, Fading Channels', 'Cheekatla Swapna Priya', 'swapnachsp@gmail.com', 'VIGNANAS INSTITUTE OF INFORMATION TECHNOLOGY', 'paid', '/uploads/submissions/1774884491840-wm8v5k.docx', '/uploads/submissions/secure-16-1774888411617.pdf', '2026-03-30 15:28:11', '2026-04-01 15:23:29', NULL, 0, '[{\"name\":\"thorlapati gulshan sribabu\",\"email\":\"gulshansribabu@gmail.com\",\"phone\":\"09505175015\",\"designation\":\"student\",\"institution\":\"vignan\'s institute of Information technology\"}]', NULL, NULL, NULL, 'archive', NULL),
(18, 'IJITEST-2026-004', 'Energy-Efficient Ternary Logic Processor Using CNTFETs for Advanced Nanotechnology Applications', 'The increasing demand for energy-efficient computing has driven research into novel logic architectures beyond traditional binary logic. This paper presents the design and implementation of an energy-efficient ternary logic processor using Carbon Nanotube Field-Effect Transistors (CNTFETs) for advanced nanotechnology applications. Ternary logic, which operates with three discrete states (0, 1, 2), offers higher computational density, reduced transistor count, and lower power consumption compared to conventional binary architectures. CNTFETs, with their superior electrical properties such as high carrier mobility, low sub-threshold swing, and excellent scalability, serve as an ideal candidate for implementing ternary logic circuits. The proposed ternary processor integrates ternary logic gates, arithmetic units, multiplexers, memory units, and control circuits, all optimized for low-power operation. Simulation results demonstrate significant improvements in energy efficiency, area reduction, and computational throughput compared to conventional CMOS-based binary processors. Additionally, the processor\'s architecture is tailored for emerging applications in artificial intelligence, cryptography, and IoT devices, where power efficiency and performance are critical. The findings of this study highlight the potential of CNTFET-based ternary computing as a promising alternative for next-generation low-power processors in nanotechnology-driven applications.', 'Ternary Logic Processor, CNTFET, Low-Power Computing, Nanotechnology, Energy-Efficient Architecture.', 'CH M V SUBBARAO', 'subbaraochappa@gmail.com', 'DEPARTMENT OF ECE ,JNTU GV ', 'paid', '/uploads/submissions/1775058291152-4dzxo9.pdf', '/uploads/submissions/secure-18-1775058470749.pdf', '2026-04-01 15:44:51', '2026-04-01 15:56:06', NULL, 0, '[]', NULL, NULL, NULL, 'archive', NULL),
(19, 'IJITEST-2026-005', 'RNN and CNN–Enhanced EM-GAMP for Sparse  Channel Estimation via Quantum Compressed  Sensing in Massive MIMO-OFDM ', 'Quantum Compressed Sensing (QCS) is an efficient \r\nframework that exploits signal sparsity to reconstruct quantum \r\nstates and quantum-inspired communication signals using fewer \r\nmeasurements than conventional approaches. It combines \r\ncompressed sensing theory with quantum information processing \r\nto reduce sampling complexity and computational cost in high\r\ndimensional systems. Advanced estimation techniques such as \r\nOMP-based methods, deep learning-assisted recovery, and \r\nquantum-inspired neural models improve reconstruction \r\naccuracy under noisy conditions. These approaches utilize \r\nsparsity in quantum states, wireless channels, and system \r\nparameters while lowering the burden of quantum \r\nmeasurements. QCS is particularly useful in emerging \r\napplications like next-generation wireless networks, quantum \r\nsensing, and optical communication where measurement \r\nresources are limited. Compared to classical compressed sensing, \r\nQCS methods offer better scalability and stronger resilience to \r\nestimation errors. They also enable modeling of quantum \r\nfeatures such as superposition and correlated system behavior. \r\nPerformance evaluation is typically carried out using metrics \r\nlike BER versus SNR, MMSE, and recovery accuracy. Overall, \r\nQCS supports efficient signal acquisition and reliable estimation \r\nin large-scale quantum-aware systems. ', 'Quantum Compressed Sensing, OMP-based  methods, sparse recovery techniques, compressed sensing', 'Mahendra', 'narlamahendracai@gpcet.ac.in', 'Department of CAI, G. Pullaiah College of Engineering and Technology', 'paid', '/uploads/submissions/1775059313407-hpa05k.pdf', '/uploads/submissions/secure-19-1775059566911.pdf', '2026-04-01 16:01:53', '2026-04-01 16:10:46', NULL, 0, '[]', NULL, NULL, NULL, 'archive', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `institute` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `role` enum('admin','editor','reviewer') DEFAULT 'admin',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `invitation_token` varchar(255) DEFAULT NULL,
  `invitation_expires` timestamp NULL DEFAULT NULL,
  `nationality` varchar(100) DEFAULT 'India',
  `has_seen_promotion` tinyint(4) DEFAULT 0,
  `orcid_id` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `designation`, `institute`, `phone`, `bio`, `photo_url`, `role`, `created_at`, `invitation_token`, `invitation_expires`, `nationality`, `has_seen_promotion`, `orcid_id`) VALUES
(1, 'editor@ijitest.org', '$2b$10$HpElpKNYCXaqdUpivIxWA.CLDniLlVW/GIb7VyiDv4Syl3WsKsdqy', 'Dr. Ravi Babu T', 'Associate Professor', 'MES Group of Institution', '+91 8919643590', '', '', 'admin', '2026-02-04 12:30:42', NULL, NULL, 'India', 0, NULL),
(2, 'indalamohankumar@gmail.com', '$2b$10$2nF2wRdIXIfGGFeFYJHYtOhuyufINNFC/pvZr/bAftSh6l4mql3H2', 'Mohan Kumar Indala', '', 'vignan', '7780123277', '', '', 'reviewer', '2026-02-06 14:08:13', NULL, NULL, 'India', 0, NULL),
(3, 'indalamohankumar21@gmail.com', '$2b$10$m6iHhngwesUoMWr/iPAuaepnWyTSiWv7ubOwAnVl0jwdzHdiICDAa', 'Indala Mohankumar', NULL, NULL, NULL, NULL, NULL, 'editor', '2026-02-06 14:24:33', NULL, NULL, 'India', 0, NULL),
(4, 'razh1976@gmail.com', '$2b$10$82mvRvTC4qGrcZWaIxe37eAvSGyfLNu45aKuiogg29q1NRLGZgMRa', 'T R babu', 'Associate Professor', 'Miracle Educational Society Group of Institutions', NULL, NULL, '/uploads/reviewer-apps/1771082901394-IMG20230527071713.jpg', 'reviewer', '2026-02-14 15:49:00', NULL, NULL, 'India', 0, NULL),
(5, 'somasekhar.ece@anits.edu.in', '$2b$10$p83k/rGRp24YN44Uao3xFeLoYFHfEZna9pY8sg5qdq2jShzvXRK/W', 'Dr.B.Somasekhar', 'Professor', 'Anil Neerukonda Institute of Technology & Sciences', NULL, NULL, '/uploads/reviewer-apps/1771156198892-Dr._Borugadda_Soma_Sekhar_100443_Professor__ECE_Department.png', 'editor', '2026-02-15 12:22:35', NULL, NULL, 'India', 0, NULL),
(6, 'manohar@gvpcdpgc.edu.in', '$2b$10$AD6WPbFIDVEoOoPZUCZAfeHqZ4YoQjexBjQOO6.3bDReU30H20AFK', 'Dr Ch Manohar Kumar', 'Associate Professor', 'gayatri Vidya Parishad College for Degree and PG Courses(A)', NULL, NULL, '/uploads/reviewer-apps/1771489588377-Mr.-Ch.-Manohar-Kumar.jpg', 'reviewer', '2026-02-19 16:12:14', NULL, NULL, 'India', 0, NULL),
(7, 'venkatesh15793@gmail.com', '$2b$10$vCuOl9r0XinmX3pezxSBqOLGzBD3P5UgMh/D1XZWyDdtnisNaDmtK', 'Dr Appalabathula Venkatesh', 'Assistant Professor', 'Anil Neerukonda Institute of Technology and Sciences', '', 'APPALABATHULA VENKATESH (Professional Member, IEEE) received a Bachelor\'s in Engineering in Electrical and Electronics Engineering from Lendi Institute of Technology and Sciences in 2014 and a Master\'s in Engineering in Control Systems in 2018, from Anil Neerukonda Institute of Technology and Sciences, Andhra Pradesh, India, and a Ph.D. in the Area of Hybrid Electric Vehicles from the National Institute of Engineering, Mysuru, Karnataka, India, in 2023. \r\nHe has over five years of teaching experience and is currently an Assistant Professor in the Department of Electrical and Electronics Engineering at Anil Neerukonda Institute of Technology and Sciences, India. He also served as a Post-Doctoral Research Intern in the Department of Electrical and Electronics Engineering, School of Engineering and Sciences, SRM University, Amaravati, India.\r\nHe has published His research interests include electric and hybrid electric vehicles, fuel cell-based vehicle systems, intelligent control design for power electronic converters, heuristic optimization, bidirectional DC–DC converters, grid-integrated hybrid renewable systems, and AI/ML-based control strategies. \r\nHe currently serves as an IEEE VTS Young Professionals (YP) Ambassador and Lead Entrepreneurship Ambassador of the IEEE Vizag Bay Section (2024–2025). He is also a member of the IEEE Region 10 Adhoc Committee on Entrepreneurship and Innovation (ACEI), Innovation Ambassador.', '/uploads/profiles/undefined-1774919094662-Screenshot-2026-02-19-124056.jpg', 'reviewer', '2026-02-19 16:12:20', NULL, NULL, 'India', 0, NULL),
(12, 'swapnachsp@gmail.com', '$2b$10$S3VJhjb7uats5M8.eKctHeoiu2fIDsZfvimEDmMTOY8UFMoiFh12m', 'Dr. CH. Swapna Priya ', NULL, 'Dept of Computer Science Engineering, Vigyan Institute of Technology, India', NULL, NULL, NULL, 'editor', '2026-03-03 14:06:00', NULL, NULL, 'India', 0, NULL),
(13, 'skaredla@gitam.edu', NULL, 'Dr. K. Srinivas', NULL, 'Dept of Management, MES Group of Institutions, India', NULL, NULL, NULL, 'editor', '2026-03-03 14:08:13', '09de0294e967aeb6a30abfeda5a51c62340e2d9aeb8a20b4e1143bdd46f95c3d', '2026-03-04 14:08:13', 'India', 0, NULL),
(17, 'jackbenison12@gmail.com', NULL, 'Dr. T.  babu', NULL, NULL, NULL, NULL, NULL, 'editor', '2026-03-03 14:09:25', 'c606a2bab40b8cdae84258591cbd5da5e7fd771750d5ee06337519e2abb54438', '2026-03-04 14:09:25', 'India', 0, NULL),
(22, 'norsuzila@salam.uitm.edu.my', '$2b$10$SoJp3xko/HImNINIVY2RjO9Vk17ERTTcijrIXECZ.f1/2EtiEwZfm', 'Prof.Ir.Gs.Ts. Dr. Norsuzila Ya\'acob', '', 'Faculty of Electrical Engineering University of Teknologi MARA,Shah Alam, Malaysia', '', '', '', 'editor', '2026-03-03 14:29:56', NULL, NULL, 'Malaysia', 0, NULL),
(23, 'razh1977@gmail.com', NULL, 'T R', NULL, NULL, NULL, NULL, NULL, 'editor', '2026-03-03 15:34:37', 'a52772afc7c330f652056cdb27b926b8a7de3476dbb421a69981f3d2cc2d28b2', '2026-03-31 08:51:10', 'India', 0, NULL),
(24, 'trinadhphd33@gmail.com', NULL, 'Dr.Trinadha Rao challa', 'Associate Professor', 'Jntugv University ', NULL, NULL, '/uploads/reviewer-apps/1772620698103-Trinadh-Rao-Challa.jpg', 'editor', '2026-03-05 15:56:46', '46a219ab8c1a6157080a9886c7342c574ce6595408da12cdbcdb637f4cf53088', '2026-03-06 15:56:46', 'India', 0, NULL),
(25, 'mr.challa33@gmail.com', NULL, 'Dr.Trinadha Rao challa', 'Associate Professor', 'Jntugv University ', NULL, NULL, '/uploads/reviewer-apps/1772620431806-Trinadh-Rao-Challa-(1).jpg', 'reviewer', '2026-03-05 15:56:53', '2f0d0f6f1068bb271034e7e22878c5660fa2e090e756ff31d6d898c5f73b8b52', '2026-03-06 15:56:53', 'India', 0, NULL);

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
  `status` enum('open','published') DEFAULT 'open',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `volumes_issues`
--

INSERT INTO `volumes_issues` (`id`, `volume_number`, `issue_number`, `year`, `month_range`, `status`, `created_at`) VALUES
(5, 1, 1, 2026, 'March', 'open', '2026-03-14 08:01:13');

-- --------------------------------------------------------

--
-- Table structure for table `__drizzle_migrations`
--

CREATE TABLE `__drizzle_migrations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `hash` text NOT NULL,
  `created_at` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `__drizzle_migrations`
--

INSERT INTO `__drizzle_migrations` (`id`, `hash`, `created_at`) VALUES
(1, 'b0bc9b167e5f85dff13044c8274017bb85f61b72e1654986b8ab17f2e8824298', 1772554520069),
(2, '1150a2db732200dbc7e8cad82e57280b908f3002e125caaca673f5dc04f6854b', 1772555249974),
(3, '986e50815ddbdcedb491d2902a6609d278d98e387c8964bb402677f27645555d', 1772726659943);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `app_status_idx` (`status`),
  ADD KEY `app_type_idx` (`application_type`),
  ADD KEY `reviewed_by_idx` (`reviewed_by`);

--
-- Indexes for table `application_interests`
--
ALTER TABLE `application_interests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `app_interest_idx` (`application_id`),
  ADD KEY `interest_val_idx` (`interest`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `msg_status_idx` (`status`),
  ADD KEY `resolved_by_msg_idx` (`resolved_by`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submission_id` (`submission_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submission_id` (`submission_id`),
  ADD KEY `reviewer_id` (`reviewer_id`);

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
  ADD UNIQUE KEY `paper_id` (`paper_id`),
  ADD KEY `issue_id` (`issue_id`),
  ADD KEY `author_email_idx` (`author_email`),
  ADD KEY `status_idx` (`status`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `invitation_token` (`invitation_token`),
  ADD KEY `role_idx` (`role`);

--
-- Indexes for table `volumes_issues`
--
ALTER TABLE `volumes_issues`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `__drizzle_migrations`
--
ALTER TABLE `__drizzle_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `application_interests`
--
ALTER TABLE `application_interests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `submissions`
--
ALTER TABLE `submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `volumes_issues`
--
ALTER TABLE `volumes_issues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `__drizzle_migrations`
--
ALTER TABLE `__drizzle_migrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `applications_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `application_interests`
--
ALTER TABLE `application_interests`
  ADD CONSTRAINT `application_interests_application_id_applications_id_fk` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD CONSTRAINT `contact_messages_resolved_by_users_id_fk` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  ADD CONSTRAINT `payments_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `reviews_reviewer_id_users_id_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `reviews_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `submissions`
--
ALTER TABLE `submissions`
  ADD CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`issue_id`) REFERENCES `volumes_issues` (`id`),
  ADD CONSTRAINT `submissions_issue_id_volumes_issues_id_fk` FOREIGN KEY (`issue_id`) REFERENCES `volumes_issues` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
