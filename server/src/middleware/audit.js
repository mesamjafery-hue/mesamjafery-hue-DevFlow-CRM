const { AuditLog } = require('../models');

const auditMiddleware = (req, res, next) => {
  res.on('finish', () => {
    if (!req.user || ['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return;
    const entityId = Number.parseInt(req.params.id, 10) || 0;
    AuditLog.create({ userId: req.user.id, action: `${req.method} ${req.baseUrl}${req.path}`, entityType: req.baseUrl.split('/').filter(Boolean).pop() || 'system', entityId, metadata: { statusCode: res.statusCode, bodyKeys: Object.keys(req.body || {}) } }).catch((error) => console.error('Audit log failed:', error.message));
  });
  next();
};

module.exports = auditMiddleware;
