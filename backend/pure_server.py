import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

class BankingAPIHandler(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()

    def do_GET(self):
        self._set_headers()
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/':
            response = {"message": "Banking Backend API is running"}
        elif parsed_path.path == '/api/expenses/':
            response = []
        elif parsed_path.path == '/api/bills':
            response = [
                {"id": 1, "name": "Electricity Bill", "amount": 2500.0, "dueDate": "2024-01-15", "status": "pending", "autoPay": False},
                {"id": 2, "name": "Internet Bill", "amount": 1200.0, "dueDate": "2024-01-20", "status": "paid", "autoPay": True}
            ]
        else:
            response = {"error": "Not found"}
        
        self.wfile.write(json.dumps(response).encode())

    def do_POST(self):
        self._set_headers()
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
        except:
            data = {}
        
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/expenses/':
            response = {
                "id": 1,
                "amount": data.get("amount", 0),
                "description": data.get("description", ""),
                "category": data.get("category", ""),
                "expense_date": "2024-01-01T00:00:00Z"
            }
        elif parsed_path.path == '/api/auth/login':
            response = {
                "access_token": "mock-token",
                "user": {"id": 1, "email": "user@example.com"}
            }
        else:
            response = {"message": "Created"}
        
        self.wfile.write(json.dumps(response).encode())

def run_server():
    port = int(os.environ.get('PORT', 8000))
    server = HTTPServer(('0.0.0.0', port), BankingAPIHandler)
    print(f"Server running on port {port}")
    server.serve_forever()

if __name__ == '__main__':
    run_server()