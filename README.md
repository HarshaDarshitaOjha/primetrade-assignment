# PrimeTrade Assignment

A full-stack web application with a **FastAPI** backend and **React** frontend, featuring JWT authentication, role-based access control, and CRUD operations on tasks.

---

## Project Structure

```
primetrade-assignment/
├── backend/          # FastAPI REST API
│   ├── app/
│   │   ├── api/v1/   # Route handlers (auth, tasks)
│   │   ├── core/     # Config, security (JWT, bcrypt)
│   │   ├── db/       # SQLAlchemy models, session, Base
│   │   └── schemas/  # Pydantic request/response schemas
│   ├── alembic/      # Database migrations
│   ├── .env.example  # Environment variable template
│   └── requirements.txt
├── frontend/         # React + Vite SPA
│   ├── src/
│   │   ├── pages/    # Register, Login, Dashboard
│   │   └── api.js    # Axios instance with JWT interceptor
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ (or use Docker Compose)

---

## Backend Setup

```powershell
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and fill in environment variables
copy .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET

# Run database migrations
alembic upgrade head

# Start the API server
uvicorn app.main:app --reload
```

API available at: `http://127.0.0.1:8000`  
Swagger docs at: `http://127.0.0.1:8000/docs`

---

## Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

App available at: `http://localhost:5173`

> The Vite dev server proxies all `/api` requests to the backend on port 8000 automatically.

---

## Environment Variables

Create `backend/.env` based on `backend/.env.example`:

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/primetrade` |
| `JWT_SECRET` | Secret key for signing JWTs | `your-secret-key-here` |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime in minutes | `60` |

---

## API Overview

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Login and receive a JWT token |

### Tasks (JWT required)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/tasks` | List all tasks (admin sees all, users see own) |
| `POST` | `/api/v1/tasks` | Create a task |
| `GET` | `/api/v1/tasks/{id}` | Get a single task |
| `PATCH` | `/api/v1/tasks/{id}` | Update a task |
| `DELETE` | `/api/v1/tasks/{id}` | Delete a task |

---

## Docker (Optional)

Run the full stack (backend + PostgreSQL) with Docker Compose:

```powershell
docker-compose up --build
```

Then run frontend separately with `npm run dev` in the `frontend/` folder.

---

## Security

- Passwords hashed with **bcrypt** (via passlib)
- Authentication via signed **JWT** tokens (python-jose)
- Role-based access: `user` (own tasks only) vs `admin` (all tasks)
- Input validated with **Pydantic** schemas on every endpoint
- `.env` file excluded from version control

---

## Scalability

See [`SCALABILITY.md`](./SCALABILITY.md) for a detailed note on scaling this architecture.
