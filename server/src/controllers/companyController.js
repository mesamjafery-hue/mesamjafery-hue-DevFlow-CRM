const { Company, User } = require('../models');
const { sendSuccess, sendError, sendPaginatedSuccess } = require('../utils/response');
const { companyValidation } = require('../validators');
const { Op } = require('sequelize');

/**
 * Get all companies with pagination and filtering
 */
exports.getAllCompanies = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, industry } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (industry) {
      whereClause.industry = industry;
    }

    const { count, rows } = await Company.findAndCountAll({
      where: whereClause,
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
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

    sendPaginatedSuccess(res, rows, meta, 'Companies retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new company
 */
exports.createCompany = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = companyValidation.create.validate(req.body);
    if (error) {
      return sendError(res, error.message, 400);
    }

    // Create company
    const company = await Company.create({
      ...value,
      ownerId: req.user.id,
    });

    sendSuccess(res, company, 'Company created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get company by ID
 */
exports.getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const company = await Company.findByPk(id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (!company) {
      return sendError(res, 'Company not found', 404);
    }

    sendSuccess(res, company, 'Company retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update company
 */
exports.updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate request body
    const { error, value } = companyValidation.update.validate(req.body);
    if (error) {
      return sendError(res, error.message, 400);
    }

    // Check if company exists
    const company = await Company.findByPk(id);
    if (!company) {
      return sendError(res, 'Company not found', 404);
    }

    // Authorization: Only owner or admin can update
    if (company.ownerId !== req.user.id && req.user.roleId !== 1) {
      return sendError(res, 'Not authorized to update this company', 403);
    }

    // Update company
    await company.update(value);

    sendSuccess(res, company, 'Company updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete company (soft delete)
 */
exports.deleteCompany = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if company exists
    const company = await Company.findByPk(id);
    if (!company) {
      return sendError(res, 'Company not found', 404);
    }

    // Authorization: Only owner or admin can delete
    if (company.ownerId !== req.user.id && req.user.roleId !== 1) {
      return sendError(res, 'Not authorized to delete this company', 403);
    }

    // Soft delete
    await company.destroy();

    sendSuccess(res, null, 'Company deleted successfully');
  } catch (error) {
    next(error);
  }
};
