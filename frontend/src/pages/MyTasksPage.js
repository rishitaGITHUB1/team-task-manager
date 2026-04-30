import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { format } from 'date-fns';
import './MyTasksPage.css';

const FILTERS = ['All', 'Todo', 'In Progress', 'In Review', 'Done'];
const statusKey = s => s.replace(' ', '').toLowerCase();

const MyTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/tasks/my').then(res => setTasks(res.data.data)).finally(() => setLoading(false));
  }, []);

  const filtered = tasks.filter(t => {
    const matchesFilter = filter === 'All' || t.status === filter;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const priorityClass = { Low: 'low', Medium: 'medium', High: 'high', Critical: 'critical' };

  if (loading) return <div className="loading-inline"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1>My Tasks</h1>
        <p>{tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you</p>
      </div>

      <div className="tasks-controls">
        <input
          className="tasks-search"
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="filter-tabs">
          {FILTERS.map(f => (
            <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f}
              {f !== 'All' && <span className="filter-count">{tasks.filter(t => t.status === f).length}</span>}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">✓</div>
          <h3>{search ? 'No matching tasks' : 'No tasks here'}</h3>
          <p>{search ? 'Try a different search term' : 'Tasks assigned to you will appear here'}</p>
        </div>
      ) : (
        <div className="tasks-table">
          <div className="table-header">
            <span>Task</span>
            <span>Project</span>
            <span>Status</span>
            <span>Priority</span>
            <span>Due Date</span>
          </div>
          {filtered.map(task => (
            <div key={task._id} className="table-row">
              <div className="task-cell">
                <span className="task-cell-title">{task.title}</span>
                {task.description && <span className="task-cell-desc">{task.description}</span>}
              </div>
              <div>
                <Link to={`/projects/${task.project?._id}`} className="project-link">{task.project?.name}</Link>
              </div>
              <div><span className={`badge badge-${statusKey(task.status)}`}>{task.status}</span></div>
              <div><span className={`badge badge-${priorityClass[task.priority]}`}>{task.priority}</span></div>
              <div>
                {task.dueDate ? (
                  <span className={`due-chip ${task.isOverdue ? 'overdue' : ''}`}>
                    {task.isOverdue && '⚠ '}
                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </span>
                ) : <span className="no-due">—</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;
