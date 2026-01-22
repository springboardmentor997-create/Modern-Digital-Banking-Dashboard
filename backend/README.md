# Banking Backend API

A FastAPI backend for the Smart Banking application with expense tracking functionality.

## Local Development

### Prerequisites
- Python 3.8+
- pip

### Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file with the following variables:
   ```
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ```

4. Run the server:
   ```bash
   python main.py
   ```

   Or use uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- Interactive API docs: `http://localhost:8000/docs`
- ReDoc documentation: `http://localhost:8000/redoc`

## Deployment to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend` (if backend is in a subdirectory)

4. Add environment variables:
   - `SECRET_KEY`: A secure random string
   - `ALGORITHM`: `HS256`

## API Endpoints

### Expenses
- `GET /api/expenses/` - Get all expenses
- `POST /api/expenses/` - Create new expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense

### Categories
- `GET /api/expenses/categories/list` - Get expense categories

### Analytics
- `GET /api/expenses/analytics/summary` - Get expense analytics

### Receipts
- `GET /api/expenses/receipts/` - Get expenses with receipts

## Frontend Configuration

Update your frontend `.env` file:

For local development:
```
VITE_API_URL=http://localhost:8000
```

For production (replace with your Render URL):
```
VITE_API_URL=https://your-app-name.onrender.com
```