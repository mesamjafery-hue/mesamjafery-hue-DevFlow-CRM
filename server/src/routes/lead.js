const express = require('express');
const leadController = require('../controllers/leadController');
const { authMiddleware } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.use(authMiddleware);

router.get('/', leadController.getAllLeads);
router.post('/', authorize(['create:lead']), leadController.createLead);
router.get('/:id', leadController.getLeadById);
router.patch('/:id', authorize(['update:lead']), leadController.updateLead);
router.delete('/:id', authorize(['delete:lead']), leadController.deleteLead);
router.post('/:id/convert', authorize(['create:deal']), leadController.convertLeadToDeal);

module.exports = router;
