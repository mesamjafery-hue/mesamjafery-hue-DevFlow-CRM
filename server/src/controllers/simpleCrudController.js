const { sendSuccess, sendError, sendPaginatedSuccess } = require('../utils/response');

const makeCrudController = ({ Model, required = [], searchable = [] }) => ({
  getAll: async (req, res, next) => {
    try {
      const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100);
      const where = {};
      searchable.forEach((field) => { if (req.query[field]) where[field] = req.query[field]; });
      const { count, rows } = await Model.findAndCountAll({ where, limit, offset: (page - 1) * limit, order: [['createdAt', 'DESC']] });
      return sendPaginatedSuccess(res, rows, { total: count, page, limit, totalPages: Math.ceil(count / limit) }, `${Model.name}s retrieved successfully`);
    } catch (error) { return next(error); }
  },
  getById: async (req, res, next) => {
    try { const record = await Model.findByPk(req.params.id); if (!record) return sendError(res, `${Model.name} not found`, 404); return sendSuccess(res, record); } catch (error) { return next(error); }
  },
  create: async (req, res, next) => {
    try { const missing = required.find((field) => req.body[field] === undefined || req.body[field] === ''); if (missing) return sendError(res, `${missing} is required`, 400); const record = await Model.create(req.body); return sendSuccess(res, record, `${Model.name} created successfully`, 201); } catch (error) { return next(error); }
  },
  update: async (req, res, next) => {
    try { const record = await Model.findByPk(req.params.id); if (!record) return sendError(res, `${Model.name} not found`, 404); await record.update(req.body); return sendSuccess(res, record, `${Model.name} updated successfully`); } catch (error) { return next(error); }
  },
  remove: async (req, res, next) => {
    try { const record = await Model.findByPk(req.params.id); if (!record) return sendError(res, `${Model.name} not found`, 404); await record.destroy(); return sendSuccess(res, null, `${Model.name} deleted successfully`); } catch (error) { return next(error); }
  },
});

module.exports = makeCrudController;
