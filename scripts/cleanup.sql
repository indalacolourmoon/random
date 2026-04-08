-- ==========================================================
-- 🛠️ DATA CLEANUP & CORRECTION SCRIPT (VERIFIED V2)
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Remove duplicate authors (IDs 12-20 are exact duplicates of 3-11)
DELETE FROM `submission_authors` WHERE id BETWEEN 12 AND 20;

-- 2. Remove duplicate submission files (IDs 11-17 are exact duplicates of 4-10)
DELETE FROM `submission_files` WHERE id BETWEEN 11 AND 17;

-- 3. Revert status of manuscripts that shouldn't be published yet
-- Papers: 16 (6G Framework), 18 (Ternary Logic), 19 (RNN and CNN)
-- Status: Set to 'submitted' as requested
UPDATE `submissions` 
SET `status` = 'submitted', 
    `issue_id` = NULL 
WHERE `id` IN (16, 18, 19);

-- 4. Remove publication records for those manuscripts
DELETE FROM `publications` WHERE `submission_id` IN (16, 18, 19);

-- 5. Fix Paper 15 (IJITEST-2026-002) Publication URL
-- Pointing to the file in /uploads/published/ as verified in public directory
UPDATE `publications`
SET `final_pdf_url` = '/uploads/published/IJITEST-2026-002-published.pdf'
WHERE `submission_id` = 15;

-- 6. Final verification check 
-- Expected: 2 Published, 3 Submitted
SELECT status, COUNT(*) as count FROM submissions GROUP BY status;
-- Expected: 9 Lead/Co-authors total (3 for P13, 2 for P15, 2 for P16, 1 for P18, 1 for P19)
SELECT count(*) as total_authors FROM submission_authors;

SET FOREIGN_KEY_CHECKS = 1;
