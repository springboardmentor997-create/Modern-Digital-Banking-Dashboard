# Modern Digital Banking Dashboard

A comprehensive digital banking system built with FastAPI backend and React frontend, featuring user management, transaction processing, account management, and administrative tools.

## 🏗️ Architecture

- **Backend**: FastAPI with PostgreSQL database
- **Frontend**: React with Vite and Tailwind CSS
- **Database**: PostgreSQL 15
- **Containerization**: Docker & Docker Compose
- **Authentication**: JWT-based authentication

## 🚀 Features

### User Features
- **Account Management**: Multiple account types, balance tracking
- **Transactions**: Transfer funds, transaction history, CSV import/export
- **Bills & Budgets**: Bill management, budget tracking
- **Rewards**: Points system, reward redemption
- **KYC**: Document upload and verification
- **Alerts**: Real-time notifications
- **Insights**: Financial analytics and reports
- **Currency Converter**: Multi-currency support

### Admin Features
- **User Management**: Create, update, deactivate users
- **Account Management**: Manage all user accounts
- **Transaction Monitoring**: View and manage all transactions
- **System Settings**: Configure system parameters
- **Rewards Management**: Manage reward programs
- **KYC Oversight**: Review and approve KYC documents

### Auditor Features
- **Audit Reports**: Generate compliance reports
- **Transaction Auditing**: Review transaction patterns
- **System Logs**: Monitor system activities
- **User Auditing**: Track user activities

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: ORM for database operations
- **PostgreSQL**: Primary database
- **JWT**: Authentication and authorization
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server

### Frontend
- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client
- **React Router**: Client-side routing

## 📦 Installation & Setup

### Prerequisites
- Docker and Docker Compose
- Git
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Quick Start with Docker

1. **Clone the repository**
```bash
git clone https://github.com/springboardmentor997-create/Modern-Digital-Banking-Dashboard.git
cd Modern-Digital-Banking-Dashboard
```

2. **Start the application**
```bash
docker-compose up -d
```

3. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Default Login Credentials
- **Admin**: admin@bank.com / admin123
- **User**: user@bank.com / user123
- **Test User**: test@test.com / test123

## 🐳 Docker Deployment

### Full Stack Deployment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Backend Only Deployment
```bash
# Start backend and database only
docker-compose -f docker-compose.backend.yml up -d
```

### Production Deployment
```bash
# Use production configuration
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:password@localhost:5433/banking_db
JWT_SECRET_KEY=your-secret-key
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-app-password
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

#### Docker (.env.docker)
```env
POSTGRES_PASSWORD=your-postgres-password
DATABASE_URL=postgresql://postgres:password@postgres:5432/banking_db
API_URL=http://localhost:8000
```

## 📁 Project Structure

```
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── auth/           # Authentication modules
│   │   ├── models/         # Database models
│   │   ├── routers/        # API routes
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── uploads/            # File uploads
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── api/            # API client functions
│   │   ├── context/        # React contexts
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Main compose file
├── docker-compose.prod.yml # Production compose
└── README.md
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation with Pydantic
- SQL injection prevention with SQLAlchemy
- File upload restrictions
- Rate limiting (configurable)

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📊 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🚀 Deployment Options

### Local Development
1. Start PostgreSQL database
2. Run backend: `cd backend && uvicorn app.main:app --reload`
3. Run frontend: `cd frontend && npm run dev`

### Docker Development
```bash
docker-compose up -d
```

### Production Deployment
1. Update environment variables in `.env.docker`
2. Use production compose file: `docker-compose -f docker-compose.prod.yml up -d`
3. Set up reverse proxy (nginx/traefik)
4. Configure SSL certificates

## 🔄 Database Migrations

The application automatically creates database tables on startup. For manual database operations:

```bash
# Access database container
docker exec -it banking_postgres psql -U postgres -d banking_db

# Backup database
docker exec banking_postgres pg_dump -U postgres banking_db > backup.sql

# Restore database
docker exec -i banking_postgres psql -U postgres banking_db < backup.sql
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation at `/docs`
- Review the logs: `docker-compose logs -f`

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in environment variables
   - Verify database credentials

2. **Frontend API Connection Error**
   - Check VITE_API_URL in frontend .env
   - Ensure backend is running on correct port
   - Verify CORS settings

3. **Docker Issues**
   - Run `docker-compose down` and `docker-compose up -d`
   - Check logs: `docker-compose logs -f`
   - Rebuild images: `docker-compose build --no-cache`

### Health Checks
- Backend: http://localhost:8000/health
- Database: Check docker-compose logs for postgres service
- Frontend: http://localhost:5173 should load the application

---

**Built with ❤️ using FastAPI and React**