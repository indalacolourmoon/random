import pdfplumber
import re
import glob
import os

files = sorted(glob.glob('public/uploads/published/*.pdf'))

for f in files:
    with pdfplumber.open(f) as pdf:
        text = pdf.pages[0].extract_text()
        date_match = re.search(r'Published online:\s*(.*)', text)
        print(f"{os.path.basename(f)}: {date_match.group(1).split()[0:3] if date_match else 'NOT FOUND'}")
