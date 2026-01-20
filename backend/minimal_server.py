from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import hashlib

app = Flask(__name__)
CORS(app)

# Initialize database
conn = sqlite3.connect('banking_app.db', check_same_thread=False)
cursor = conn.cursor()

cursor.execute('''CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT DEFAULT 'user'
)''')

# Insert test users
users = [
    ("admin@bank.com", "admin123", "Admin User", "admin"),
    ("user@bank.com", "user123", "Regular User", "user"),
    ("test@test.com", "test123", "Test User", "user")
]

for email, password, name, role in users:
    hashed = hashlib.sha256(password.encode()).hexdigest()
    cursor.execute("INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)", 
                   (email, hashed, name, role))

conn.commit()

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = hashlib.sha256(data.get("password").encode()).hexdigest()
    
    cursor.execute("SELECT * FROM users WHERE email = ? AND password = ?", (email, password))
    user = cursor.fetchone()
    
    if user:
        return jsonify({
            "access_token": "fake-token",
            "token_type": "bearer",
            "user": {
                "id": user[0],
                "email": user[1],
                "name": user[3],
                "role": user[4]
            }
        })
    return jsonify({"detail": "Invalid credentials"}), 401

@app.route("/api/<path:path>", methods=["GET", "POST", "PUT", "DELETE"])
def catch_all(path):
    return jsonify({"message": "OK", "data": []})

@app.route("/")
def root():
    return jsonify({"status": "running"})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)