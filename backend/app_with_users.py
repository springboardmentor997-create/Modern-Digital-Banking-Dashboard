from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Generate 100 mock users
users_db = {}
for i in range(1, 101):
    email = f"user{i}@bank.com"
    users_db[email] = {
        "id": i,
        "email": email,
        "name": f"User {i}",
        "role": "admin" if i <= 5 else "user",
        "created_at": f"2024-{(i % 12) + 1:02d}-{(i % 28) + 1:02d}T00:00:00Z",
        "phone": f"+1-555-{i:04d}",
        "kyc_status": ["verified", "pending", "rejected"][i % 3],
        "is_active": i % 10 != 0
    }

# Add specific users
users_db.update({
    "admin@bank.com": {
        "id": 101,
        "email": "admin@bank.com",
        "name": "Admin User",
        "role": "admin",
        "created_at": "2024-01-01T00:00:00Z",
        "phone": "+1-555-0101",
        "kyc_status": "verified",
        "is_active": True
    },
    "urmilakshirsagar1945@gmail.com": {
        "id": 102,
        "email": "urmilakshirsagar1945@gmail.com",
        "name": "Urmila Shirsagar",
        "role": "user",
        "created_at": "2024-01-20T00:00:00Z",
        "phone": "+91-9876543210",
        "kyc_status": "verified",
        "is_active": True
    }
})

# Generate mock accounts
accounts_db = []
for i in range(1, 201):
    accounts_db.append({
        "id": i,
        "user_id": (i % 102) + 1,
        "name": f"Account {i}",
        "account_type": ["savings", "checking", "credit"][i % 3],
        "balance": round((i * 1000.50) % 50000, 2),
        "bank_name": ["Chase Bank", "Wells Fargo", "Bank of America"][i % 3],
        "account_number": f"****{i:04d}",
        "is_active": i % 15 != 0
    })

# Generate mock transactions
transactions_db = []
for i in range(1, 501):
    transactions_db.append({
        "id": i,
        "account_id": (i % 200) + 1,
        "amount": round(((i * 25.75) % 2000) - 1000, 2),
        "description": f"Transaction {i}",
        "txn_type": "credit" if i % 3 == 0 else "debit",
        "category": ["Food", "Transport", "Shopping", "Bills", "Income"][i % 5],
        "txn_date": f"2024-{(i % 12) + 1:02d}-{(i % 28) + 1:02d}T{(i % 24):02d}:00:00Z"
    })

# Generate mock KYC documents
kyc_docs = []
for i in range(1, 51):
    doc_types = ["aadhaar", "pan", "passport", "driving_license"]
    doc_type = doc_types[i % 4]
    
    if doc_type == "aadhaar":
        doc_number = f"{1000 + i:04d}{2000 + i:04d}{3000 + i:04d}"
    elif doc_type == "pan":
        doc_number = f"ABCDE{1000 + i:04d}F"
    elif doc_type == "passport":
        doc_number = f"A{1000000 + i:07d}"
    else:
        doc_number = f"DL{10000000 + i:08d}"
    
    kyc_docs.append({
        "id": i,
        "user_id": (i % 102) + 1,
        "full_name": f"User {(i % 102) + 1}",
        "document_type": doc_type,
        "document_number": doc_number,
        "status": ["pending", "verified", "rejected"][i % 3],
        "submitted_at": f"2024-{(i % 12) + 1:02d}-{(i % 28) + 1:02d}T00:00:00Z"
    })

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

@app.route("/api/admin/accounts", methods=["GET"])
def get_all_accounts():
    return jsonify({"accounts": accounts_db})

@app.route("/api/admin/transactions", methods=["GET"])
def get_all_transactions():
    return jsonify({"transactions": transactions_db})

@app.route("/api/admin/kyc", methods=["GET"])
def get_kyc_documents():
    return jsonify({"documents": kyc_docs})

@app.route("/api/admin/stats", methods=["GET"])
def get_admin_stats():
    return jsonify({
        "total_users": len(users_db),
        "active_users": sum(1 for u in users_db.values() if u.get("is_active", True)),
        "total_accounts": len(accounts_db),
        "total_transactions": len(transactions_db),
        "pending_kyc": sum(1 for k in kyc_docs if k["status"] == "pending")
    })

@app.route("/api/kyc/submit", methods=["POST"])
def submit_kyc():
    data = request.get_json()
    doc_type = data.get("document_type")
    doc_number = data.get("document_number", "")
    
    # Validate document number
    if doc_type == "aadhaar":
        if not doc_number.isdigit() or len(doc_number) != 12:
            return jsonify({"detail": "Aadhaar must be 12 digits only"}), 400
    elif doc_type == "pan":
        if len(doc_number) != 10 or not doc_number[:5].isalpha() or not doc_number[5:9].isdigit() or not doc_number[9].isalpha():
            return jsonify({"detail": "PAN format: ABCDE1234F"}), 400
    
    return jsonify({"message": "KYC submitted successfully", "status": "pending"})

@app.route("/api/<path:path>", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
def api_catch_all(path):
    if request.method == "OPTIONS":
        return "", 200
    return jsonify({"data": [], "message": "OK"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=False)