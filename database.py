import sqlite3
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).resolve().parent / "icebound.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def initialize_database():
    conn = get_connection()
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        filename TEXT NOT NULL,
        description TEXT,
        extracted_text TEXT,
        uploaded_by INTEGER,
        uploaded_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        media_type TEXT NOT NULL,
        filename TEXT NOT NULL,
        description TEXT,
        uploaded_by INTEGER,
        uploaded_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS expeditions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        location TEXT,
        year TEXT,
        description TEXT,
        created_by INTEGER,
        created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        activity_type TEXT,
        date TEXT,
        description TEXT,
        created_by INTEGER,
        created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ai_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        question TEXT,
        answer TEXT,
        created_at TEXT NOT NULL
    );
    """)
    conn.commit()
    conn.close()

def add_user(username, password_hash, role):
    conn = get_connection()
    try:
        conn.execute(
            "INSERT INTO users (username,password_hash,role,created_at) VALUES (?,?,?,?)",
            (username, password_hash, role, datetime.now().isoformat(timespec="seconds"))
        )
        conn.commit()
        return True, "Registration successful."
    except sqlite3.IntegrityError:
        return False, "Username already exists."
    finally:
        conn.close()

def get_user(username):
    conn = get_connection()
    row = conn.execute("SELECT * FROM users WHERE username=?", (username,)).fetchone()
    conn.close()
    return row

def add_document(title, category, filename, description, extracted_text, uploaded_by):
    conn = get_connection()
    cur = conn.execute(
        """INSERT INTO documents
        (title,category,filename,description,extracted_text,uploaded_by,uploaded_at)
        VALUES (?,?,?,?,?,?,?)""",
        (title, category, filename, description, extracted_text, uploaded_by,
         datetime.now().isoformat(timespec="seconds"))
    )
    conn.commit()
    doc_id = cur.lastrowid
    conn.close()
    return doc_id

def get_documents(search=""):
    conn = get_connection()
    if search:
        term = f"%{search}%"
        rows = conn.execute(
            """SELECT d.*,u.username FROM documents d
            LEFT JOIN users u ON d.uploaded_by=u.id
            WHERE d.title LIKE ? OR d.category LIKE ? OR d.description LIKE ?
            ORDER BY d.id DESC""",
            (term, term, term)
        ).fetchall()
    else:
        rows = conn.execute(
            """SELECT d.*,u.username FROM documents d
            LEFT JOIN users u ON d.uploaded_by=u.id
            ORDER BY d.id DESC"""
        ).fetchall()
    conn.close()
    return rows

def delete_document(doc_id, user_id):
    conn = get_connection()
    cur = conn.execute(
        """DELETE FROM documents
        WHERE id = ?
        AND uploaded_by = ?
        AND uploaded_by IN (SELECT id FROM users WHERE id = ? AND role = 'Researcher')""",
        (doc_id, user_id, user_id)
    )
    conn.commit()
    deleted = cur.rowcount > 0
    conn.close()
    return deleted

def add_media(title, media_type, filename, description, uploaded_by):
    conn = get_connection()
    cur = conn.execute(
        """INSERT INTO media
        (title,media_type,filename,description,uploaded_by,uploaded_at)
        VALUES (?,?,?,?,?,?)""",
        (title, media_type, filename, description, uploaded_by,
         datetime.now().isoformat(timespec="seconds"))
    )
    conn.commit()
    media_id = cur.lastrowid
    conn.close()
    return media_id

def get_media(media_type="All"):
    conn = get_connection()
    if media_type == "All":
        rows = conn.execute(
            """SELECT m.*,u.username FROM media m
            LEFT JOIN users u ON m.uploaded_by=u.id
            ORDER BY m.id DESC"""
        ).fetchall()
    else:
        rows = conn.execute(
            """SELECT m.*,u.username FROM media m
            LEFT JOIN users u ON m.uploaded_by=u.id
            WHERE m.media_type=? ORDER BY m.id DESC""",
            (media_type,)
        ).fetchall()
    conn.close()
    return rows

def delete_media(media_id):
    conn = get_connection()
    conn.execute("DELETE FROM media WHERE id=?", (media_id,))
    conn.commit()
    conn.close()

def add_expedition(name, location, year, description, created_by):
    conn = get_connection()
    conn.execute(
        """INSERT INTO expeditions
        (name,location,year,description,created_by,created_at)
        VALUES (?,?,?,?,?,?)""",
        (name, location, year, description, created_by,
         datetime.now().isoformat(timespec="seconds"))
    )
    conn.commit()
    conn.close()

def get_expeditions():
    conn = get_connection()
    rows = conn.execute(
        """SELECT e.*,u.username FROM expeditions e
        LEFT JOIN users u ON e.created_by=u.id ORDER BY e.id DESC"""
    ).fetchall()
    conn.close()
    return rows

def delete_expedition(expedition_id):
    conn = get_connection()
    conn.execute("DELETE FROM expeditions WHERE id=?", (expedition_id,))
    conn.commit()
    conn.close()

def add_activity(title, activity_type, date, description, created_by):
    conn = get_connection()
    conn.execute(
        """INSERT INTO activities
        (title,activity_type,date,description,created_by,created_at)
        VALUES (?,?,?,?,?,?)""",
        (title, activity_type, date, description, created_by,
         datetime.now().isoformat(timespec="seconds"))
    )
    conn.commit()
    conn.close()

def get_activities():
    conn = get_connection()
    rows = conn.execute(
        """SELECT a.*,u.username FROM activities a
        LEFT JOIN users u ON a.created_by=u.id ORDER BY a.id DESC"""
    ).fetchall()
    conn.close()
    return rows

def delete_activity(activity_id):
    conn = get_connection()
    conn.execute("DELETE FROM activities WHERE id=?", (activity_id,))
    conn.commit()
    conn.close()

def add_ai_history(user_id, question, answer):
    conn = get_connection()
    conn.execute(
        "INSERT INTO ai_history(user_id,question,answer,created_at) VALUES(?,?,?,?)",
        (user_id, question, answer, datetime.now().isoformat(timespec="seconds"))
    )
    conn.commit()
    conn.close()

def get_ai_history(user_id):
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM ai_history WHERE user_id=? ORDER BY id DESC",
        (user_id,)
    ).fetchall()
    conn.close()
    return rows

def get_statistics():
    conn = get_connection()
    stats = {}
    for key, table in [
        ("documents","documents"),("media","media"),("expeditions","expeditions"),
        ("activities","activities"),("users","users")
    ]:
        stats[key] = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
    conn.close()
    return stats
