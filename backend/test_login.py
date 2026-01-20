import requests
import json

BASE_URL = "http://localhost:8001"

def test_login():
    print("Testing Login Endpoint...")
    
    login_data = {
        "email": "test@test.com",
        "password": "test123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and "user" in data:
                print("SUCCESS: access_token and user object found in response")
            else:
                print("FAILURE: access_token or user object missing in response")
        else:
            print(f"FAILURE: Received status code {response.status_code}")
            
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_login()
