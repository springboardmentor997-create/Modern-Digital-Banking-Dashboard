from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Mock user database
users_db = {
    "admin@bank.com": {
        "id": 1,
        "email": "admin@bank.com",
        "name": "Admin User",
        "role": "admin",
        "created_at": "2024-01-01T00:00:00Z",
        "phone": "+1-555-0101",
        "kyc_status": "verified"
    },
    "user@bank.com": {
        "id": 2,
        "email": "user@bank.com",
        "name": "Regular User",
        "role": "user",
        "created_at": "2024-02-15T00:00:00Z",
        "phone": "+1-555-0102",
        "kyc_status": "verified"
    },
    "test@test.com": {
        "id": 3,
        "email": "test@test.com",
        "name": "Test User",
        "role": "user",
        "created_at": "2024-03-10T00:00:00Z",
        "phone": "+1-555-0103",
        "kyc_status": "pending"
    },
    "urmilakshirsagar1945@gmail.com": {
        "id": 4,
        "email": "urmilakshirsagar1945@gmail.com",
        "name": "Urmila Shirsagar",
        "role": "user",
        "created_at": "2024-01-20T00:00:00Z",
        "phone": "+91-9876543210",
        "kyc_status": "verified"
    }
}

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
        
        if email in users_db and password == "test123":
            user_data = users_db[email]
            return jsonify({
                "access_token": "valid-token-123",
                "token_type": "bearer",
                "user": user_data
            })
        
        return jsonify({"detail": "Invalid credentials"}), 401
        
    except Exception as e:
        return jsonify({"detail": "Server error"}), 500

@app.route("/api/profile", methods=["GET"])
def get_profile():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({"detail": "Unauthorized"}), 401
    
    # Return first user as default (in real app, decode token)
    return jsonify(list(users_db.values())[0])

@app.route("/api/admin/users", methods=["GET"])
def get_all_users():
    return jsonify({"users": list(users_db.values())})

@app.route("/api/<path:path>", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
def api_catch_all(path):
    if request.method == "OPTIONS":
        return "", 200
    return jsonify({"data": [], "message": "OK"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=False)