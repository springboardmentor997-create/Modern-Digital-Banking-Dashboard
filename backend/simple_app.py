from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    
    # Test credentials
    valid_users = {
        "admin@bank.com": {"password": "test123", "name": "Admin User", "role": "admin"},
        "user@bank.com": {"password": "test123", "name": "Regular User", "role": "user"},
        "test@test.com": {"password": "test123", "name": "Test User", "role": "user"}
    }
    
    email = data.get("email")
    password = data.get("password")
    
    if email in valid_users and valid_users[email]["password"] == password:
        return jsonify({
            "access_token": "fake-jwt-token",
            "token_type": "bearer",
            "user": {
                "id": 1,
                "email": email,
                "name": valid_users[email]["name"],
                "role": valid_users[email]["role"],
                "kyc_status": "verified"
            }
        })
    
    return jsonify({"detail": "Invalid credentials"}), 401

@app.route("/api/<path:path>", methods=["GET", "POST", "PUT", "DELETE"])
def catch_all(path):
    return jsonify({"message": "OK", "data": []})

@app.route("/")
def root():
    return jsonify({"message": "Banking System API is running", "status": "healthy"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)