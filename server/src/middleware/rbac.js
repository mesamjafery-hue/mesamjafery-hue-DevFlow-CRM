const { sendError } = require('../utils/response');
const { Role, RolePermission } = require('../models');
const { rolePermissions, legacyToPermission } = require('../config/permissions');

// Permission-based authorization middleware
const authorize = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return sendError(res, 'User not authenticated', 401);
      }

      const role = await Role.findByPk(req.user.roleId);
      const stored = role ? await RolePermission.findAll({ where: { roleId: role.id }, attributes: ['permission'] }) : [];
      const permissions = stored.length ? stored.map((item) => item.permission) : (rolePermissions[role?.name] || []);
      const required = (Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions])
        .map((permission) => legacyToPermission[permission] || permission);
      if (role?.name !== 'Super Admin' && role?.name !== 'Admin' && !required.some((permission) => permissions.includes(permission))) {
        return sendError(res, 'Insufficient permissions', 403);
      }
      req.user.permissions = permissions;
      next();
    } catch (error) {
      sendError(res, 'Authorization check failed', 403);
    }
  };
};

// Role-based authorization middleware
const authorizeRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return sendError(res, 'User not authenticated', 401);
      }

      // req.user.roleId should be set from auth middleware
      // In production, validate against actual roles
      if (!allowedRoles.includes(req.user.roleId)) {
        return sendError(res, 'Insufficient permissions', 403);
      }

      next();
    } catch (error) {
      sendError(res, 'Authorization failed', 403);
    }
  };
};

module.exports = {
  authorize,
  authorizeRole,
};
