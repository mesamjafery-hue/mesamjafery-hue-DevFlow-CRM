const express = require('express');
const controller = require('../controllers/clientController');
const { authMiddleware } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();
router.use(authMiddleware);
router.get('/', authorize('clients.view'), controller.getAllClients);
router.post('/', authorize('clients.create'), controller.createClient);
router.get('/:id', authorize('clients.view'), controller.getClientById);
router.patch('/:id', authorize('clients.update'), controller.updateClient);
router.delete('/:id', authorize('clients.delete'), controller.deleteClient);

module.exports = router;
