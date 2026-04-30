import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { format } from 'date-fns';
import './ProjectDetailPage.css';

const STATUSES = ['Todo', 'In Progress', 'In Review', 'Done'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const statusKey = s => s.replace(' ', '').toLowerCase();

const TaskCard = ({ task, onEdit, onDelete, myRole }) => {
  const priorityClass = { Low: 'low', Medium: 'medium', High: 'high', Critical: 'critical' };
  return (
    <div className="task-card">
      <div className="task-card-top">
        <span className={`badge badge-${priorityClass[task.priority]}`}>{task.priority}</span>
        {task.isOverdue && <span className="badge badge-overdue">Overdue</span>}
        <div className="task-actions">
          <button className="btn-icon" onClick={() => onEdit(task)} title="Edit">✎</button>
          {(myRole === 'Admin') && <button className="btn-icon" onClick={() => onDelete(task._id)} title="Delete">✕</button>}
        </div>
      </div>
      <p className="task-title">{task.title}</p>
      {task.description && <p className="task-desc">{task.description}</p>}
      <div className="task-footer">
        {task.assignedTo ? (
          <div className="avatar" title={task.assignedTo.name}>{task.assignedTo.name?.slice(0, 2).toUpperCase()}</div>
        ) : <span className="unassigned">Unassigned</span>}
        {task.dueDate && <span className={`due-label ${task.isOverdue ? 'overdue' : ''}`}>{format(new Date(task.dueDate), 'MMM d')}</span>}
      </div>
    </div>
  );
};

const TaskModal = ({ task, projectId, members, onClose, onSave }) => {
  const [form, setForm] = useState(task ? {
    title: task.title, description: task.description || '', status: task.status,
    priority: task.priority, dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    assignedTo: task.assignedTo?._id || ''
  } : { title: '', description: '', status: 'Todo', priority: 'Medium', dueDate: '', assignedTo: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, project: projectId };
      if (!payload.assignedTo) delete payload.assignedTo;
      let res;
      if (task) res = await api.put(`/tasks/${task._id}`, payload);
      else res = await api.post('/tasks', payload);
      onSave(res.data.data, !!task);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{task ? 'Edit Task' : 'New Task'}</h3>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input placeholder="What needs to be done?" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows={3} placeholder="More details..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Assign To</label>
              <select value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})}>
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.user._id} value={m.user._id}>{m.user.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : task ? 'Update' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddMemberModal = ({ projectId, onClose, onAdd }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post(`/projects/${projectId}/members`, { email, role });
      onAdd(res.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{maxWidth: 400}}>
        <div className="modal-header">
          <h3>Add Member</h3>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="teammate@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option>Member</option>
              <option>Admin</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Member'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState(null); // null | 'new' | task object
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [activeTab, setActiveTab] = useState('board');

  const myMembership = project?.members?.find(m => m.user._id === user?._id);
  const myRole = myMembership?.role;

  const load = useCallback(async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`)
      ]);
      setProject(projRes.data.data);
      setTasks(tasksRes.data.data);
    } catch { navigate('/projects'); }
    finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  const handleDeleteTask = async taskId => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    setTasks(tasks.filter(t => t._id !== taskId));
  };

  const handleSaveTask = (savedTask, isEdit) => {
    if (isEdit) setTasks(tasks.map(t => t._id === savedTask._id ? savedTask : t));
    else setTasks([savedTask, ...tasks]);
  };

  const handleRemoveMember = async userId => {
    if (!window.confirm('Remove this member?')) return;
    await api.delete(`/projects/${id}/members/${userId}`);
    setProject({ ...project, members: project.members.filter(m => m.user._id !== userId) });
  };

  if (loading) return <div className="loading-inline"><div className="spinner"></div></div>;
  if (!project) return null;

  const tasksByStatus = STATUSES.reduce((acc, s) => ({ ...acc, [s]: tasks.filter(t => t.status === s) }), {});

  return (
    <div className="project-detail">
      <div className="project-detail-header">
        <button className="btn-ghost back-btn" onClick={() => navigate('/projects')}>← Projects</button>
        <div className="page-header-row" style={{marginTop: 8}}>
          <div>
            <h1>{project.name}</h1>
            {project.description && <p>{project.description}</p>}
          </div>
          {myRole === 'Admin' && (
            <button className="btn-secondary btn-sm" onClick={() => setAddMemberModal(true)}>+ Add Member</button>
          )}
        </div>
      </div>

      <div className="project-tabs">
        {['board', 'members'].map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
        <button className="btn-primary btn-sm" style={{marginLeft: 'auto'}} onClick={() => setTaskModal('new')}>+ Add Task</button>
      </div>

      {activeTab === 'board' && (
        <div className="kanban-board">
          {STATUSES.map(status => (
            <div key={status} className="kanban-column">
              <div className="column-header">
                <span className={`badge badge-${statusKey(status)}`}>{status}</span>
                <span className="column-count">{tasksByStatus[status].length}</span>
              </div>
              <div className="column-tasks">
                {tasksByStatus[status].length === 0 ? (
                  <div className="column-empty">No tasks here</div>
                ) : tasksByStatus[status].map(task => (
                  <TaskCard key={task._id} task={task} myRole={myRole}
                    onEdit={t => setTaskModal(t)} onDelete={handleDeleteTask} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="members-list">
          {project.members.map(m => (
            <div key={m.user._id} className="member-row card">
              <div className="member-info">
                <div className="avatar avatar-lg">{m.user.name?.slice(0, 2).toUpperCase()}</div>
                <div>
                  <div className="member-name">{m.user.name}</div>
                  <div className="member-email">{m.user.email}</div>
                </div>
              </div>
              <div className="member-actions">
                <span className={`badge badge-${m.role.toLowerCase()}`}>{m.role}</span>
                {myRole === 'Admin' && m.user._id !== project.owner._id && m.user._id !== user._id && (
                  <button className="btn-danger btn-sm" onClick={() => handleRemoveMember(m.user._id)}>Remove</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {(taskModal === 'new' || (taskModal && typeof taskModal === 'object')) && (
        <TaskModal
          task={taskModal === 'new' ? null : taskModal}
          projectId={id}
          members={project.members}
          onClose={() => setTaskModal(null)}
          onSave={handleSaveTask}
        />
      )}

      {addMemberModal && (
        <AddMemberModal
          projectId={id}
          onClose={() => setAddMemberModal(false)}
          onAdd={updatedProject => setProject(updatedProject)}
        />
      )}
    </div>
  );
};

export default ProjectDetailPage;
