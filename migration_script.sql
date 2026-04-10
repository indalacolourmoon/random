-- Standalone Migration Script for Hostinger (MySQL/MariaDB)
-- Purpose: Replace abstracts with clean versions and publish papers 3, 4, 5.

SET SQL_SAFE_UPDATES = 0;

-- 1. Update Abstracts in submission_versions
-- Processing Paper 1 (ID 13)
UPDATE `submission_versions` 
SET `abstract` = 'The emergence of Industry 5.0 predicts a paradigm shift in industrial development, as cutting-edge devices—such as AI-enhanced robots—collaborate harmoniously with human labourers to maximize productivity. This phase emphasizes the significance of human engagement while emphasizing sustainability and resilience.  This development based on innovations has led to industry 4.0, the fourth industrial revolution has changed production and production techniques. Changes are motivated by the strong progress of automation, robots, Big data, Internet of Things, Machine learning, artificial intelligence and virtualization. In addition to the successful automation and technological integration of its predecessor, largely related to production and efficiency stimulation, industry 5.0 to create both sustainable innovations and focus on people. Looking for a long -term balance between technology development and environmental protection and the happiness of our society is the main goal. This requires intentional approach to innovation, ensuring that our progress increases the living standards of people while benefiting our natural systems to support us.' 
WHERE `submission_id` = 13;

-- Processing Paper 2 (ID 15)
UPDATE `submission_versions` 
SET `abstract` = 'The evolution toward sixth-generation (6G) wireless systems requires extremely high data rates, massive device connectivity, very low latency, and improved energy efficiency. Millimeter-wave (mmWave) communication is considered a key enabler due to its large available bandwidth and ability to support multi-gigabit transmission. Nevertheless, mmWave signals experience high path loss, vulnerability to blockage, and increased implementation complexity caused by large antenna arrays and multiple RF chains. To overcome these limitations, this thesis explores the integration of Reconfigurable Intelligent Surfaces (RIS) with hybrid analog–digital precoding in mmWave Massive MIMO systems. RIS enables intelligent control of signal propagation by adjusting the phase of reflected waves, while hybrid precoding reduces hardware cost and power consumption without significantly degrading performance. A detailed system model, mathematical analysis, and optimization strategies for precoders and RIS phase shifts are presented. Performance evaluation based on spectral efficiency, energy efficiency, and hardware complexity demonstrates that RIS-assisted hybrid architectures provide notable improvements in coverage, achievable rate, and power utilization.' 
WHERE `submission_id` = 15;

-- Processing Paper 3 (ID 16)
UPDATE `submission_versions` 
SET `abstract` = '– Ultra-high data rates, efficient use of the terahertz spectrum, and significant connectivity are anticipated as Sixth Generation (6G) wireless communication emerges. However, traditional cryptographic algorithms like RSA and Elliptic Curve Cryptography, which are currently employed in wireless networks, are seriously threatened by the quick development of quantum computing. Future 6G systems must incorporate quantum-safe security measures to allay this worry. The incorporation of Quantum Key Distribution (QKD) into the physical layer of 6G communication networks is investigated in this paper. To facilitate secure key exchange and identify eavesdropping, QKD makes use of quantum concepts like superposition, entanglement, and the no-cloning theorem. Realistic wireless channel conditions are used to analyze the BB84 and E91 protocols. A proposed 6G channel model incorporates Nakagami-m fading, additive white Gaussian noise, and path loss. Detector noise and channel disturbances are taken into account when modeling the Quantum Bit Error Rate (QBER). In an OFDM framework, MATLAB simulations evaluate the secure key rate performance with respect to signal-to-noise ratio, transmission distance, and noise probability. The findings highlight the potential of QKD for secure 6G communications by showing that secure key generation is possible when the QBER stays below the theoretical threshold.' 
WHERE `submission_id` = 16;

-- Processing Paper 4 (ID 18)
UPDATE `submission_versions` 
SET `abstract` = 'The increasing demand for energy-efficient computing has driven research into novel logic architectures beyond traditional binary logic. This paper presents the design and implementation of an energy-efficient ternary logic processor using Carbon Nanotube Field-Effect Transistors (CNTFETs) for advanced nanotechnology applications. Ternary logic, which operates with three discrete states (0, 1, 2), offers higher computational density, reduced transistor count, and lower power consumption compared to conventional binary architectures. CNTFETs, with their superior electrical properties such as high carrier mobility, low sub-threshold swing, and excellent scalability, serve as an ideal candidate for implementing ternary logic circuits. The proposed ternary processor integrates ternary logic gates, arithmetic units, multiplexers, memory units, and control circuits, all optimized for low-power operation. Simulation results demonstrate significant improvements in energy efficiency, area reduction, and computational throughput compared to conventional CMOS-based binary processors. Additionally, the processor\'s architecture is tailored for emerging applications in artificial intelligence, cryptography, and IoT devices, where power efficiency and performance are critical. The findings of this study highlight the potential of CNTFET-based ternary computing as a promising alternative for next-generation low-power processors in nanotechnology-driven applications.' 
WHERE `submission_id` = 18;

-- Processing Paper 5 (ID 19)
UPDATE `submission_versions` 
SET `abstract` = 'Quantum Compressed Sensing (QCS) is an efficient framework that exploits signal sparsity to reconstruct quantum states and quantum-inspired communication signals using fewer measurements than conventional approaches. It combines compressed sensing theory with quantum information processing to reduce sampling complexity and computational cost in high dimensional systems. Advanced estimation techniques such as OMP-based methods, deep learning-assisted recovery, and quantum-inspired neural models improve reconstruction accuracy under noisy conditions. These approaches utilize sparsity in quantum states, wireless channels, and system parameters while lowering the burden of quantum measurements. QCS is particularly useful in emerging applications like next-generation wireless networks, quantum sensing, and optical communication where measurement resources are limited. Compared to classical compressed sensing, QCS methods offer better scalability and stronger resilience to estimation errors. They also enable modeling of quantum features such as superposition and correlated system behavior. Performance evaluation is typically carried out using metrics like BER versus SNR, MMSE, and recovery accuracy. Overall, QCS supports efficient signal acquisition and reliable estimation in large-scale quantum-aware systems.' 
WHERE `submission_id` = 19;


-- 2. Update status and issue_id in submissions table for papers 3, 4, 5
UPDATE `submissions` 
SET `status` = 'published', `issue_id` = 1 
WHERE `id` IN (16, 18, 19);


-- 3. Insert records into publications table for papers 3, 4, 5
INSERT INTO `publications` (`submission_id`, `issue_id`, `final_pdf_url`, `start_page`, `end_page`, `published_at`) 
VALUES 
(16, 1, '/uploads/published/IJITEST-2026-003-published.pdf', 13, 20, NOW()),
(18, 1, '/uploads/published/IJITEST-2026-004-published.pdf', 21, 26, NOW()),
(19, 1, '/uploads/published/IJITEST-2026-005-published.pdf', 27, 32, NOW())
ON DUPLICATE KEY UPDATE 
`issue_id` = VALUES(`issue_id`), 
`final_pdf_url` = VALUES(`final_pdf_url`), 
`start_page` = VALUES(`start_page`), 
`end_page` = VALUES(`end_page`);

SET SQL_SAFE_UPDATES = 1;
