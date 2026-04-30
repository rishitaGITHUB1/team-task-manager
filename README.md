# Team Task Manager

A full-stack web app where teams can manage projects and tasks together. Built with React, Node.js, and MongoDB.

## Features

- Signup and login with JWT authentication
- Create projects and invite teammates by email
- Assign tasks with priority levels and due dates
- Kanban board to track task progress (Todo → In Progress → In Review → Done)
- Admin and Member roles with different permissions
- Dashboard showing your active, completed, and overdue tasks

## Tech Stack

- **Frontend** – React, React Router, Axios
- **Backend** – Node.js, Express
- **Database** – MongoDB with Mongoose
- **Auth** – JWT + bcrypt
- **Deployed on** – Railway

## Getting Started

Make sure you have Node.js and MongoDB installed.

```bash
git clone https://github.com/rishitaGITHUB1/team-task-manager.git
cd team-task-manager
```

**Backend setup:**
```bash
cd backend
npm install
cp .env.example .env
# Fill in your MONGO_URI and JWT_SECRET in .env
npm run dev
```

**Frontend setup:**
```bash
cd frontend
npm install
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5000/api
npm start
```

Open `http://localhost:3000` in your browser.

## Roles

| Role | What they can do |
|------|-----------------|
| Admin | Add/remove members, update project, delete any task |
| Member | Create and update tasks, view the board |

## Live Demo

- **App:** [your Railway URL here]
- **GitHub:** https://github.com/rishitaGITHUB1/team-task-manager
