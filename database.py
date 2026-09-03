
import sqlite3

from pathlib import Path
from datetime import datetime

BASE_DIR = Path(_file_).resolve().parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "icebound.db"

DATA_DIR.mkdir(
    parents=True,
    exist_ok=True
)

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute(
        "PRAGMA foreign_keys = ON"
    )
    return conn

def initialize_database():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)