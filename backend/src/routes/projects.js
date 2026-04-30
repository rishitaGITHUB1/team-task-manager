const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { projectAdmin } = require('../middleware/role');
const {
  getProjects, getProject, createProject, updateProject,
  deleteProject, addMember, removeMember, getProjectStats
} = require('../controllers/projectController');

router.use(protect);

router.route('/').get(getProjects).post(createProject);
router.route('/:id').get(getProject).put(projectAdmin, updateProject).delete(deleteProject);
router.post('/:id/members', projectAdmin, addMember);
router.delete('/:id/members/:userId', projectAdmin, removeMember);
router.get('/:projectId/stats', getProjectStats);

module.exports = router;
