import streamlit as st
import database
import authentication
import ui

st.set_page_config(page_title="ICEBOUND", page_icon="🧊", layout="wide")
database.initialize_database()

def login_screen():
    st.title("🧊 ICEBOUND")
    st.subheader("Polar Research Outreach & Knowledge Repository")
    st.write("Archive → Search → Understand → Ask → Outreach")

    login, register = st.tabs(["Login","Register"])

    with login:
        username = st.text_input("Username", key="login_user")
        password = st.text_input("Password", type="password", key="login_pass")
        if st.button("Login", type="primary", use_container_width=True):
            user = authentication.login_user(username, password)
            if user:
                st.session_state.user = user
                st.rerun()
            else:
                st.error("Invalid username or password.")

    with register:
        username = st.text_input("Choose username", key="reg_user")
        password = st.text_input("Choose password", type="password", key="reg_pass")
        role = st.selectbox("Role", ["Student","Researcher"])
        if st.button("Create Account", use_container_width=True):
            ok, msg = authentication.register_user(username, password, role)
            if ok:
                st.success(msg)
            else:
                st.error(msg)

def app():
    user = st.session_state.user
    with st.sidebar:
        st.markdown("# 🧊 ICEBOUND")
        st.caption("Polar Research Outreach Portal")
        st.write(f"👤 {user['username']}")
        st.write(f"Role: {user['role']}")
        st.divider()
        page = st.radio("Navigation", [
            "🏠 Dashboard","📄 Research Repository","📷 Media Library",
            "🚢 Expeditions","🏛️ Institutional Activities","🤖 Local AI",
            "🔎 Search","📜 AI History"
        ])
        st.divider()
        if st.button("🚪 Logout", use_container_width=True):
            st.session_state.pop("user", None)
            st.rerun()

    if page == "🏠 Dashboard":
        ui.dashboard(user)
    elif page == "📄 Research Repository":
        ui.documents(user)
    elif page == "📷 Media Library":
        ui.media(user)
    elif page == "🚢 Expeditions":
        ui.expeditions(user)
    elif page == "🏛️ Institutional Activities":
        ui.activities(user)
    elif page == "🤖 Local AI":
        ui.ai_page(user)
    elif page == "🔎 Search":
        ui.search_page()
    elif page == "📜 AI History":
        ui.history(user)

if "user" not in st.session_state:
    login_screen()
else:
    app()
