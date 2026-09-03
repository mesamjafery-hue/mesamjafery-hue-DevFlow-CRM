const { Deal, Company, Lead, User } = require('../models');
const { sendSuccess, sendError, sendPaginatedSuccess } = require('../utils/response');
const { dealValidation } = require('../validators');
const sequelize = require('../config/database');

/**
 * Get all deals with pagination and filtering
 */
exports.getAllDeals = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, stage, ownerId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[sequelize.Op.or] = [
        { title: { [sequelize.Op.iLike]: `%${search}%` } },
      ];
    }
    if (stage) {
      whereClause.stage = stage;
    }
    if (ownerId) {
      whereClause.ownerId = ownerId;
    }

    const { count, rows } = await Deal.findAndCountAll({
      where: whereClause,
      include: [
        { model: Company, attributes: ['id', 'name'] },
        { model: Lead, attributes: ['id', 'name', 'email'] },
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    const meta = {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    };

    sendPaginatedSuccess(res, rows, meta, 'Deals retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new deal
 */
exports.createDeal = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = dealValidation.create.validate(req.body);
    if (error) {
      return sendError(res, error.message, 400);
    }

    // Check if company exists
    const company = await Company.findByPk(value.companyId);
    if (!company) {
      return sendError(res, 'Company not found', 404);
    }

    // Create deal
    const deal = await Deal.create({
      ...value,
      ownerId: req.user.id,
      stage: value.stage || 'new_lead',
    });

    // Reload with associations
    await deal.reload({
      include: [
        { model: Company, attributes: ['id', 'name'] },
        { model: Lead, attributes: ['id', 'name', 'email'] },
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
      ],
    });

    sendSuccess(res, deal, 'Deal created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get deal by ID
 */
exports.getDealById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deal = await Deal.findByPk(id, {
      include: [
        { model: Company, attributes: ['id', 'name', 'industry'] },
        { model: Lead, attributes: ['id', 'name', 'email', 'phone'] },
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (!deal) {
      return sendError(res, 'Deal not found', 404);
    }

    sendSuccess(res, deal, 'Deal retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update deal
 */
exports.updateDeal = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate request body
    const { error, value } = dealValidation.update.validate(req.body);
    if (error) {
      return sendError(res, error.message, 400);
    }

    // Check if deal exists
    const deal = await Deal.findByPk(id);
    if (!deal) {
      return sendError(res, 'Deal not found', 404);
    }

    // Authorization: Only owner, admin, or sales can update
    const allowedRoles = [1, 3]; // Super Admin, Sales
    if (deal.ownerId !== req.user.id && !allowedRoles.includes(req.user.roleId)) {
      return sendError(res, 'Not authorized to update this deal', 403);
    }

    // Update deal
    await deal.update(value);

    // Reload with associations
    await deal.reload({
      include: [
        { model: Company, attributes: ['id', 'name'] },
        { model: Lead, attributes: ['id', 'name', 'email'] },
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
      ],
    });

    sendSuccess(res, deal, 'Deal updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete deal (soft delete)
 */
exports.deleteDeal = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if deal exists
    const deal = await Deal.findByPk(id);
    if (!deal) {
      return sendError(res, 'Deal not found', 404);
    }

    // Authorization: Only owner or admin can delete
    if (deal.ownerId !== req.user.id && req.user.roleId !== 1) {
      return sendError(res, 'Not authorized to delete this deal', 403);
    }

    // Soft delete
    await deal.destroy();

    sendSuccess(res, null, 'Deal deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get deals grouped by pipeline stage (for pipeline view)
 */
exports.getPipeline = async (req, res, next) => {
  try {
    const stages = ['new_lead', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost'];

    const pipeline = await Promise.all(
      stages.map(async (stage) => {
        const deals = await Deal.findAll({
          where: { stage },
          include: [
            { model: Company, attributes: ['id', 'name'] },
            { model: User, as: 'owner', attributes: ['id', 'name'] },
          ],
          order: [['value', 'DESC']],
        });

        const total = deals.reduce((sum, deal) => sum + deal.value, 0);

        return {
          stage,
          count: deals.length,
          total,
          deals,
        };
      })
    );

    sendSuccess(res, pipeline, 'Pipeline retrieved successfully');
  } catch (error) {
    next(error);
  }
};
