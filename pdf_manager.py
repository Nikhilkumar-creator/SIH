from pathlib import Path
import hashlib
from PyPDF2 import PdfReader
from database import add_document, get_documents, delete_document
UPLOAD_ROOT = Path("icebound_documents")
UPLOAD_ROOT.mkdir(exist_ok=True)
def list_user_documents(user_id):
    return get_documents(user_id)
def save_pdf(uploaded_file, user_id):
    if not uploaded_file.name.lower().endswith(".pdf"):
        raise ValueError("Only PDF files are supported.")

    user_dir = UPLOAD_ROOT / str(user_id)
    user_dir.mkdir(exist_ok=True)

    safe_name = Path(uploaded_file.name).name
    content = uploaded_file.getvalue()
    file_hash = hashlib.sha256(content).hexdigest()[:10]
    path = user_dir/ f"{file_hash}_{safe_name}"
    path.write_bytes(content)

    doc_id = add_document(user_id, safe_name, str(path))
    return doc_id, path



