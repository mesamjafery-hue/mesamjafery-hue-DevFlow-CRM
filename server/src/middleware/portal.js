const { Client } = require('../models');
const { sendError } = require('../utils/response');

const portalOnly = async (req, res, next) => {
  try {
    const client = await Client.findOne({ where: { portalUserId: req.user.id, portalAccess: true } });
    if (!client) return sendError(res, 'Client portal access is not enabled', 403);
    req.portalClient = client;
    return next();
  } catch (error) { return next(error); }
};

module.exports = portalOnly;
