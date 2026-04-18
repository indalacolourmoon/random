import sys
import os

try:
    import PyPDF2
    print("PyPDF2 is installed")
except ImportError:
    print("PyPDF2 is NOT installed")

pdf_path = r'c:\Users\Mohan Kumar Indala\OneDrive\Desktop\p2\goal ijitest\ijitest\public\uploads\published\IJITEST-2026-001-published.pdf'

if os.path.exists(pdf_path):
    print(f"File exists: {pdf_path}")
    try:
        import PyPDF2
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            text = reader.pages[0].extract_text()
            print("--- FIRST 1000 CHARACTERS ---")
            print(text[:1000])
    except Exception as e:
        print(f"Error reading PDF: {e}")
else:
    print(f"File NOT found: {pdf_path}")
