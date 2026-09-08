import streamlit as st
from database import create_user, verify_user

def login_screen():
    st.markdown("""
        <div style="text-align:center;padding:30px 0">
            <h1>❄️ ICEBOUND</h1>
            <p>AI-Powered Antarctic Document Intelligence</p>
        </div>
        """, unsafe_allow_html=True)

    tab1, tab2 = st.tabs(["Login", "Register"])

    with tab1:
           username = st.text_input("Username", key="login_user")
           password = st.text_input("Password", type="password", key="login_pass")
           if st.button("Login", use_container_width=True):
               user = verify_user(username, password)
               if user:
                   st.session_state.user = user
                   st.rerun()
               else:
                   st.error("Invalid username or password.")
    
    with tab2:
            name = st.text_input("Your name", key="reg_name")
            username = st.text_input("Choose username", key="reg_user")
            password = st.text_input("Choose password", type="password", key="reg_pass")
            if st.button("Create Account", use_container_width=True):
                if not name.strip() or not username.strip() or not password:
                    st.warning("Please fill all fields.")
                elif create_user(name.strip(), username.strip(), password):
                    st.success("Account created. Please log in.")
                else:
                    st.error("Username already exists.")

    def logout_user():
         st.session_state.user = none
         st.rerun()