import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime

class BankingAPIHandler(BaseHTTPRequestHandler):
    # Class variable to store created accounts
    created_accounts = []
    
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()

    def do_GET(self):
        self._set_headers()
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Mock responses for all GET endpoints
        responses = {
            '/': {"message": "Banking Backend API is running"},
            '/api/expenses/': [],
            '/api/bills': [{"id": 1, "name": "Electricity", "amount": 2500, "dueDate": "2024-01-15", "status": "pending", "autoPay": False}],
            '/api/bills/exchange-rates': {"USD": 83.0, "EUR": 90.0, "GBP": 105.0},
            '/api/accounts': self.created_accounts if self.created_accounts else [],
            '/api/accounts/': self.created_accounts if self.created_accounts else [],
            '/api/transactions': [],
            '/api/transactions/': [],
            '/api/budgets': [],
            '/api/budgets/': [],
            '/api/budgets/categories': ["Food", "Transportation", "Entertainment", "Shopping", "Bills"],
            '/api/rewards': [],
            '/api/alerts': [],
            '/api/alerts/': [],
            '/api/dashboard-stats': {"total_balance": 0, "total_transactions": 0, "pending_bills": 0},
            '/api/currency/supported': {"currencies": ["USD", "EUR", "GBP", "INR", "JPY"]},
            '/api/currency/convert': {"converted_amount": 100.0, "rate": 1.0, "from_currency": "USD", "to_currency": "INR"},
            '/api/insights/': [],
            '/api/insights/spending': [],
            '/api/insights/categories': [],
            '/api/insights/trends': [],
            '/api/profile': {"id": 1, "name": "User", "email": "user@example.com"},
            '/api/profile/kyc/status': {"status": "verified", "message": "KYC verified"},
            '/api/admin/system-summary': {"total_users": 100, "active_users": 80, "total_transactions": 500},
            '/api/admin/users': [
                {"id": 1, "email": "user@bank.com", "name": "User", "role": "user", "is_active": True, "kyc_status": "verified"},
                {"id": 2, "email": "admin@bank.com", "name": "Admin", "role": "admin", "is_active": True, "kyc_status": "verified"}
            ],
            '/api/admin/accounts': [
                {"id": 1, "user_id": 1, "account_type": "savings", "balance": 50000, "masked_account": "****1234"}
            ],
            '/api/admin/transactions': [
                {"id": 1, "amount": 1000, "type": "credit", "date": datetime.now().isoformat(), "status": "completed"}
            ],
        }
        
        response = responses.get(path, {"message": "Success", "data": []})
        self.wfile.write(json.dumps(response).encode())

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b'{}'
        
        try:
            data = json.loads(post_data.decode('utf-8'))
        except:
            data = {}
        
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Mock responses for all POST endpoints
        if path == '/api/auth/login':
            email = data.get("email", "user@example.com")
            # Determine role based on email
            if "admin" in email:
                role = "admin"
            elif "auditor" in email:
                role = "auditor"
            elif "support" in email:
                role = "support"
            else:
                role = "user"
            
            response = {
                "access_token": "mock-token-" + str(datetime.now().timestamp()),
                "token_type": "bearer",
                "user": {
                    "id": 1,
                    "email": email,
                    "name": "User",
                    "role": role
                }
            }
            print(f"Login response: {response}")  # Debug log
        elif path in ['/api/auth/signup', '/api/auth/register']:
            response = {
                "message": "User registered successfully",
                "user": {"id": 1, "email": data.get("email")}
            }
        elif path == '/api/expenses/':
            response = {"id": 1, "amount": data.get("amount", 0), "description": data.get("description", ""), "category": data.get("category", "")}
        elif path == '/api/bills':
            response = {"id": 1, "name": data.get("name"), "amount": data.get("amount"), "dueDate": data.get("due_date")}
        elif path in ['/api/alerts/bill-reminders', '/api/alerts/', '/api/alerts']:
            response = {"message": "Success"}
        elif path == '/api/accounts' or path == '/api/accounts/':
            # Create account and store it
            account = {
                "id": len(self.created_accounts) + 1,
                "name": data.get("name"),
                "account_type": data.get("account_type"),
                "balance": data.get("balance", 0),
                "masked_account": f"****{1234 + len(self.created_accounts)}",
                "user_id": 1
            }
            self.created_accounts.append(account)
            response = [account]
        elif path == '/api/transactions':
            response = {"id": 1, "amount": data.get("amount"), "type": data.get("type"), "status": "completed"}
        elif path == '/api/budgets':
            response = {"id": 1, "name": data.get("name"), "amount": data.get("amount"), "category": data.get("category")}
        else:
            response = {"message": "Success", "data": data}
        
        self._set_headers()
        self.wfile.write(json.dumps(response).encode())
    
    def do_PUT(self):
        self.do_POST()
    
    def do_PATCH(self):
        self.do_POST()
    
    def do_DELETE(self):
        self._set_headers()
        response = {"message": "Deleted successfully"}
        self.wfile.write(json.dumps(response).encode())

def run_server():
    port = int(os.environ.get('PORT', 8000))
    server = HTTPServer(('0.0.0.0', port), BankingAPIHandler)
    print(f"Server running on port {port}")
    server.serve_forever()

if __name__ == '__main__':
    run_server()