import pdfplumber

pdf_path = 'public/uploads/published/IJITEST-2026-001-published.pdf'
with pdfplumber.open(pdf_path) as pdf:
    text = pdf.pages[0].extract_text()
    print(text)
