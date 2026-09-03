const express = require('express');
const dealController = require('../controllers/dealController');
const { authMiddleware } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.use(authMiddleware);

router.get('/pipeline', dealController.getPipeline);
router.get('/', dealController.getAllDeals);
router.post('/', authorize(['create:deal']), dealController.createDeal);
router.get('/:id', dealController.getDealById);
router.patch('/:id', authorize(['update:deal']), dealController.updateDeal);
router.delete('/:id', authorize(['delete:deal']), dealController.deleteDeal);

module.exports = router;
