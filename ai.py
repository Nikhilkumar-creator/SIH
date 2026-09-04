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
        return f"Ollama request failed:.{exc}.
    make sure Ollama is running."
    