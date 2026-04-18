-- ==========================================================
-- IJITEST Database Cleanup & Sequential Ordering Migration
-- ==========================================================
-- Goal: Restore sequential integrity and fix METADATA SWAP for Papers 004 & 005.
-- This script fixes the 'publications' IDs, 'submission_versions', and swaps Paper 4/5 logic.
-- PRE-REQUISITE: Ensure a database backup is taken before execution.

START TRANSACTION;

-- [1] Deduplicate Authors
DELETE FROM `submission_authors` WHERE `id` BETWEEN 50 AND 72;

-- [2] Swap Paper 4 and Paper 5 Metadata in 'submissions' table
-- Submission 19 is now Paper 004 (RNN and CNN)
-- Submission 18 is now Paper 005 (Energy-Efficient)
UPDATE `submissions` SET `paper_id` = 'IJITEST-2026-TEMP', `slug` = 'TEMP-SLUG' WHERE `id` = 18;
UPDATE `submissions` SET `paper_id` = 'IJITEST-2026-004', `slug` = 'rnn-cnn-em-gamp-sparse-channel' WHERE `id` = 19;
UPDATE `submissions` SET `paper_id` = 'IJITEST-2026-005', `slug` = 'energy-efficient-ternary-logic-cntfet' WHERE `id` = 18;

-- [3] Re-index Publications Table
-- Reset Auto-Increment and ensure IDs 1-10 match Paper Sequence 001-010.
TRUNCATE TABLE `publications`;
ALTER TABLE `publications` AUTO_INCREMENT = 1;

-- Mapping with SWAP applied:
-- ID 4 -> Sub 19 (New Paper 4)
-- ID 5 -> Sub 18 (New Paper 5)
INSERT INTO `publications` (`id`, `submission_id`, `issue_id`, `final_pdf_url`, `start_page`, `end_page`, `doi`, `published_at`) VALUES
(1,  13, 1, '/uploads/published/IJITEST-2026-001-published.pdf', 1, 7, NULL, '2026-03-15 09:00:00'),
(2,  15, 1, '/uploads/published/IJITEST-2026-002-published.pdf', 8, 12, NULL, '2026-03-29 09:00:00'),
(3,  16, 1, '/uploads/published/IJITEST-2026-003-published.pdf', 13, 20, NULL, '2026-03-29 09:20:00'),
(4,  19, 1, '/uploads/published/IJITEST-2026-004-published.pdf', 21, 26, NULL, '2026-03-30 09:00:00'),
(5,  18, 1, '/uploads/published/IJITEST-2026-005-published.pdf', 27, 32, NULL, '2026-03-31 09:00:00'),
(6,  20, 1, '/uploads/published/IJITEST-2026-006-published.pdf', 33, 37, NULL, '2026-03-31 09:10:00'),
(7,  21, 1, '/uploads/published/IJITEST-2026-007-published.pdf', 38, 41, NULL, '2026-03-31 09:20:00'),
(8,  22, 1, '/uploads/published/IJITEST-2026-008-published.pdf', 42, 45, NULL, '2026-03-31 09:30:00'),
(9,  23, 1, '/uploads/published/IJITEST-2026-009-published.pdf', 46, 49, NULL, '2026-03-31 09:40:00'),
(10, 24, 1, '/uploads/published/IJITEST-2026-010-published.pdf', 50, 53, NULL, '2026-03-31 09:50:00');

-- [4] Re-index Submission Versions
-- Reset Auto-Increment and ensure version metadata aligns with sequential display.
CREATE TEMPORARY TABLE `tmp_versions` AS SELECT * FROM `submission_versions`;
TRUNCATE TABLE `submission_versions`;
ALTER TABLE `submission_versions` AUTO_INCREMENT = 1;

INSERT INTO `submission_versions` (`id`, `submission_id`, `version_number`, `title`, `abstract`, `keywords`, `subject_area`, `changelog`, `created_at`)
SELECT `id`, `submission_id`, `version_number`, `title`, `abstract`, `keywords`, `subject_area`, `changelog`, `created_at`
FROM `tmp_versions`
ORDER BY (
    CASE 
        WHEN submission_id = 13 THEN 1
        WHEN submission_id = 15 THEN 2
        WHEN submission_id = 16 THEN 3
        WHEN submission_id = 19 THEN 4 -- Swapped
        WHEN submission_id = 18 THEN 5 -- Swapped
        WHEN submission_id = 20 THEN 6
        WHEN submission_id = 21 THEN 7
        WHEN submission_id = 22 THEN 8
        WHEN submission_id = 23 THEN 9
        WHEN submission_id = 24 THEN 10
        ELSE 999
    END
) ASC;

DROP TEMPORARY TABLE `tmp_versions`;

-- [5] Align Submission Timestamps
UPDATE `submissions` SET `submitted_at` = '2026-03-25 09:00:00', `updated_at` = '2026-03-25 09:00:00' WHERE `id` = 13;
UPDATE `submissions` SET `submitted_at` = '2026-03-25 09:10:00', `updated_at` = '2026-03-25 09:10:00' WHERE `id` = 15;
UPDATE `submissions` SET `submitted_at` = '2026-03-25 09:20:00', `updated_at` = '2026-03-25 09:20:00' WHERE `id` = 16;
UPDATE `submissions` SET `submitted_at` = '2026-03-25 09:30:00', `updated_at` = '2026-03-25 09:30:00' WHERE `id` = 19; -- Paper 4
UPDATE `submissions` SET `submitted_at` = '2026-03-25 09:40:00', `updated_at` = '2026-03-25 09:40:00' WHERE `id` = 18; -- Paper 5
UPDATE `submissions` SET `submitted_at` = '2026-03-25 09:50:00', `updated_at` = '2026-03-25 09:50:00' WHERE `id` = 20;
UPDATE `submissions` SET `submitted_at` = '2026-03-25 10:00:00', `updated_at` = '2026-03-25 10:00:00' WHERE `id` = 21;
UPDATE `submissions` SET `submitted_at` = '2026-03-25 10:10:00', `updated_at` = '2026-03-25 10:10:00' WHERE `id` = 22;
UPDATE `submissions` SET `submitted_at` = '2026-03-25 10:20:00', `updated_at` = '2026-03-25 10:20:00' WHERE `id` = 23;
UPDATE `submissions` SET `submitted_at` = '2026-03-25 10:30:00', `updated_at` = '2026-03-25 10:30:00' WHERE `id` = 24;

COMMIT;
