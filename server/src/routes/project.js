const express = require('express');
const projectController = require('../controllers/projectController');
const { authMiddleware } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.use(authMiddleware);

router.get('/', projectController.getAllProjects);
router.post('/', authorize(['create:project']), projectController.createProject);
router.get('/:id', projectController.getProjectById);
router.patch('/:id', authorize(['update:project']), projectController.updateProject);
router.delete('/:id', authorize(['delete:project']), projectController.deleteProject);

module.exports = router;
