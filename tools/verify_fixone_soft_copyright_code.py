from pathlib import Path
from zipfile import ZipFile
import re
import sys

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "outputs" / "soft-copyright"
DOCX = OUT_DIR / "Fixone视修工坊软件著作权源代码60页.docx"
PDF = OUT_DIR / "Fixone视修工坊软件著作权源代码60页.pdf"
TXT = OUT_DIR / "Fixone视修工坊软件著作权源代码60页.txt"


def main():
    with ZipFile(DOCX) as archive:
        xml = archive.read("word/document.xml").decode("utf-8")

    checks = {
        "docx_exists": DOCX.exists(),
        "txt_exists": TXT.exists(),
        "docx_bytes": DOCX.stat().st_size if DOCX.exists() else 0,
        "txt_bytes": TXT.stat().st_size if TXT.exists() else 0,
        "page_breaks": xml.count('w:type="page"'),
        "code_line_prefixes": len(re.findall(r">\d{4}\s\s", xml)),
        "page_headers": xml.count("Fixone视修工坊源代码"),
    }

    if PDF.exists():
        reader = PdfReader(str(PDF))
        checks["pdf_pages"] = len(reader.pages)
    else:
        checks["pdf_pages"] = 0

    for key, value in checks.items():
        print(f"{key}: {value}")

    expected = {
        "docx_exists": True,
        "txt_exists": True,
        "page_breaks": 59,
        "code_line_prefixes": 3000,
        "page_headers": 60,
        "pdf_pages": 60,
    }
    failed = [key for key, value in expected.items() if checks.get(key) != value]
    if failed:
        print("failed:", ", ".join(failed), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
