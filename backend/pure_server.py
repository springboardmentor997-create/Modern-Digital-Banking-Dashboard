import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime

class BankingAPIHandler(BaseHTTPRequestHandler):
    # Class variables to store created data
    created_accounts = []
    created_budgets = []
    created_bills = [
        {"id": 1, "name": "Electricity Bill", "amount": 2500.0, "dueDate": "2024-01-15", "status": "pending", "autoPay": False},
        {"id": 2, "name": "Internet Bill", "amount": 1200.0, "dueDate": "2024-01-20", "status": "paid", "autoPay": True},
        {"id": 3, "name": "Water Bill", "amount": 800.0, "dueDate": "2024-01-25", "status": "pending", "autoPay": False}
    ]
    created_expenses = []
    created_transactions = []
    created_alerts = [
        {"id": 1, "title": "Low Balance Alert", "message": "Your balance is below $500", "type": "warning", "timestamp": "2024-01-18T10:00:00", "read": False},
        {"id": 2, "title": "Bill Due", "message": "Electricity bill is due in 3 days", "type": "info", "timestamp": "2024-01-17T09:00:00", "read": False}
    ]
    # Store current user as class variable so it persists across requests
    current_user = {"id": 1, "name": "Demo User", "email": "user@bank.com", "role": "user", "phone": "+1234567890", "kyc_status": "unverified", "created_at": "2024-01-01T00:00:00"}
    
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
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query_params = parse_qs(parsed_path.query)

        # Handle API routes
        if path.startswith('/api/') or path == '/' or path.startswith('/profile/'):
            self._set_headers()
            
            # Handle currency convert with query params
            if path == '/api/currency/convert':
                try:
                    amount = float(query_params.get('amount', [100])[0])
                    from_curr = query_params.get('from_currency', query_params.get('from', ['USD']))[0]
                    to_curr = query_params.get('to_currency', query_params.get('to', ['INR']))[0]
                    rate = 83.0 if from_curr == 'INR' and to_curr == 'USD' else 0.012
                    converted = amount * rate
                    response = {
                        "result": converted,
                        "converted_amount": converted,
                        "convertedAmount": converted,
                        "rate": rate,
                        "from_currency": from_curr,
                        "to_currency": to_curr,
                        "amount": amount
                    }
                    self.wfile.write(json.dumps(response).encode())
                    return
                except Exception as e:
                    print(f"Currency convert error: {e}")
                    response = {"result": 8300.0, "converted_amount": 8300.0, "convertedAmount": 8300.0, "rate": 83.0}
                    self.wfile.write(json.dumps(response).encode())
                    return
            
            # Mock responses for all GET endpoints
            responses = {
                '/': {"message": "Banking Backend API is running"},
                '/api/expenses/': self.created_expenses if self.created_expenses else [],
                '/api/expenses': self.created_expenses if self.created_expenses else [],
                '/api/bills': self.created_bills if self.created_bills else [],
                '/api/bills/': self.created_bills if self.created_bills else [],
                '/api/bills/exchange-rates': {"USD": 83.0, "EUR": 90.0, "GBP": 105.0},
                '/api/accounts': self.created_accounts if self.created_accounts else [],
                '/api/accounts/': self.created_accounts if self.created_accounts else [],
                '/api/transactions': self.created_transactions if self.created_transactions else [
                    {"id": 1, "amount": 5000, "txn_type": "credit", "description": "Salary", "txn_date": "2024-01-15T00:00:00", "category": "Income", "merchant": "Company", "account_id": 1},
                    {"id": 2, "amount": 1200, "txn_type": "debit", "description": "Rent", "txn_date": "2024-01-10T00:00:00", "category": "Bills", "merchant": "Landlord", "account_id": 1}
                ],
                '/api/transactions/': self.created_transactions if self.created_transactions else [
                    {"id": 1, "amount": 5000, "txn_type": "credit", "description": "Salary", "txn_date": "2024-01-15T00:00:00", "category": "Income", "merchant": "Company", "account_id": 1},
                    {"id": 2, "amount": 1200, "txn_type": "debit", "description": "Rent", "txn_date": "2024-01-10T00:00:00", "category": "Bills", "merchant": "Landlord", "account_id": 1}
                ],
                '/api/transactions/recent': self.created_transactions if self.created_transactions else [
                    {"id": 1, "amount": 5000, "txn_type": "credit", "description": "Salary", "txn_date": "2024-01-15T00:00:00", "category": "Income", "merchant": "Company", "account_id": 1},
                    {"id": 2, "amount": 1200, "txn_type": "debit", "description": "Rent", "txn_date": "2024-01-10T00:00:00", "category": "Bills", "merchant": "Landlord", "account_id": 1}
                ],
                '/api/budgets': self.created_budgets if self.created_budgets else [],
                '/api/budgets/': self.created_budgets if self.created_budgets else [],
                '/api/budgets/categories': ["Food", "Transportation", "Entertainment", "Shopping", "Bills"],
                '/api/rewards': [
                    {"id": 1, "title": "Welcome Bonus", "points": 500, "status": "active", "given_by_admin": True, "admin_message": "Welcome to our bank!", "points_balance": 500},
                    {"id": 2, "title": "Loyalty Reward", "points": 1000, "status": "active", "given_by_admin": True, "admin_message": "Thank you for being with us.", "points_balance": 1000}
                ],
                '/api/alerts': self.created_alerts,
                '/api/alerts/': self.created_alerts,
                '/api/alerts/summary': {"total": len(self.created_alerts), "unread": len([a for a in self.created_alerts if not a['read']])},
                '/api/alerts/summary/': {"total": len(self.created_alerts), "unread": len([a for a in self.created_alerts if not a['read']])},
                '/api/dashboard-stats': {
                    "total_balance": sum(a.get('balance', 0) for a in self.created_accounts) if self.created_accounts else 150000.0,
                    "total_transactions": len(self.created_transactions) if self.created_transactions else 2,
                    "pending_bills": len([b for b in self.created_bills if b['status'] != 'paid'])
                },
                '/api/auditor/users': [
                    {"id": 1, "email": "user@bank.com", "name": "User", "role": "user", "status": "active"},
                    {"id": 2, "email": "admin@bank.com", "name": "Admin", "role": "admin", "status": "active"}
                ],
                '/api/auditor/accounts': [
                    {"id": 1, "user_id": 1, "type": "savings", "balance": 50000},
                    {"id": 2, "user_id": 1, "type": "checking", "balance": 10000}
                ],
                '/api/auditor/system-logs': [
                    {"id": 1, "action": "LOGIN", "user": "user@bank.com", "timestamp": "2024-01-19T09:00:00"},
                    {"id": 2, "action": "TRANSFER", "user": "user@bank.com", "timestamp": "2024-01-19T09:30:00"}
                ],
                '/api/auditor/compliance-summary': {"score": 95, "status": "Good"},
                '/api/auditor/transaction-patterns': [],
                '/api/auditor/user-activity-report': [],
                '/api/auditor/alerts': self.created_alerts,
                '/api/currency/supported': {"currencies": ["USD", "EUR", "GBP", "INR", "JPY"]},
                '/api/currency/convert': {"converted_amount": 100.0, "rate": 1.0, "from_currency": "USD", "to_currency": "INR"},
                '/api/insights/': {
                    "income": 50000,
                    "expenses": 35000,
                    "net_flow": 15000,
                    "savings_rate": 30.0
                },
                '/api/insights/spending': {
                    "daily_burn_rate": 1166.67,
                    "projected_monthly_spend": 35000,
                    "top_merchants": [
                        {"merchant": "Amazon", "amount": 5000},
                        {"merchant": "Walmart", "amount": 3000}
                    ]
                },
                '/api/insights/categories': [
                    {"category": "Food & Dining", "amount": 12000, "percentage": 34.3},
                    {"category": "Transportation", "amount": 8000, "percentage": 22.9},
                    {"category": "Shopping", "amount": 7000, "percentage": 20.0},
                    {"category": "Bills", "amount": 5000, "percentage": 14.3},
                    {"category": "Entertainment", "amount": 3000, "percentage": 8.5}
                ],
                '/api/insights/trends': [
                    {"month": "Jan", "savings": 10000},
                    {"month": "Feb", "savings": 12000},
                    {"month": "Mar", "savings": 15000},
                    {"month": "Apr", "savings": 13000},
                    {"month": "May", "savings": 16000},
                    {"month": "Jun", "savings": 15000}
                ],
                '/api/user/profile': BankingAPIHandler.current_user,
                '/api/profile': BankingAPIHandler.current_user,
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
            return

        # Serve static files for frontend
        file_path = path.lstrip('/')
        if not file_path:
            file_path = 'index.html'
        
        # Look in frontend/dist
        full_path = os.path.join(os.getcwd(), 'frontend', 'dist', file_path)
        
        # If path doesn't exist, serve index.html (for SPA routing)
        if not os.path.exists(full_path) or os.path.isdir(full_path):
            full_path = os.path.join(os.getcwd(), 'frontend', 'dist', 'index.html')
        
        if os.path.exists(full_path):
            status = 200
            content_type = 'text/html'
            if full_path.endswith('.js'): content_type = 'application/javascript'
            elif full_path.endswith('.css'): content_type = 'text/css'
            elif full_path.endswith('.png'): content_type = 'image/png'
            elif full_path.endswith('.jpg') or full_path.endswith('.jpeg'): content_type = 'image/jpeg'
            elif full_path.endswith('.svg'): content_type = 'image/svg+xml'
            elif full_path.endswith('.json'): content_type = 'application/json'
            
            self.send_response(status)
            self.send_header('Content-type', content_type)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            with open(full_path, 'rb') as f:
                self.wfile.write(f.read())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "File not found"}).encode())


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
                name = "Admin User"
            elif "auditor" in email:
                role = "auditor"
                name = "Auditor User"
            elif "support" in email:
                role = "support"
                name = "Support User"
            else:
                role = "user"
                name = "Demo User"
            
            # Store current user in class variable (persists across requests)
            BankingAPIHandler.current_user = {
                "id": 1,
                "email": email,
                "name": name,
                "role": role,
                "phone": "+1234567890"
            }
            
            response = {
                "access_token": "mock-token-" + str(datetime.now().timestamp()),
                "token_type": "bearer",
                "user": BankingAPIHandler.current_user
            }
            print(f"Login response: {response}")  # Debug log
        elif path in ['/api/auth/signup', '/api/auth/register']:
            response = {
                "message": "User registered successfully",
                "user": {"id": 1, "email": data.get("email")}
            }
        elif path == '/api/expenses/' or path == '/api/expenses':
            expense = {
                "id": len(self.created_expenses) + 1,
                "amount": data.get("amount", 0),
                "description": data.get("description", ""),
                "category": data.get("category", ""),
                "date": datetime.now().isoformat()
            }
            self.created_expenses.append(expense)
            response = expense
        elif path == '/api/bills' or path == '/api/bills/':
            bill = {
                "id": len(self.created_bills) + 1,
                "name": data.get("name"),
                "amount": data.get("amount"),
                "dueDate": data.get("due_date", datetime.now().isoformat()),
                "status": "pending",
                "autoPay": False
            }
            self.created_bills.append(bill)
            response = bill
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
        elif path == '/api/transactions' or path == '/api/transactions/':
            transaction = {
                "id": len(self.created_transactions) + 1,
                "amount": data.get("amount", 0),
                "txn_type": data.get("txn_type", "debit"),
                "description": data.get("description", ""),
                "category": data.get("category", "General"),
                "merchant": data.get("merchant", ""),
                "account_id": data.get("account_id", 1),
                "txn_date": data.get("date", datetime.now().isoformat())
            }
            self.created_transactions.append(transaction)
            response = transaction
        elif path == '/api/budgets' or path == '/api/budgets/':
            budget = {
                "id": len(self.created_budgets) + 1,
                "name": data.get("name"),
                "amount": data.get("amount"),
                "category": data.get("category"),
                "spent": 0,
                "remaining": data.get("amount", 0)
            }
            self.created_budgets.append(budget)
            response = budget
        elif path == '/profile/kyc/submit':
            BankingAPIHandler.current_user["kyc_status"] = "verified"
            response = {
                "message": "KYC submitted successfully",
                "status": "verified",
                "reference_id": "KYC" + str(datetime.now().timestamp())
            }
        else:
            response = {"message": "Success", "data": data}
        
        self._set_headers()
        self.wfile.write(json.dumps(response).encode())
    
    def do_PUT(self):
        self.do_POST()
    
    def do_PATCH(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b'{}'
        
        try:
            data = json.loads(post_data.decode('utf-8'))
        except:
            data = {}
        
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Handle PATCH /api/bills/{id}/autopay
        if '/api/bills/' in path and '/autopay' in path:
            try:
                bill_id = int(path.split('/')[3])
                # Find and update the bill
                for bill in self.created_bills:
                    if bill['id'] == bill_id:
                        bill['autoPay'] = not bill.get('autoPay', False)
                        response = {
                            "message": f"Auto-pay {'enabled' if bill['autoPay'] else 'disabled'} for {bill['name']}",
                            "autoPay": bill['autoPay']
                        }
                        self._set_headers()
                        self.wfile.write(json.dumps(response).encode())
                        return
                
                # If not found in created_bills, it might be an initial bill
                # But we initialized created_bills now, so it should be there.
                response = {"message": "Bill not found", "autoPay": False}
                self._set_headers(404)
                self.wfile.write(json.dumps(response).encode())
            except Exception as e:
                response = {"message": str(e), "autoPay": False}
                self._set_headers(500)
                self.wfile.write(json.dumps(response).encode())
        elif '/api/alerts/' in path and '/read' in path:
            try:
                alert_id = int(path.split('/')[3])
                for alert in self.created_alerts:
                    if alert['id'] == alert_id:
                        alert['read'] = True
                        self._set_headers()
                        self.wfile.write(json.dumps(alert).encode())
                        return
                self._set_headers(404)
            except:
                self._set_headers(500)
        else:
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
    run_server()#      
 