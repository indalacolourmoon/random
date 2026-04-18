import pdfplumber
import os

pdf_path = r'public\uploads\published\IJITEST-2026-001-published.pdf'

if not os.path.exists(pdf_path):
    print(f"Error: {pdf_path} not found")
    sys.exit(1)

with pdfplumber.open(pdf_path) as pdf:
    first_page = pdf.pages[0]
    text = first_page.extract_text()
    print("--- FIRST PAGE TEXT ---")
    print(text)
    print("--- END ---")
