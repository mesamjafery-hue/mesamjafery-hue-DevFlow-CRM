const { Lead, Company, User } = require('../models');
const { sendSuccess, sendError, sendPaginatedSuccess } = require('../utils/response');
const { leadValidation } = require('../validators');
const sequelize = require('../config/database');

/**
 * Get all leads with pagination and filtering
 */
exports.getAllLeads = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, source, ownerId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[sequelize.Op.or] = [
        { name: { [sequelize.Op.iLike]: `%${search}%` } },
        { email: { [sequelize.Op.iLike]: `%${search}%` } },
      ];
    }
    if (status) {
      whereClause.status = status;
    }
    if (source) {
      whereClause.source = source;
    }
    if (ownerId) {
      whereClause.ownerId = ownerId;
    }

    const { count, rows } = await Lead.findAndCountAll({
      where: whereClause,
      include: [
        { model: Company, attributes: ['id', 'name'] },
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

    sendPaginatedSuccess(res, rows, meta, 'Leads retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new lead
 */
exports.createLead = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = leadValidation.create.validate(req.body);
    if (error) {
      return sendError(res, error.message, 400);
    }

    // Check if company exists
    const company = await Company.findByPk(value.companyId);
    if (!company) {
      return sendError(res, 'Company not found', 404);
    }

    // Create lead
    const lead = await Lead.create({
      ...value,
      ownerId: req.user.id,
      status: value.status || 'new',
    });

    // Reload with associations
    await lead.reload({
      include: [
        { model: Company, attributes: ['id', 'name'] },
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
      ],
    });

    sendSuccess(res, lead, 'Lead created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get lead by ID
 */
exports.getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findByPk(id, {
      include: [
        { model: Company, attributes: ['id', 'name', 'industry', 'website'] },
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (!lead) {
      return sendError(res, 'Lead not found', 404);
    }

    sendSuccess(res, lead, 'Lead retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update lead
 */
exports.updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate request body
    const { error, value } = leadValidation.update.validate(req.body);
    if (error) {
      return sendError(res, error.message, 400);
    }

    // Check if lead exists
    const lead = await Lead.findByPk(id);
    if (!lead) {
      return sendError(res, 'Lead not found', 404);
    }

    // Authorization: Only owner, admin, or sales can update
    const allowedRoles = [1, 3]; // Super Admin, Sales
    if (lead.ownerId !== req.user.id && !allowedRoles.includes(req.user.roleId)) {
      return sendError(res, 'Not authorized to update this lead', 403);
    }

    // Update lead
    await lead.update(value);

    // Reload with associations
    await lead.reload({
      include: [
        { model: Company, attributes: ['id', 'name'] },
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
      ],
    });

    sendSuccess(res, lead, 'Lead updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete lead (soft delete)
 */
exports.deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if lead exists
    const lead = await Lead.findByPk(id);
    if (!lead) {
      return sendError(res, 'Lead not found', 404);
    }

    // Authorization: Only owner or admin can delete
    if (lead.ownerId !== req.user.id && req.user.roleId !== 1) {
      return sendError(res, 'Not authorized to delete this lead', 403);
    }

    // Soft delete
    await lead.destroy();

    sendSuccess(res, null, 'Lead deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Convert lead to deal (business process)
 */
exports.convertLeadToDeal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dealTitle, dealValue } = req.body;

    // Validate required fields
    if (!dealTitle || !dealValue) {
      return sendError(res, 'Deal title and value are required', 400);
    }

    // Check if lead exists
    const lead = await Lead.findByPk(id);
    if (!lead) {
      return sendError(res, 'Lead not found', 404);
    }

    // Update lead status
    await lead.update({ status: 'qualified' });

    sendSuccess(res, lead, 'Lead converted to deal successfully');
  } catch (error) {
    next(error);
  }
};
