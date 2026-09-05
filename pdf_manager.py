from pathlib import Path
import hashlib
from PyPDF2 import PdfReader
from database import add_document, get_documents, delete_document
UPLOAD_ROOT = Path("icebound_documents")
UPLOAD_ROOT.mkdir(exist_ok=True)
def list_user_documents(user_id):
    return get_documents(user_id)


