# website.md

## Overview
This document captures the patterns and locations in the codebase that control the **branding** and **website‑specific information** for the IJITEST journal platform.

---

## 1. Site‑wide static metadata (Open Graph, Twitter, favicons)
- **File:** `src/app/layout.tsx`
- The `metadata` export defines the core SEO and social‑media cards for the public site.
- Key fields:
  - `metadataBase` – base URL, defaults to `https://ijitest.org` (or the value of `NEXT_PUBLIC_APP_URL`).
  - `title.default` / `title.template` – uses the short journal name *IJITEST*.
  - `openGraph` and `twitter` sections contain the site URL, images, and descriptions.
  - `icons` points to the favicon assets in `public/favicon_io/`.
- Changing any of these values impacts the HTML `<head>` for **all** pages.

---

## 2. Dynamic branding data stored in the database
- **File:** `src/actions/settings.ts`
- `getSettings()` reads the `settings` table and merges the rows with a hard‑coded default object.
- Relevant keys (used elsewhere for branding):
  - `journal_name` – Full journal title.
  - `journal_short_name` – Short name shown in titles.
  - `issn_number` – ISSN displayed on PDFs and citations.
  - `journal_website` – Canonical website URL (default `https://ijitest.org`).
  - `publisher_name`, `support_email`, `support_phone`, etc.
- Updating these values via the admin UI calls `updateSettings()`, which writes to the DB and triggers a re‑validation of affected routes.

---

## 3. PDF branding (adding journal header/footer to PDFs)
- **File:** `src/lib/pdf-branding.ts`
- The exported `brandPdf(inputPath, outputPath, metadata)` inserts a logo, header lines, and a footer that includes:
  - `metadata.website` – rendered in the footer as a blue link.
  - `metadata.journalName`, `metadata.journalShortName`, and `metadata.issn` – shown in the header.
- The function is invoked by the publication workflow to produce the final published PDF.

---

## 4. Publication workflow that applies branding
- **File:** `src/actions/publications.ts`
- Inside `assignPaperToIssue()` the code builds a `metadata` object for `brandPdf`:
  ```ts
  await brandPdf(submission.pdf_url, brandedRelativePath, {
    journalName: settings.journal_name,
    journalShortName: settings.journal_short_name,
    volume: issue.volume_number,
    issue: issue.issue_number,
    year: issue.year,
    monthRange: issue.month_range,
    issn: settings.issn_number,
    website: settings.journal_website,
    paperId: submission.paper_id,
    startPage: finalStartPage,
    endPage: finalEndPage,
  });
  ```
- This ties the **dynamic settings** (section 2) to the **PDF branding** (section 3).

---

## 5. Page‑level metadata for archived articles
- **File:** `src/app/(main)/archives/[id]/page.tsx`
- `generateMetadata()` builds Open Graph and citation meta tags using:
  - `settings.journal_website` for absolute PDF URLs.
  - `settings.journal_name` for citation fields (`citation_journal_title`).
  - Author list, volume/issue numbers, and page range.
- These tags are important for scholarly indexing (Google Scholar, CrossRef) and rely on the same branding settings as the PDFs.

---

## 6. How to modify branding
1. **Update via Admin UI** – edit the Settings page; the form posts to `updateSettings()` which persists changes to the `settings` table.
2. **Direct DB edit** – run a SQL `UPDATE settings SET setting_value = 'new value' WHERE setting_key = 'journal_website';` and then re‑validate the site (`npm run dev` will pick up the change).
3. **Static metadata** – to change favicons, Open Graph images, or default titles, edit `src/app/layout.tsx` and restart the dev server.

---

## 7. Summary of branding touchpoints
| Component | Purpose | Key branding fields |
|----------|---------|----------------------|
| `layout.tsx` | Global HTML `<head>` metadata | `metadataBase`, titles, OG/Twitter cards, icons |
| `settings.ts` | Central source of truth in DB | `journal_name`, `journal_short_name`, `journal_website`, `issn_number` |
| `pdf-branding.ts` | Visual branding on PDFs | `website`, `journalName`, `issn`, etc. |
| `publications.ts` (assignPaperToIssue) | Applies PDF branding during publication |
| `archives/[id]/page.tsx` | Generates article‑level meta tags for SEO and citation |

Use this guide to locate and adjust any branding‑related logic across the repository.
