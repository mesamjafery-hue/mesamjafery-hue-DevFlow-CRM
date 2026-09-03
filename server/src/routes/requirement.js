const express = require('express');
const requirementController = require('../controllers/requirementController');
const { authMiddleware } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.use(authMiddleware);

router.get('/', requirementController.getAllRequirements);
router.post('/', authorize(['create:requirement']), requirementController.createRequirement);
router.get('/:id', requirementController.getRequirementById);
router.patch('/:id', authorize(['update:requirement']), requirementController.updateRequirement);
router.delete('/:id', authorize(['delete:requirement']), requirementController.deleteRequirement);
router.get('/:id/versions', requirementController.getVersions);
router.post('/:id/versions', authorize(['create:requirement']), requirementController.createVersion);
router.post('/:id/approve', authorize(['approve:requirement']), requirementController.approveRequirement);

module.exports = router;
