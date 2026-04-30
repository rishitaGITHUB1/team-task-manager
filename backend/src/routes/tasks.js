const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTasksByProject, getMyTasks, getTask,
  createTask, updateTask, deleteTask, getDashboardStats
} = require('../controllers/taskController');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/my', getMyTasks);
router.get('/project/:projectId', getTasksByProject);
router.route('/').post(createTask);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);

module.exports = router;
