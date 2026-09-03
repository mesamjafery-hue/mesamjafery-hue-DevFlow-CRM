const express = require('express');
const taskController = require('../controllers/taskController');
const { authMiddleware } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.use(authMiddleware);

router.get('/', taskController.getAllTasks);
router.post('/', authorize(['create:task']), taskController.createTask);
router.get('/:id', taskController.getTaskById);
router.patch('/:id', authorize(['update:task']), taskController.updateTask);
router.delete('/:id', authorize(['delete:task']), taskController.deleteTask);

module.exports = router;
