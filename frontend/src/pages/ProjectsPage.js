import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { format } from 'date-fns';
import './ProjectsPage.css';

const statusColors = { Active: 'inprogress', Completed: 'done', 'On Hold': 'inreview', Archived: 'todo' };

const CreateProjectModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({ name: '', description: '', dueDate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/projects', form);
      onCreate(res.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>New Project</h3>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Name *</label>
            <input placeholder="e.g. Q3 Product Launch" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows={3} placeholder="What is this project about?" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Project'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-inline"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Projects</h1>
            <p>{projects.length} project{projects.length !== 1 ? 's' : ''} you're part of</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="icon">◧</div>
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
          <button className="btn-primary btn-sm" style={{marginTop: 16}} onClick={() => setShowModal(true)}>Create Project</button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => {
            const memberCount = project.members?.length || 0;
            const initials = project.name.slice(0, 2).toUpperCase();
            return (
              <div key={project._id} className="project-card" onClick={() => navigate(`/projects/${project._id}`)}>
                <div className="project-card-header">
                  <div className="project-avatar">{initials}</div>
                  <span className={`badge badge-${statusColors[project.status]}`}>{project.status}</span>
                </div>
                <h3 className="project-name">{project.name}</h3>
                <p className="project-desc">{project.description || 'No description'}</p>
                <div className="project-footer">
                  <div className="project-members">
                    {project.members?.slice(0, 4).map(m => (
                      <div key={m.user?._id} className="avatar avatar-sm" title={m.user?.name}>
                        {m.user?.name?.slice(0, 2).toUpperCase()}
                      </div>
                    ))}
                    {memberCount > 4 && <span className="member-overflow">+{memberCount - 4}</span>}
                  </div>
                  {project.dueDate && (
                    <span className="project-due">Due {format(new Date(project.dueDate), 'MMM d')}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreate={p => setProjects([p, ...projects])}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
