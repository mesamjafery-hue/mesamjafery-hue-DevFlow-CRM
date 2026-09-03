const { Project, Client, User } = require('../models');
const { sendSuccess, sendError, sendPaginatedSuccess } = require('../utils/response');
const { projectValidation } = require('../validators');
const sequelize = require('../config/database');

/**
 * Get all projects with pagination and filtering
 */
exports.getAllProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, clientId, pmId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[sequelize.Op.or] = [
        { name: { [sequelize.Op.iLike]: `%${search}%` } },
        { code: { [sequelize.Op.iLike]: `%${search}%` } },
      ];
    }
    if (status) {
      whereClause.status = status;
    }
    if (clientId) {
      whereClause.clientId = clientId;
    }
    if (pmId) {
      whereClause.pmId = pmId;
    }

    const { count, rows } = await Project.findAndCountAll({
      where: whereClause,
      include: [
        { model: Client, attributes: ['id'] },
        { model: User, as: 'pm', attributes: ['id', 'name', 'email'] },
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

    sendPaginatedSuccess(res, rows, meta, 'Projects retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new project
 */
exports.createProject = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = projectValidation.create.validate(req.body);
    if (error) {
      return sendError(res, error.message, 400);
    }

    // Check if client exists
    const client = await Client.findByPk(value.clientId);
    if (!client) {
      return sendError(res, 'Client not found', 404);
    }

    // Check if PM user exists
    const pm = await User.findByPk(value.pmId);
    if (!pm) {
      return sendError(res, 'Project Manager not found', 404);
    }

    // Check if project code already exists
    const existingProject = await Project.findOne({ where: { code: value.code } });
    if (existingProject) {
      return sendError(res, 'Project code already exists', 400);
    }

    // Create project
    const project = await Project.create({
      ...value,
      status: value.status || 'planning',
    });

    // Reload with associations
    await project.reload({
      include: [
        { model: Client, attributes: ['id'] },
        { model: User, as: 'pm', attributes: ['id', 'name', 'email'] },
      ],
    });

    sendSuccess(res, project, 'Project created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get project by ID
 */
exports.getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id, {
      include: [
        { model: Client, attributes: ['id'] },
        { model: User, as: 'pm', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    sendSuccess(res, project, 'Project retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update project
 */
exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate request body
    const { error, value } = projectValidation.update.validate(req.body);
    if (error) {
      return sendError(res, error.message, 400);
    }

    // Check if project exists
    const project = await Project.findByPk(id);
    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    // Authorization: Only PM, admin, or project owner can update
    const allowedRoles = [1, 2]; // Super Admin, Admin
    if (project.pmId !== req.user.id && !allowedRoles.includes(req.user.roleId)) {
      return sendError(res, 'Not authorized to update this project', 403);
    }

    // If project code is being changed, check for duplicates
    if (value.code && value.code !== project.code) {
      const existingProject = await Project.findOne({ where: { code: value.code } });
      if (existingProject) {
        return sendError(res, 'Project code already exists', 400);
      }
    }

    // Update project
    await project.update(value);

    // Reload with associations
    await project.reload({
      include: [
        { model: Client, attributes: ['id'] },
        { model: User, as: 'pm', attributes: ['id', 'name', 'email'] },
      ],
    });

    sendSuccess(res, project, 'Project updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete project (soft delete)
 */
exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if project exists
    const project = await Project.findByPk(id);
    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    // Authorization: Only admin can delete
    if (req.user.roleId !== 1) {
      return sendError(res, 'Not authorized to delete this project', 403);
    }

    // Soft delete
    await project.destroy();

    sendSuccess(res, null, 'Project deleted successfully');
  } catch (error) {
    next(error);
  }
};
