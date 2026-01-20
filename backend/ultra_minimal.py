from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/api/auth/login", methods=["POST"])
def login():
    return jsonify({
        "access_token": "test-token",
        "token_type": "bearer",
        "user": {
            "id": 1,
            "email": "test@test.com",
            "name": "Test User",
            "role": "user"
        }
    })

@app.route("/<path:path>", methods=["GET", "POST", "PUT", "DELETE"])
def catch_all(path):
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)