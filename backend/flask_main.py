from flask import Flask, jsonify, request
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Mock data
expenses_db = []
bills_db = [
    {"id": 1, "name": "Electricity Bill", "amount": 2500.0, "dueDate": "2024-01-15", "status": "pending", "autoPay": False},
    {"id": 2, "name": "Internet Bill", "amount": 1200.0, "dueDate": "2024-01-20", "status": "paid", "autoPay": True}
]

@app.route('/')
def root():
    return {"message": "Banking Backend API is running"}

@app.route('/api/expenses/', methods=['GET'])
def get_expenses():
    return jsonify(expenses_db)

@app.route('/api/expenses/', methods=['POST'])
def create_expense():
    data = request.get_json()
    new_expense = {
        "id": len(expenses_db) + 1,
        "amount": data.get("amount"),
        "description": data.get("description"),
        "category": data.get("category"),
        "expense_date": "2024-01-01T00:00:00Z"
    }
    expenses_db.append(new_expense)
    return jsonify(new_expense)

@app.route('/api/bills', methods=['GET'])
def get_bills():
    return jsonify(bills_db)

@app.route('/api/auth/login', methods=['POST'])
def login():
    return jsonify({
        "access_token": "mock-token",
        "user": {"id": 1, "email": "user@example.com"}
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)