from pathlib import Path
import re
from PyPDF2 import PdfReader

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
MEDIA_DIR = BASE_DIR / "media"
UPLOAD_DIR.mkdir(exist_ok=True)
MEDIA_DIR.mkdir(exist_ok=True)

def safe_filename(filename):
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "_", filename)
    return cleaned.strip("._") or "file"

def save_uploaded_pdf(uploaded_file):
    filename = safe_filename(uploaded_file.name)
    target = UPLOAD_DIR / filename
    counter = 1
    while target.exists():
        target = UPLOAD_DIR / f"{Path(filename).stem}_{counter}{Path(filename).suffix}"
        counter += 1
    target.write_bytes(uploaded_file.getvalue())
    return target

def extract_pdf_text(path):
    reader = PdfReader(str(path))
    text = []
    for page in reader.pages:
        try:
            text.append(page.extract_text() or "")
        except Exception:
            text.append("")
    return "\n".join(text).strip()

def save_media(uploaded_file):
    filename = safe_filename(uploaded_file.name)
    target = MEDIA_DIR / filename
    counter = 1
    while target.exists():
        target = MEDIA_DIR / f"{Path(filename).stem}_{counter}{Path(filename).suffix}"
        counter += 1
    target.write_bytes(uploaded_file.getvalue())
    return target

def get_file_path(filename, media=False):
    base = MEDIA_DIR if media else UPLOAD_DIR
    path = base / safe_filename(filename)
    return path if path.exists() else None

def delete_file(filename, media=False):
    path = get_file_path(filename, media)
    if path and path.exists():
        path.unlink()
        return True
    return False
