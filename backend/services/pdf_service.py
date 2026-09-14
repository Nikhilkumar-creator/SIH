"""Document parsing. Kept separate from routing/business logic per the
project's separation-of-concerns rule."""
from pypdf import PdfReader
from pypdf.errors import PdfReadError
from fastapi import UploadFile, HTTPException, status

MAX_PAGES = 25  # cap so a 500-page report can't hang the request


def extract_text(file: UploadFile, max_pages: int = MAX_PAGES) -> str:
    try:
        reader = PdfReader(file.file)
    except PdfReadError as exc:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, f"Not a readable PDF: {exc}"
        ) from exc

    if reader.is_encrypted:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Encrypted PDFs are not supported"
        )

    chunks: list[str] = []
    for page in reader.pages[:max_pages]:
        text = page.extract_text() or ""
        if text.strip():
            chunks.append(text)

    extracted = "\n".join(chunks).strip()
    if not extracted:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "Could not extract any text — the PDF may be a scanned image "
            "without OCR text.",
        )
    return extracted


def chunk_text(text: str, chunk_size: int = 1200, overlap: int = 150) -> list[str]:
    """Splits extracted text into overlapping chunks for embedding storage."""
    if chunk_size <= overlap:
        raise ValueError("chunk_size must exceed overlap")
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks
