import requests
import json

# Test the backend API
BASE_URL = "http://localhost:8000"

def test_api():
    print("Testing Banking Backend API...")
    
    # Test root endpoint
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✓ Root endpoint: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"✗ Root endpoint failed: {e}")
        return
    
    # Mock token for testing (in real app, get this from login)
    headers = {"Authorization": "Bearer test-token"}
    
    # Test categories
    try:
        response = requests.get(f"{BASE_URL}/api/expenses/categories/list", headers=headers)
        print(f"✓ Categories: {response.status_code} - Found {len(response.json())} categories")
    except Exception as e:
        print(f"✗ Categories failed: {e}")
    
    # Test expenses (should be empty initially)
    try:
        response = requests.get(f"{BASE_URL}/api/expenses/", headers=headers)
        print(f"✓ Expenses: {response.status_code} - Found {len(response.json())} expenses")
    except Exception as e:
        print(f"✗ Expenses failed: {e}")
    
    # Test creating an expense
    try:
        expense_data = {
            "amount": 25.50,
            "description": "Test Coffee",
            "category": "Food & Dining",
            "location": "Test Cafe",
            "merchant": "Test Merchant",
            "has_receipt": True
        }
        response = requests.post(f"{BASE_URL}/api/expenses/", 
                               headers=headers, 
                               json=expense_data)
        print(f"✓ Create expense: {response.status_code} - Created expense ID {response.json()['id']}")
        expense_id = response.json()['id']
        
        # Test analytics
        response = requests.get(f"{BASE_URL}/api/expenses/analytics/summary", headers=headers)
        analytics = response.json()
        print(f"✓ Analytics: {response.status_code} - Total: ₹{analytics['total_expenses']}")
        
        # Test receipts
        response = requests.get(f"{BASE_URL}/api/expenses/receipts/", headers=headers)
        print(f"✓ Receipts: {response.status_code} - Found {len(response.json())} receipts")
        
        # Test delete
        response = requests.delete(f"{BASE_URL}/api/expenses/{expense_id}", headers=headers)
        print(f"✓ Delete expense: {response.status_code}")
        
    except Exception as e:
        print(f"✗ Expense operations failed: {e}")
    
    print("\nAPI testing completed!")

if __name__ == "__main__":
    test_api()