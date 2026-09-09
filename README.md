# 🧊 ICEBOUND

## Polar Research Outreach & Knowledge Repository

ICEBOUND is a local Streamlit portal for archiving and communicating polar research. It can store expedition reports, scientific publications, datasets, photographs, videos and institutional activities, then use a locally running **Ollama TinyLlama** model to summarize documents, answer questions and generate outreach content.

## ⭐ Core USP

> **From Polar Research to Public Outreach — in one platform.**

ICEBOUND combines:

- 📚 Research repository
- 🚢 Expedition archive
- 📊 Dataset/publication archive
- 📷 Photograph archive
- 🎥 Video archive
- 🏛️ Institutional activity archive
- 🔎 Search
- 🤖 Local AI document intelligence
- 📢 Website and social-media content generation

## 🏗️ Exactly 6 Python Program Files

```text
ICEBOUND/
├── main.py
├── authentication.py
├── pdf_manager.py
├── database.py
├── ai.py
└── ui.py
```

Additional non-Python files:

```text
requirements.txt
README.md
```

Runtime data is automatically created:

```text
icebound.db
uploads/
media/
```

## 👥 File Responsibilities

### `main.py`
Application entry point, Streamlit configuration, login flow, navigation and session management.

### `auth.py`
Registration, login, password hashing and Student/Researcher roles.

### `pdf_manager.py`
PDF/media storage and PDF text extraction using PyPDF2.

### `database.py`
SQLite database initialization and operations for users, documents, media, expeditions, activities and AI history.

### `ai.py`
Local AI integration with Ollama TinyLlama.

### `ui.py`
All Streamlit pages and user-interface components.

## 🧠 Local AI: Ollama + TinyLlama

ICEBOUND does **not** require OpenAI, Gemini, Claude or another paid cloud API.

The architecture is:

```text
ICEBOUND
   ↓
ai.py
   ↓
Ollama
   ↓
TinyLlama
   ↓
Local response
   ↓
Streamlit UI
```

Ollama's local API is accessed at:

```text
http://localhost:11434/api/generate
```

## 🚀 Installation

### 1. Install Python

Python 3.10+ is recommended.

### 2. Install Ollama

Install Ollama on your Windows PC from the official Ollama website.

After installation, open Command Prompt or PowerShell and download TinyLlama:

```bash
ollama pull tinyllama
```

Test it:

```bash
ollama run tinyllama
```

If TinyLlama responds, exit the model with:

```text
/bye
```

Keep Ollama running while using ICEBOUND.

### 3. Create a Python virtual environment

Open a terminal inside the ICEBOUND folder:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

### 4. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 5. Start ICEBOUND

```bash
<<<<<<< HEAD
streamlit run main.py
=======
python -m streamlit run main.py
>>>>>>> c988407e5074a1aabea008c5aab888ee9360c5a5
```

## 🔄 Prototype Workflow

```text
USER
 ↓
REGISTER / LOGIN
 ↓
DASHBOARD
 ↓
UPLOAD PDF
 ↓
PDF TEXT EXTRACTION
 ↓
SQLite METADATA + LOCAL FILE
 ↓
OLLAMA + TINYLLAMA
 ↓
 ┌───────────────┬────────────────┬─────────────────┐
 ↓               ↓                ↓
SUMMARY       DOCUMENT Q&A     OUTREACH CONTENT
                                  ↓
                         WEBSITE + SOCIAL POST
```

## 🤖 AI Features

### 1. Document Summary

Upload a research PDF and TinyLlama produces:

- overview
- important findings
- scientific terms

### 2. Ask Your Documents

Ask questions about the uploaded research. ICEBOUND sends relevant repository context to TinyLlama and asks it to answer using only that context.

### 3. Outreach Generator

TinyLlama creates:

- public-friendly website article
- social-media post
- keywords/hashtags

## 💾 Database

SQLite is used because it is:

- free
- local
- lightweight
- serverless
- easy to demonstrate in a college project

The database is automatically created as:

```text
icebound.db
```

## 🔐 Authentication

Two roles are available:

```text
🎓 Student
👨‍🔬 Researcher
```

Passwords are stored as SHA-256 hashes rather than plain text.

For a hackathon prototype this is suitable, but a production deployment should use a stronger password hashing scheme such as Argon2 or bcrypt and additional security controls.

## 📁 File Storage

PDFs:

```text
uploads/
```

Photographs/videos:

```text
media/
```

SQLite metadata:

```text
icebound.db
```

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Python | Application logic |
| Streamlit | Web UI |
| SQLite | Database |
| PyPDF2 | PDF text extraction |
| Ollama | Local AI runtime |
| TinyLlama | Local language model |
| hashlib | Prototype password hashing |

## ⚠️ Important

TinyLlama must be installed separately through Ollama. The Python `requirements.txt` installs the Python dependencies but does not install Ollama or the model.

If the AI page says that Ollama is unreachable:

1. Start Ollama.
2. Confirm TinyLlama exists with:

```bash
ollama list
```

3. If necessary:

```bash
ollama pull tinyllama
```

4. Restart:

```bash
streamlit run main.py
```

## 🎯 Hackathon Demonstration

Recommended demo:

```text
1. Register as Researcher
2. Login
3. Show dashboard
4. Upload a polar research PDF
5. Show it in the repository
6. Open Local AI
7. Generate summary
8. Ask a question about the PDF
9. Generate website/social outreach content
10. Show expedition/media/activity archives
11. Explain SQLite + Ollama local architecture
```

## 🌟 Future Enhancements

Possible future versions can add:

- semantic/vector search
- OCR for scanned PDFs
- dataset preview
- map-based expedition visualization
- multilingual outreach
- automatic citation extraction
- image tagging
- video metadata extraction
- advanced role permissions
- institutional dashboards
- cloud deployment

## 📌 Project Statement

ICEBOUND transforms a traditional research archive into an **interactive polar knowledge and outreach platform**, helping preserve scientific information while making it easier for students, researchers and the public to discover and communicate polar science.

## 🔐 Document Ownership & Deletion

ICEBOUND enforces document ownership for deletion. Every archived document stores the ID of the account that uploaded it.

- A user can delete only documents uploaded by their own account.
- Other researchers/students can view and use documents but cannot delete another user's document.
- The ownership check is enforced in both the Streamlit interface and the SQLite deletion query, so hiding the button is not the only protection.
- The same ownership rule is applied to the uploaded PDF file when it is removed from storage.

This prevents one researcher from accidentally or intentionally deleting another researcher's archived document.
