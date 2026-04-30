const Project = require('../models/Project');

// Check if user is a member of the project
const projectMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId || req.body.project);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const member = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member) {
      return res.status(403).json({ success: false, message: 'Access denied: not a project member' });
    }

    req.projectRole = member.role;
    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check if user is Admin of the project
const projectAdmin = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId || req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const member = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member || member.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Admin role required' });
    }

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { projectMember, projectAdmin };
