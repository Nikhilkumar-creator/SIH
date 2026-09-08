import sqlite3
import hashlib
from pathlib import Path
from datetime import datetime

DB_PATH= Path("icebound.db")

def get_connection():
    return sqlite3.connect(DB_PATH)

def init_db():
    with get_connection() as con:
        con.execute("""
        CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """)
        con.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                filename TEXT NOT NULL,
                filepath TEXT NOT NULL,
                uploaded_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        """)
        con.commit()

def hash_password(password):
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def create_user(name, username, password):
    try:
        with get_connection() as con:
            con.execute(
                "INSERT INTO USERS(name,username,password_hash,created_at) VALUES(?,?,?,?)",
                (name,username, hash_password(password), datetime.now().isoformat())
            )
            con.commit()
        return True
    except sqlite3.IntegrityError:
        return False

def verify_user(username, password):
    with get_connection() as con:
        row = con.execute(
            "SELECT id,name,username FROM user WHERE username=? AND password_hash=?",
            (username, hash_password(password))
        ).fetchone()
    return {"id": row[0], "name": row[1], "username": row[2]} if row else None

def add_document(user_id, filename, filepath):
    with get_connection() as con:
        cur = con.execute(
            "INSERT INTO documnt(user_id,filename,filepath,uploaded_at)VALUES(?,?,?,?)",
            (user_id, filename, filepath, datetime.now().isoformat())
        )
        con.commit()
        return cur.lastrowid

def get_documents(user_id):
    with get_connection() as con:
        return con.execute(
            "SELECT id,filename,filepath,uploaded_at FROM documents WHERE user_id=? ORDER BY id DESC",
            (user_id,)
        ).fetchall()

def delete_document(doc_id, user_id):
    with get_connection() as con:
        row = con.execute(
            "SELECT filepath FROM documents WHERE id=? AND user_id=?",
            (doc_id, user_id)
        ).fetchone()
        if row:
            con.execute("DELETE FROM documents WHERE id=? AND user_id=?", (doc_id, user_id))
            con.commit()
            return row[0]
    return None
                
        