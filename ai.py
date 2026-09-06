import requests
import re

OLLAMA_URL = "http://localhost:11434/api/generate"
DEFAULT_MODEL = "llama3.2"

def _chunks(text, size=6000):
    words = text.split()
    chunks, current = [], []
    count = 0
    for word in words:
        if count + len(word) + 1 > size and current:
            chunks.append(" ".join(current))
            current, count = [], 0
        current.append(word)
        count += len(word) + 1
    if current:
        chunks.append(" ".join(current))
    return chunks

def ask_ollama(prompt, model=DEFAULT_MODEL):
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": model,
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )

        response.raise_for_status()

        return response.json().get("response", "").strip()

    except requests.RequestException as exc:
        return f"AI connection error:
    {exc}. MakesureOllama is running."
    
    def summarize_document(text, model=DEFAULT_MODEL):
    if not text:
        return "No readable text was found in this PDF."

    parts = _chunks(text)
    summaries = []
    for part in parts[:8]:
        summaries.append(ask_ollama(
            "Summarize the following document section accurately. "
            "Keep important facts, dates, names, procedures and numbers.\n\n" + part,
            model
        ))
    combined = "\n\n".join(summaries)
    return ask_ollama(
        "Create a concise final summary from these section summaries. "
        "Use headings and bullet points.\n\n" + combined,
        model
    )

def extract_key_points(text, model=DEFAULT_MODEL):
    return ask_ollama(
        "Extract the most important key points from this document. "
        "Return 8-12 concise bullet points. Do not invent information.\n\n" + text[:30000],
        model
    )

def answer_question(text,question,model=DEFAULT_MODEL):
    if not text:
        return"No document text is available."

    chunks = _chunks(text,7000)
    scored=[]
    terms = set(re.findall(r"\b\w+\b",question.lower()))

    for chunk in chunks:
        chunk_terms=set(re)









   