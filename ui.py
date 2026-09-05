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
    
    
    
    
                 