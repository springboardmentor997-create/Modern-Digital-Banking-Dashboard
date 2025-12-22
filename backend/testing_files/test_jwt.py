from app.utils.jwt_handler import create_access_token, verify_access_token

data = {"sub": "auth@test.com"}

print("Creating token...")
token = create_access_token(data)
print("Token:", token)

print("Verifying token...")
payload = verify_access_token(token)
print("Payload:", payload)

assert payload["sub"] == "auth@test.com"

print("JWT tests passed.")
