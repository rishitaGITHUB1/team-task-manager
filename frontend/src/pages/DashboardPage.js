import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { format } from 'date-fns';
import './DashboardPage.css';

const StatCard = ({ label, value, color, icon }) => (
  <div className="stat-card" style={{ '--stat-color': color }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const statusBadge = (status) => {
  const map = { 'Todo': 'todo', 'In Progress': 'inprogress', 'In Review': 'inreview', 'Done': 'done' };
  return <span className={`badge badge-${map[status] || 'todo'}`}>{status}</span>;
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/dashboard').then(res => setStats(res.data.data)).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (loading) return <div className="loading-inline"><div className="spinner"></div></div>;

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Here's what's happening with your projects today.</p>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Projects" value={stats?.totalProjects ?? 0} color="var(--accent)" icon="◧" />
        <StatCard label="Active Tasks" value={stats?.inProgressTasks ?? 0} color="var(--info)" icon="⚡" />
        <StatCard label="Completed" value={stats?.doneTasks ?? 0} color="var(--success)" icon="✓" />
        <StatCard label="Overdue" value={stats?.overdueTasks ?? 0} color="var(--danger)" icon="⚠" />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3>Task Overview</h3>
          </div>
          <div className="task-breakdown">
            {[
              { label: 'Todo', val: stats?.todoTasks ?? 0, cls: 'todo', color: 'var(--todo)' },
              { label: 'In Progress', val: stats?.inProgressTasks ?? 0, cls: 'inprogress', color: 'var(--inprogress)' },
              { label: 'In Review', val: 0, cls: 'inreview', color: 'var(--inreview)' },
              { label: 'Done', val: stats?.doneTasks ?? 0, cls: 'done', color: 'var(--done)' },
            ].map(item => {
              const total = stats?.totalTasks || 1;
              const pct = Math.round((item.val / total) * 100);
              return (
                <div key={item.label} className="breakdown-row">
                  <div className="breakdown-info">
                    <span className={`badge badge-${item.cls}`}>{item.label}</span>
                    <span className="breakdown-count">{item.val}</span>
                  </div>
                  <div className="breakdown-bar">
                    <div className="breakdown-fill" style={{ width: `${pct}%`, background: item.color }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent Tasks</h3>
            <Link to="/my-tasks" className="card-link">View all →</Link>
          </div>
          {stats?.recentTasks?.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="icon">📋</div>
              <p>No tasks assigned yet</p>
            </div>
          ) : (
            <div className="recent-tasks">
              {stats?.recentTasks?.map(task => (
                <div key={task._id} className="recent-task-row">
                  <div className="recent-task-info">
                    <span className="recent-task-title">{task.title}</span>
                    <span className="recent-task-project">{task.project?.name}</span>
                  </div>
                  <div className="recent-task-meta">
                    {statusBadge(task.status)}
                    {task.dueDate && (
                      <span className={`due-date ${task.isOverdue ? 'overdue' : ''}`}>
                        {format(new Date(task.dueDate), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
