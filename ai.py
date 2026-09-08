import json
import urllib.request
import urllib.error

OLLAMA_URL = "http://localhost:11434/api/generate"
DEFAULT_MODEL = "tinyllama"

def ollama_generate(prompt, model=DEFAULT_MODEL, temperature=0.2):
    payload = json.dumps({
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": temperature}
    }).encode("utf-8")
    request = urllib.request.Request(
        OLLAMA_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            data = json.loads(response.read().decode("utf-8"))
            return data.get("response", "").strip()
    except urllib.error.URLError:
        return "Ollama is not reachable. Start Ollama and make sure the TinyLlama model is installed."
    except Exception as exc:
        return f"Local AI error: {exc}"
def summarize(text, title="Research Document"):
    text = text[:12000]
    prompt = f"""You are ICEBOUND, a polar research knowledge assistant.
Summarize the following research document for a student and general public audience.
Give:
1. A short overview
2. Five important findings
3. Important scientific terms
Do not invent information.

Document title: {title}

Document:
{text}"""
    return ollama_generate(prompt)

def answer_question(question, context):
    context = context[:18000]
    prompt = f"""You are ICEBOUND, a document question-answering assistant.
Answer the user's question using ONLY the supplied repository context.
If the answer is not present, say that it is not available in the supplied documents.
Be concise and clearly explain the answer.

Question:
{question}

Repository context:
{context}"""
    return ollama_generate(prompt)

def generate_outreach(text, title):
    text = text[:14000]
    prompt = f"""You are the ICEBOUND polar research outreach writer.
Using ONLY the research below, create:
A) A public-friendly website article of about 250 words.
B) A social-media post of about 100 words.
C) Five short keywords/hashtags.
Keep scientific claims faithful to the source. Do not invent facts.

Title: {title}

Research:
{text}"""
    return ollama_generate(prompt)

def generate_expedition_content(name, location, year, description):
    prompt = f"""Create a concise public outreach post for a polar expedition.
Name: {name}
Location: {location}
Year: {year}
Description: {description}
Use only these facts and do not invent scientific results."""
    return ollama_generate(prompt)

def check_ollama(model=DEFAULT_MODEL):
    result = ollama_generate("Reply with exactly: ICEBOUND AI READY", model=model, temperature=0)
    return result