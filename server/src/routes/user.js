const express = require('express');
const { sendSuccess, sendError } = require('../utils/response');
const { authMiddleware } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { User, Role } = require('../models');

const router = express.Router();

// Placeholder routes
router.get('/', authMiddleware, authorize('users.view'), async (req, res, next) => {
  try {
    const users = await User.findAll({ include: [{ model: Role, attributes: ['id', 'name'] }], attributes: { exclude: ['passwordHash'] }, order: [['createdAt', 'DESC']] });
    sendSuccess(res, users, 'Users list');
  } catch (error) { next(error); }
});

router.post('/', authMiddleware, authorize('users.create'), async (req, res, next) => {
  try {
    const { name, email, password, passwordHash, roleId } = req.body;
    if (!name || !email || !(password || passwordHash) || !roleId) return sendError(res, 'name, email, password, and roleId are required', 400);
    const user = await User.create({ name, email, passwordHash: password || passwordHash, roleId, status: 'active', emailVerified: true });
    const result = user.toJSON(); delete result.passwordHash;
    sendSuccess(res, result, 'User created', 201);
  } catch (error) { next(error); }
});

router.patch('/:id', authMiddleware, authorize('users.update'), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return sendError(res, 'User not found', 404);
    const { name, email, roleId, status, password, passwordHash } = req.body;
    await user.update({ name, email, roleId, status, ...(password || passwordHash ? { passwordHash: password || passwordHash } : {}) });
    const result = user.toJSON(); delete result.passwordHash;
    sendSuccess(res, result, 'User updated');
  } catch (error) { next(error); }
});

router.delete('/:id', authMiddleware, authorize('users.delete'), async (req, res, next) => {
  try { const user = await User.findByPk(req.params.id); if (!user) return sendError(res, 'User not found', 404); await user.destroy(); sendSuccess(res, null, 'User deleted'); } catch (error) { next(error); }
});

module.exports = router;
