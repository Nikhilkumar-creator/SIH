import hashlib
import hmac
import database

def hash_password(password):
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def verify_password(password, stored_hash):
    return hmac.compare_digest(hash_password(password), stored_hash)

def register_user(username, password, role):
    username = username.strip()
    if not username or not password:
        return False, "Username and password are required."
    if len(username) < 3:
        return False, "Username must contain at least 3 characters."
    if len(password) < 6:
        return False, "Password must contain at least 6 characters."
    return database.add_user(username, hash_password(password), role)

def login_user(username, password):
    user = database.get_user(username.strip())
    if user and verify_password(password, user["password_hash"]):
        return {"id": user["id"], "username": user["username"], "role": user["role"]}
    return None
