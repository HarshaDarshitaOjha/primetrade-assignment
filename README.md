# PrimeTrade Assignment — Task Manager API

A full-stack task management app with JWT authentication and role-based access control (RBAC).

- **Backend:** FastAPI + SQLAlchemy + Alembic + SQLite (dev) / PostgreSQL (prod)
- **Frontend:** React (Vite) + Tailwind CSS + Axios
- **Auth:** JWT with bcrypt password hashing
- **Roles:** `user` (own tasks only) and `admin` (all tasks)

## Live Demo

| Layer    | URL |
|----------|-----|
| Frontend | https://primetrade-assignment-nine.vercel.app |
| Backend  | https://primetrade-api-wyki.onrender.com |
| Swagger  | https://primetrade-api-wyki.onrender.com/docs |

## API Endpoints

| Method | Endpoint                  | Auth | Description           |
|--------|---------------------------|------|-----------------------|
| POST   | `/api/v1/auth/register`   | No   | Register a new user   |
| POST   | `/api/v1/auth/login`      | No   | Login, get JWT token  |
| GET    | `/api/v1/tasks`           | Yes  | List tasks            |
| POST   | `/api/v1/tasks`           | Yes  | Create a task         |
| GET    | `/api/v1/tasks/{id}`      | Yes  | Get single task       |
| PATCH  | `/api/v1/tasks/{id}`      | Yes  | Update a task         |
| DELETE | `/api/v1/tasks/{id}`      | Yes  | Delete a task         |

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm

### Backend Setup

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=sqlite:///./app.db
JWT_SECRET=your_secret_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Run migrations and start the server:

```bash
alembic upgrade head
uvicorn app.main:app --reload
```

Swagger docs: http://127.0.0.1:8000/docs

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Environment Variables

| Variable                    | Required | Description                  |
|-----------------------------|----------|------------------------------|
| `DATABASE_URL`              | Yes      | Database connection string   |
| `JWT_SECRET`                | Yes      | Secret key for JWT signing   |
| `JWT_ALGORITHM`             | No       | Default: HS256               |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| No      | Default: 60                  |
| `VITE_API_URL`              | Prod only| Backend URL for frontend     |

## Project Structure

```
primetrade-assignment/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── auth.py
│   │   │   │   ├── tasks.py
│   │   │   │   └── router.py
│   │   │   └── deps.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   ├── models.py
│   │   │   └── session.py
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   └── task.py
│   │   └── main.py
│   ├── alembic/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Register.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## Scalability Considerations

See [`SCALABILITY.md`](./SCALABILITY.md) for detailed notes on microservices, caching, and load balancing.

## License

MIT
