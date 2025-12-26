## Database Setup (PostgreSQL)

Database name: digital_banking

Run the SQL in `backend/db/schema.sql` using pgAdmin or psql
before starting the backend server.

Environment variable required:
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/digital_banking
##
## Week 1 – Backend Foundation

Status: ✅ Complete and stable

### Implemented Features
- User authentication (register & login)
- Secure password hashing (bcrypt)
- JWT-based authentication
- Environment-based secret management
- Protected routes using OAuth2PasswordBearer
- PostgreSQL integration (digital_banking)
- SQLAlchemy ORM setup
- User-scoped Accounts CRUD

### Core Tables
- users
- accounts

### Security
- Passwords hashed (never stored or returned in plaintext)
- JWT access tokens with expiry
- Protected endpoints require valid token
- Users can only access their own data

### API Verification
- Swagger UI fully functional
- Auth, protected routes, and accounts tested
- Unauthorized access correctly blocked

### Architecture
- Clear separation of concerns:
  - models → DB structure
  - schemas → request/response validation
  - services → business logic
  - routers → API layer
