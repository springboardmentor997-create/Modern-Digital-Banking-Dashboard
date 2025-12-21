import requests

BASE_URL = "http://127.0.0.1:8000/auth"

def test_register_and_login():
    email = "testuser@example.com"
    password = "password123"
    name = "Test User"

    try:
        # 1. Register
        print(f"Registering {email}...")
        register_payload = {
            "email": email,
            "password": password,
            "name": name
        }

        response = requests.post(
            f"{BASE_URL}/register",
            json=register_payload,
            timeout=5
        )

        if response.status_code in (200, 201):
            print("✅ Registration successful")
        elif response.status_code == 400 and "already" in response.text.lower():
            print("ℹ️ User already exists, proceeding to login")
        else:
            print(f"❌ Registration failed: {response.status_code}")
            print(response.text)
            return

        # 2. Login
        print(f"\nLogging in as {email}...")
        login_payload = {
            "email": email,
            "password": password
        }

        response = requests.post(
            f"{BASE_URL}/login",
            json=login_payload,
            timeout=5
        )

        if response.status_code == 200:
            print("✅ Login successful!")
            print("🔑 Token:", response.json().get("access_token"))
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(response.text)

    except requests.exceptions.ConnectionError:
        print("❌ Backend server is NOT running on http://127.0.0.1:8000")
    except Exception as e:
        print("❌ Error:", e)

if __name__ == "__main__":
    test_register_and_login()