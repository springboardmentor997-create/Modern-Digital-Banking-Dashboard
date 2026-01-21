import requests
import sys

def test_api():
    base_url = "http://localhost:8001/api"
    login_url = f"{base_url}/auth/login"
    login_data = {
        "email": "test@test.com",
        "password": "test123"
    }
    
    try:
        print("Testing Login...")
        login_response = requests.post(login_url, json=login_data)
        print(f"Login Status Code: {login_response.status_code}")
        
        if login_response.status_code != 200:
            print(f"Login Failed: {login_response.text}")
            return
            
        token = login_response.json().get("access_token")
        print(f"Token obtained: {token[:10]}...")
        
        print("\nTesting Profile API...")
        profile_url = f"{base_url}/profile"
        headers = {"Authorization": f"Bearer {token}"}
        profile_response = requests.get(profile_url, headers=headers)
        print(f"Profile Status Code: {profile_response.status_code}")
        print(f"Profile Response: {profile_response.text}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
