from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/api/auth/login", methods=["POST"])
def login():
    return jsonify({
        "access_token": "test-token-123",
        "token_type": "bearer", 
        "user": {
            "id": 1,
            "email": "test@test.com",
            "name": "Test User",
            "role": "user"
        }
    })

@app.route("/")
def home():
    return "API Working"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)