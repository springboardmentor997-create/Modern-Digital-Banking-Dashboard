from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, origins=["*"])

@app.route("/", methods=["GET"])
def root():
    return jsonify({"message": "Banking API is running", "status": "healthy"})

@app.route("/api/auth/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return "", 200
        
    try:
        data = request.get_json()
        email = data.get("email", "")
        password = data.get("password", "")
        
        # Valid test users
        users = {
            "admin@bank.com": {"name": "Admin User", "role": "admin"},
            "user@bank.com": {"name": "Regular User", "role": "user"},
            "test@test.com": {"name": "Test User", "role": "user"}
        }
        
        if email in users and password == "test123":
            return jsonify({
                "access_token": "valid-token-123",
                "token_type": "bearer",
                "user": {
                    "id": 1,
                    "email": email,
                    "name": users[email]["name"],
                    "role": users[email]["role"],
                    "kyc_status": "verified"
                }
            })
        
        return jsonify({"detail": "Invalid credentials"}), 401
        
    except Exception as e:
        return jsonify({"detail": "Server error"}), 500

@app.route("/api/<path:path>", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
def api_catch_all(path):
    if request.method == "OPTIONS":
        return "", 200
    return jsonify({"data": [], "message": "OK"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=False)