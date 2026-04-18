import pdfplumber
import glob
import os

files = sorted(glob.glob('public/uploads/published/IJITEST-2026-00[6789]*.pdf') + glob.glob('public/uploads/published/IJITEST-2026-010*.pdf'))

for f in files:
    print(f"\n--- {os.path.basename(f)} ---")
    with pdfplumber.open(f) as pdf:
        text = pdf.pages[0].extract_text()
        if text:
            lines = text.split('\n')
            print('\n'.join(lines[:30]))
        else:
            print("No text extracted")
