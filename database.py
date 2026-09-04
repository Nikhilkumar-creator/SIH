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
        