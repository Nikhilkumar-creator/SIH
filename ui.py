import streamlit as st
from pathlib import Path
from authentication import logout_user
from pdf_manager import save_pdf, extract_text, list_user_documents, remove_pdf
from ai engine import summarize_document, extract_key_points, answer_question, search_keyword

def _load_document(doc):
    return extract_text(doc[2])

def dashboard(user):
    st.markdown("""
    <style>
    .stApp { background: #07111a; }
    .ice-card { padding:20px; border-radius:16px; border:1px solid #29465a; background:#0d1b27; }
    </style>
    """, unsafe_allow_html=True)

    with st.sidebar:
        st.title("❄️ ICEBOUND")
        st.write(f"Welcome, **{user['name']}**")
        st.caption("AI Document Intelligence")
        if st.button("Logout", use_container_width=True):
            logout_user()

        st.divider()
        model = st.text_input("ollama model", "llama3.2")
        st.session_state.model = model

    st.title("ICEBOUND")
    st.caption("LOGIN → UPLOAD → STORE → UNDERSTAND → ASK → LEARN")

    upload = st.file_uploader("Upload an Antarctic expedition / reaserch PDF", type=["pdf"])
    if upload:
        if st.button("Store PDF"):
            try:
                doc_id, path = save_pdf(upload, user["id"])
                st.success(f"PDF stored successfully. Document ID: {doc_id}")
                st.rerun()
            except Exception as e:
                st.error(str(e))

    docs = list_user_documents(user["id"])
    if not docs:
        st.info("Upload a PDF to begin.")
        return

    labels = [f"{d[1]} — {d[3][:19]}" for d in docs]
    selected = st.selectbox("Select document", range(len(docs)), format_func=lambda i: labels[i])
    doc = docs[selected]

    try:
        text = _load_document(doc)
    except Exception as e:
        st.error(f"Could not read PDF: {e}")
        return

    st.success(f"Loaded: {doc[1]} | {len(text):,} characters")

    tab1, tab2, tab3, tab4, tab5 = st.tabs(
       ["📄 View", "🧠 Summary", "🔑 Key Points", "💬 Ask ICEBOUND", "🔎 Search"] 
    )

                
    
    
    
    
                 