import streamlit as st
from pathlib import Path
import database
import auth
import pdf_manager
import ai

def header(title, subtitle=""):
    st.title(title)
    if subtitle:
        st.caption(subtitle)

def dashboard(user):
    header("🧊 ICEBOUND", "Polar Research Outreach & Knowledge Repository")
    st.success(f"Welcome, {user['username']}! Role: {user['role']}.")
    stats = database.get_statistics()
    cols = st.columns(5)
    for col, label, value in zip(
        cols,
        ["📄 Documents","📷 Media","🚢 Expeditions","🏛️ Activities","👥 Users"],
        [stats["documents"],stats["media"],stats["expeditions"],stats["activities"],stats["users"]]
    ):
        col.metric(label, value)
    st.markdown("### 🔄 Platform Workflow")
    st.info("LOGIN → ARCHIVE → SEARCH → UNDERSTAND → ASK → OUTREACH")
    st.markdown("### 🌐 What ICEBOUND Archives")
    c1,c2,c3 = st.columns(3)
    c1.write("📄 Expedition reports")
    c1.write("🔬 Scientific publications")
    c2.write("📊 Scientific datasets")
    c2.write("📷 Photographs")
    c3.write("🎥 Videos")
    c3.write("🏛️ Institutional activities")

def documents(user):
    header("📄 Research Repository", "Archive expedition reports, publications, datasets and institutional documents.")

    if user["role"] == "Researcher":
        uploaded = st.file_uploader("Upload PDF", type=["pdf"])
        if uploaded:
            title = st.text_input("Document title", value=Path(uploaded.name).stem)
            category = st.selectbox(
                "Category",
                ["Expedition Report","Scientific Publication","Research Paper","Dataset",
                 "Institutional Report","Educational Material"]
            )
            description = st.text_area("Description")
            if st.button("🗃️ Archive PDF", type="primary"):
                try:
                    path = pdf_manager.save_uploaded_pdf(uploaded)
                    text = pdf_manager.extract_pdf_text(path)
                    database.add_document(title, category, path.name, description, text, user["id"])
                    st.success(f"Archived successfully. Extracted {len(text):,} characters.")
                except Exception as exc:
                    st.error(str(exc))
    else:
        st.info("🎓 Student mode: documents are view-only. Only the Researcher who uploaded a document can delete it.")

    st.divider()
    query = st.text_input("🔎 Search documents")
    rows = database.get_documents(query)
    for row in rows:
        with st.expander(f"📄 {row['title']} · {row['category']}"):
            st.write(row["description"] or "No description.")
            st.caption(f"Uploaded by {row['username'] or 'Unknown'} · {row['uploaded_at']}")
            path = pdf_manager.get_file_path(row["filename"])
            if path:
                st.download_button("⬇️ Download PDF", path.read_bytes(), path.name,
                                   "application/pdf", key=f"download_{row['id']}")
            if user["role"] == "Researcher" and row["uploaded_by"] == user["id"]:
                if st.button("🗑️ Delete", key=f"delete_{row['id']}"):
                    deleted = database.delete_document(row["id"], user["id"])
                    if deleted:
                        pdf_manager.delete_file(row["filename"])
                        st.success("Document deleted successfully.")
                        st.rerun()
                    else:
                        st.error("Deletion denied. Only the Researcher who uploaded this document can delete it.")
            else:
                st.caption("🔒 Delete restricted: only the Researcher who uploaded this document can delete it.")

def media(user):
    header("📷 Media Library", "Archive expedition photographs and videos.")
    uploaded = st.file_uploader(
        "Upload photo/video",
        type=["jpg","jpeg","png","webp","mp4","mov","avi"]
    )
    if uploaded:
        title = st.text_input("Media title")
        description = st.text_area("Description")
        media_type = "Photo" if uploaded.type.startswith("image/") else "Video"
        if st.button("🗃️ Archive Media", type="primary"):
            path = pdf_manager.save_media(uploaded)
            database.add_media(title or Path(uploaded.name).stem, media_type,
                               path.name, description, user["id"])
            st.success("Media archived.")
    st.divider()
    filter_type = st.selectbox("Filter", ["All","Photo","Video"])
    for row in database.get_media(filter_type):
        with st.expander(f"{'📷' if row['media_type']=='Photo' else '🎥'} {row['title']}"):
            st.write(row["description"] or "No description.")
            path = pdf_manager.get_file_path(row["filename"], media=True)
            if path:
                if row["media_type"] == "Photo":
                    st.image(str(path), use_container_width=True)
                else:
                    st.video(str(path))
            if st.button("Delete", key=f"media_delete_{row['id']}"):
                pdf_manager.delete_file(row["filename"], media=True)
                database.delete_media(row["id"])
                st.rerun()

def expeditions(user):
    header("🚢 Expeditions", "Build a searchable archive of polar expeditions.")
    with st.form("expedition_form"):
        name = st.text_input("Expedition name")
        location = st.text_input("Location")
        year = st.text_input("Year")
        description = st.text_area("Description")
        if st.form_submit_button("Add Expedition"):
            if name:
                database.add_expedition(name, location, year, description, user["id"])
                st.success("Expedition added.")
                st.rerun()
            else:
                st.error("Expedition name is required.")
    for row in database.get_expeditions():
        with st.expander(f"🚢 {row['name']} · {row['year']}"):
            st.write(f"**Location:** {row['location'] or 'Not specified'}")
            st.write(row["description"] or "No description.")
            if st.button("Delete", key=f"exp_delete_{row['id']}"):
                database.delete_expedition(row["id"])
                st.rerun()

def activities(user):
    header("🏛️ Institutional Activities", "Archive workshops, conferences, exhibitions and outreach initiatives.")
    with st.form("activity_form"):
        title = st.text_input("Activity title")
        activity_type = st.selectbox(
            "Activity type",
            ["Workshop","Conference","Awareness Campaign","School Outreach","Exhibition","Other"]
        )
        date = st.text_input("Date")
        description = st.text_area("Description")
        if st.form_submit_button("Add Activity"):
            if title:
                database.add_activity(title, activity_type, date, description, user["id"])
                st.success("Activity added.")
                st.rerun()
            else:
                st.error("Activity title is required.")
    for row in database.get_activities():
        with st.expander(f"🏛️ {row['title']} · {row['activity_type']}"):
            st.write(f"**Date:** {row['date'] or 'Not specified'}")
            st.write(row["description"] or "No description.")
            if st.button("Delete", key=f"act_delete_{row['id']}"):
                database.delete_activity(row["id"])
                st.rerun()

def ai_page(user):
    header("🤖 ICEBOUND Local AI", "Powered locally by Ollama + TinyLlama.")
    st.info("No paid cloud AI API is required. AI requests are sent to your local Ollama server.")
    if st.button("🔌 Test TinyLlama"):
        st.write(ai.check_ollama())
    rows = database.get_documents()
    if not rows:
        st.warning("Upload a PDF first.")
        return

    tab1,tab2,tab3 = st.tabs(["📝 Summarize","💬 Ask Documents","📢 Outreach"])

    with tab1:
        document_titles = [row["title"] for row in rows]
        selected_title = st.selectbox("Document", document_titles, key="sum_doc")
        selected = next(row for row in rows if row["title"] == selected_title)
        if st.button("Generate Summary", type="primary"):
            with st.spinner("TinyLlama is processing..."):
                st.write(ai.summarize(selected["extracted_text"], selected["title"]))

    with tab2:
        question = st.text_input("Ask about your archived research")
        if st.button("Ask ICEBOUND", type="primary"):
            context_parts = []
            for row in rows:
                context_parts.append(
                    f"TITLE: {row['title']}\nCATEGORY: {row['category']}\nCONTENT:\n{row['extracted_text'][:6000]}"
                )
            context = "\n\n".join(context_parts)
            with st.spinner("TinyLlama is answering..."):
                answer = ai.answer_question(question, context)
            database.add_ai_history(user["id"], question, answer)
            st.write(answer)

    with tab3:
        document_titles = [row["title"] for row in rows]
        selected_title = st.selectbox("Document", document_titles, key="out_doc")
        selected = next(row for row in rows if row["title"] == selected_title)
        if st.button("Generate Outreach Content", type="primary"):
            with st.spinner("TinyLlama is writing..."):
                st.write(ai.generate_outreach(selected["extracted_text"], selected["title"]))

def search_page():
    header("🔎 Search Repository")
    query = st.text_input("Search")
    rows = database.get_documents(query)
    if query and not rows:
        st.warning("No documents found.")
    for row in rows:
        st.write(f"**{row['title']}** — {row['category']}")
        st.caption(row["description"] or "No description.")

def history(user):
    header("📜 AI History")
    rows = database.get_ai_history(user["id"])
    if not rows:
        st.info("No AI history yet.")
    for row in rows:
        with st.expander(row["question"]):
            st.write(row["answer"])
            st.caption(row["created_at"])
