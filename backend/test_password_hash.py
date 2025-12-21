from app.utils.password_hash import hash_password, verify_password

password = "strongpassword123"

hashed = hash_password(password)
print("Hashed password:", hashed)

assert verify_password(password, hashed) is True
assert verify_password("wrongpassword", hashed) is False

print("Password hashing tests passed.")
