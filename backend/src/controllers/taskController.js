const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private (member)
const getTasksByProject = async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.query;
    const filter = { project: req.params.projectId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort('-createdAt');

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all tasks assigned to current user
// @route   GET /api/tasks/my
// @access  Private
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'name')
      .populate('createdBy', 'name email avatar')
      .sort('-createdAt');

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name members');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Check project membership
    const project = await Project.findById(task.project._id);
    const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private (member)
const createTask = async (req, res) => {
  try {
    const { project: projectId } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Not a project member' });

    const task = await Task.create({ ...req.body, createdBy: req.user._id });
    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (member)
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const project = await Project.findById(task.project);
    const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Access denied' });

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin or task creator)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const project = await Project.findById(task.project);
    const member = project.members.find(m => m.user.toString() === req.user._id.toString());
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAdmin = member && member.role === 'Admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only task creator or project admin can delete' });
    }

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard stats for current user
// @route   GET /api/tasks/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const myTasks = await Task.find({ assignedTo: req.user._id }).populate('project', 'name');
    const allProjects = await Project.find({ 'members.user': req.user._id });

    const stats = {
      totalProjects: allProjects.length,
      totalTasks: myTasks.length,
      todoTasks: myTasks.filter(t => t.status === 'Todo').length,
      inProgressTasks: myTasks.filter(t => t.status === 'In Progress').length,
      doneTasks: myTasks.filter(t => t.status === 'Done').length,
      overdueTasks: myTasks.filter(t => t.isOverdue).length,
      recentTasks: myTasks.slice(0, 5)
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTasksByProject, getMyTasks, getTask, createTask, updateTask, deleteTask, getDashboardStats };
