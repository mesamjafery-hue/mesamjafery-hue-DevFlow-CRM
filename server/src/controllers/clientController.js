const { Client, Company, User } = require('../models');
const { sendSuccess, sendError, sendPaginatedSuccess } = require('../utils/response');

exports.getAllClients = async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100);
    const { count, rows } = await Client.findAndCountAll({
      include: [
        { model: Company, attributes: ['id', 'name'] },
        { model: User, as: 'accountManager', attributes: ['id', 'name', 'email'] },
      ],
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    });
    sendPaginatedSuccess(res, rows, { total: count, page, limit, totalPages: Math.ceil(count / limit) }, 'Clients retrieved successfully');
  } catch (error) { next(error); }
};

exports.getClientById = async (req, res, next) => {
  try {
    const client = await Client.findByPk(req.params.id, { include: [Company, { model: User, as: 'accountManager', attributes: ['id', 'name', 'email'] }] });
    if (!client) return sendError(res, 'Client not found', 404);
    sendSuccess(res, client, 'Client retrieved successfully');
  } catch (error) { next(error); }
};

exports.createClient = async (req, res, next) => {
  try {
    const { companyId, accountManagerId, billingInfo, status, portalAccess } = req.body;
    if (!companyId) return sendError(res, 'companyId is required', 400);
    const company = await Company.findByPk(companyId);
    if (!company) return sendError(res, 'Company not found', 404);
    const client = await Client.create({ companyId, accountManagerId: accountManagerId || null, billingInfo, status, portalAccess });
    sendSuccess(res, client, 'Client created successfully', 201);
  } catch (error) { next(error); }
};

exports.updateClient = async (req, res, next) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return sendError(res, 'Client not found', 404);
    if (req.body.companyId) {
      const company = await Company.findByPk(req.body.companyId);
      if (!company) return sendError(res, 'Company not found', 404);
    }
    await client.update(req.body);
    sendSuccess(res, client, 'Client updated successfully');
  } catch (error) { next(error); }
};

exports.deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return sendError(res, 'Client not found', 404);
    await client.destroy();
    sendSuccess(res, null, 'Client deleted successfully');
  } catch (error) { next(error); }
};
