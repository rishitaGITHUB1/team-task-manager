# ⬡ TaskFlow — Team Task Manager

A full-stack web app where teams can create projects, assign tasks, and track progress with role-based access control (Admin/Member).

## 🚀 Features

- **Authentication** — JWT-based signup/login with protected routes
- **Projects** — Create, update, delete projects; invite teammates by email
- **Role-Based Access** — Admins manage members & settings; Members create & update tasks
- **Kanban Board** — Visual task board with Todo / In Progress / In Review / Done columns
- **Task Management** — Create, assign, set priority, due dates, and status
- **Dashboard** — Live stats: active tasks, overdue count, completion rate
- **My Tasks** — Filter & search tasks assigned to you across all projects

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Validation | express-validator |
| Deployment | Railway |

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── src/
│   │   ├── config/        # DB connection
│   │   ├── controllers/   # authController, projectController, taskController
│   │   ├── middleware/     # auth.js (JWT), role.js (Admin/Member)
│   │   ├── models/        # User, Project, Task
│   │   ├── routes/        # auth, projects, tasks, users
│   │   └── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── context/       # AuthContext
    │   ├── pages/         # Login, Register, Dashboard, Projects, ProjectDetail, MyTasks
    │   ├── components/    # Layout (sidebar + main)
    │   └── utils/         # api.js (axios instance)
    └── package.json
```

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))

### 1. Clone & install
```bash
git clone <your-repo>
cd team-task-manager
npm run install:all
```

### 2. Configure backend
```bash
cd backend
cp .env.example .env
# Edit .env — set MONGO_URI and a strong JWT_SECRET
```

### 3. Configure frontend
```bash
cd frontend
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Run both servers
```bash
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev:frontend
```

App runs at `http://localhost:3000` | API at `http://localhost:5000`

---

## 🚂 Deploy to Railway

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2 — Deploy Backend
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo → Set **Root Directory** to `backend`
3. Add environment variables:
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — any strong random string
   - `NODE_ENV` — `production`
4. Railway auto-detects the start command from `railway.toml`
5. Copy the generated backend URL (e.g. `https://your-backend.railway.app`)

### Step 3 — Deploy Frontend
1. New service in the same Railway project → GitHub repo again
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   - `REACT_APP_API_URL` — `https://your-backend.railway.app/api`
4. Railway builds React and serves it

### Step 4 — MongoDB Atlas (free tier)
1. Create cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user
3. Whitelist `0.0.0.0/0` in Network Access
4. Copy the connection string → use as `MONGO_URI` in Railway

---

## 🔐 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Bearer | Get current user |
| GET | `/api/projects` | Bearer | List my projects |
| POST | `/api/projects` | Bearer | Create project |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Owner | Delete project |
| POST | `/api/projects/:id/members` | Admin | Add member by email |
| DELETE | `/api/projects/:id/members/:userId` | Admin | Remove member |
| GET | `/api/tasks/dashboard` | Bearer | Dashboard stats |
| GET | `/api/tasks/my` | Bearer | My assigned tasks |
| GET | `/api/tasks/project/:projectId` | Member | Tasks in project |
| POST | `/api/tasks` | Member | Create task |
| PUT | `/api/tasks/:id` | Member | Update task |
| DELETE | `/api/tasks/:id` | Admin/Creator | Delete task |

---

## 📽 Demo Video Tips
1. Register two accounts (Admin + Member)
2. Create a project as Admin → add Member by email
3. Create tasks with different priorities & due dates
4. Show Kanban board — move tasks through statuses
5. Switch to Member account — show limited permissions
6. Show Dashboard stats & My Tasks page

---

Built with ❤️ by [Your Name]
