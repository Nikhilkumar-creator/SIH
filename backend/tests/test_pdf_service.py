import pytest
from services.pdf_service import chunk_text


def test_chunk_text_produces_overlapping_chunks():
    text = "a" * 3000
    chunks = chunk_text(text, chunk_size=1000, overlap=100)
    assert len(chunks) >= 3
    # Verify overlap: end of chunk[0] should reappear at start of chunk[1]
    assert chunks[0][-100:] == chunks[1][:100]


def test_chunk_text_rejects_bad_overlap():
    with pytest.raises(ValueError):
        chunk_text("some text", chunk_size=100, overlap=100)


def test_chunk_text_handles_short_text():
    chunks = chunk_text("short text", chunk_size=1000, overlap=100)
    assert chunks == ["short text"]
