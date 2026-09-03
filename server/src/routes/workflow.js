const express = require('express');
const { Contact, Prospect, Activity, Milestone } = require('../models');
const makeCrudController = require('../controllers/simpleCrudController');
const { authMiddleware } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();
router.use(authMiddleware);

const resources = [
  ['contacts', Contact, 'contacts'],
  ['prospects', Prospect, 'prospects'],
  ['activities', Activity, 'activities'],
  ['milestones', Milestone, 'projects'],
];

resources.forEach(([path, Model, permissionModule]) => {
  const controller = makeCrudController({ Model, required: path === 'contacts' ? ['name'] : path === 'prospects' ? ['companyId'] : path === 'activities' ? ['type', 'subject', 'ownerId'] : ['projectId', 'name'], searchable: ['status', 'projectId', 'companyId'] });
  router.get(`/${path}`, authorize(`${permissionModule}.view`), controller.getAll);
  router.post(`/${path}`, authorize(`${permissionModule}.create`), controller.create);
  router.get(`/${path}/:id`, authorize(`${permissionModule}.view`), controller.getById);
  router.patch(`/${path}/:id`, authorize(`${permissionModule}.update`), controller.update);
  router.delete(`/${path}/:id`, authorize(`${permissionModule}.delete`), controller.remove);
});

module.exports = router;
