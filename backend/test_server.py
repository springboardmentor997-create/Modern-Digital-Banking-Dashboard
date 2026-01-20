import requests
import json

def test_server():
    base_url = "http://127.0.0.1:8000"
    
    try:
        # Test health endpoint
        print("Testing health endpoint...")
        response = requests.get(f"{base_url}/health")
        print(f"Health check: {response.status_code} - {response.json()}")
        
        # Test login endpoint
        print("\nTesting login endpoint...")
        login_data = {
            "email": "test@test.com",
            "password": "test123"
        }
        response = requests.post(f"{base_url}/api/auth/login", json=login_data)
        print(f"Login test: {response.status_code} - {response.json()}")
        
        print("\nServer is working correctly!")
        
    except requests.exceptions.ConnectionError:
        print("ERROR: Cannot connect to server. Make sure the server is running on port 8000.")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_server()