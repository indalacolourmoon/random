# Project Plan: Author Dashboard & Publication Lifecycle

This document serves as the high-level roadmap for the **Author Dashboard** implementation and the comprehensive **Publication Lifecycle** integration for the IJITEST platform.

---

## 📅 Roadmap Overview

### Phase 0: System Stability (The "Current Problems" Fix)
**Goal:** Resolve all identified lint errors and type-safety regressions to ensure a clean foundation for feature work.
- [ ] **Action:** Fix missing imports (`and`, `eq`, `sql`, `desc`, `inArray`) in `author-submissions.ts`.
- [ ] **Action:** Standardize `ActionResponse` return objects in `messages.ts` and `publications.ts`.
- [ ] **Action:** Correct the import typo in `(main)/layout.tsx`.

---

### Phase 1: High-Integrity Author Portal
**Goal:** Deliver a robust portal for authors to manage submissions with strict transactional file handling.
- [ ] **Transactional Logic**: Implement the "DB-Commit -> FS-Write -> Rollback-on-Failure" pattern for new submissions and revisions.
- [ ] **Author Dashboard**: Enhance `src/app/(panel)/author/page.tsx` with detailed manuscript status history and actionable publication tracking.
- [ ] **15-Day Cleanup**: Implement the `cleanupInActiveAuthors` logic for papers in `revision_requested` or `rejected` status.

---

### Phase 2: Professional Notification System
**Goal:** Automate multi-role communication using NodeMailer.
- [ ] **Author Enrollment**: Automated account creation and credential delivery upon first submission.
- [ ] **Staff Deep-Links**: Direct links in Admin/Editor email notifications for instant submission review.
- [ ] **Co-Author Sync**: Notification-only emails for collaborators.

---

### Phase 3: Reviewer Assignment Pipeline
**Goal:** Streamline the transition from Submission to Peer Review.
- [ ] **iLovePDF Integration**: Automatic conversion of `.docx` manuscripts to standard PDF during the assignment phase.
- [ ] **Reviewer Experience**: Direct-link notifications for reviewers, bypassing landing pages.
- [ ] **Assignment Guard**: Enforce the maximum limit of 6 reviewers per paper.

---

### Phase 4: Final Publication & Branding
**Goal:** Automate the metadata formatting and PDF branding.
- [ ] **Razorpay Integration**: Trigger payment modals for accepted papers with non-zero fees.
- [ ] **Volume/Issue Management**: Multi-manuscript select-to-publish utility in the Admin panel.
- [ ] **Automated Branding**: Use `src/lib/pdf-branding.ts` to apply journal headers/footers to the final submission.
- [ ] **Paper Numbering**: Dynamic generation and assignment of unique paper numbers.

---

### Phase 5: Internal Operations & Messaging
**Goal:** Foster collaboration between Admin and Editors.
- [ ] **Role Management**: Enhanced Admin tools for Editor/Reviewer management with DB integrity checks.
- [ ] **Messaging System**: Socket.io real-time chat between Admin and Editors, with a persistent DB fallback for Hostinger/Passenger environments.

---

## 🛠️ Verification Checklist

### Deployment Integrity
- [ ] **Hostinger Compatibility**: Verify Passenger Node.js compatibility for PDF manipulation and file writes.
- [ ] **Transaction Consistency**: Force a FS failure and verify that no "bloat" records remain in the DB.

### UI/UX Standards
- [ ] **Dashboard Responsive Check**: Ensure the Author Portal is fully functional on mobile devices for status tracking.
- [ ] **Accessibility**: Pass the `accessibility_checker.py` audit for all new Author components.

---
**Next Steps:**
- [ ] Review the plan above.
- [ ] Request approval to start Phase 0.
