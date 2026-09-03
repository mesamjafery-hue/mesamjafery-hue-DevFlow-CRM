const { Requirement, RequirementVersion, Project, User } = require('../models');
const { sendSuccess, sendError, sendPaginatedSuccess } = require('../utils/response');
const { requirementValidation } = require('../validators');
const sequelize = require('../config/database');

/**
 * Get all requirements with pagination and filtering
 */
exports.getAllRequirements = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, priority, projectId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[sequelize.Op.or] = [
        { title: { [sequelize.Op.iLike]: `%${search}%` } },
        { code: { [sequelize.Op.iLike]: `%${search}%` } },
      ];
    }
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (projectId) whereClause.projectId = projectId;

    const { count, rows } = await Requirement.findAndCountAll({
      where: whereClause,
      include: [
        { model: Project, attributes: ['id', 'code', 'name'] },
        { model: User, as: 'submitter', attributes: ['id', 'name', 'email'] },
        { model: RequirementVersion, limit: 1, order: [['versionNumber', 'DESC']] },
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

    sendPaginatedSuccess(res, rows, meta, 'Requirements retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new requirement
 */
exports.createRequirement = async (req, res, next) => {
  try {
    const { error, value } = requirementValidation.create.validate(req.body);
    if (error) {
      return sendError(res, error.message, 400);
    }

    // Check if project exists
    const project = await Project.findByPk(value.projectId);
    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    // Generate requirement code (REQ-PROJECTCODE-SEQUENCE)
    const requirementCount = await Requirement.count({ where: { projectId: value.projectId } });
    const code = `REQ-${project.code}-${String(requirementCount + 1).padStart(3, '0')}`;

    // Create requirement
    const requirement = await Requirement.create({
      ...value,
      code,
      submittedBy: req.user.id,
      currentVersion: 1,
      status: value.status || 'draft',
    });

    // Create initial version
    await RequirementVersion.create({
      requirementId: requirement.id,
      versionNumber: 1,
      title: value.title,
      body: value.description,
      createdBy: req.user.id,
      changeNotes: 'Initial version',
    });

    // Reload with associations
    await requirement.reload({
      include: [
        { model: Project, attributes: ['id', 'code', 'name'] },
        { model: User, as: 'submitter', attributes: ['id', 'name', 'email'] },
        { model: RequirementVersion },
      ],
    });

    sendSuccess(res, requirement, 'Requirement created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get requirement by ID with all versions
 */
exports.getRequirementById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const requirement = await Requirement.findByPk(id, {
      include: [
        { model: Project, attributes: ['id', 'code', 'name'] },
        { model: User, as: 'submitter', attributes: ['id', 'name', 'email'] },
        { model: RequirementVersion, order: [['versionNumber', 'DESC']] },
      ],
    });

    if (!requirement) {
      return sendError(res, 'Requirement not found', 404);
    }

    sendSuccess(res, requirement, 'Requirement retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update requirement (creates new version)
 */
exports.updateRequirement = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error, value } = requirementValidation.update.validate(req.body);
    if (error) {
      return sendError(res, error.message, 400);
    }

    const requirement = await Requirement.findByPk(id);
    if (!requirement) {
      return sendError(res, 'Requirement not found', 404);
    }

    // Authorization: Only submitter or admin can update
    if (requirement.submittedBy !== req.user.id && req.user.roleId !== 1) {
      return sendError(res, 'Not authorized to update this requirement', 403);
    }

    // Update requirement
    await requirement.update(value);

    // Reload with associations
    await requirement.reload({
      include: [
        { model: Project, attributes: ['id', 'code', 'name'] },
        { model: User, as: 'submitter', attributes: ['id', 'name', 'email'] },
        { model: RequirementVersion, order: [['versionNumber', 'DESC']] },
      ],
    });

    sendSuccess(res, requirement, 'Requirement updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete requirement (soft delete)
 */
exports.deleteRequirement = async (req, res, next) => {
  try {
    const { id } = req.params;

    const requirement = await Requirement.findByPk(id);
    if (!requirement) {
      return sendError(res, 'Requirement not found', 404);
    }

    // Authorization: Only admin can delete
    if (req.user.roleId !== 1) {
      return sendError(res, 'Not authorized to delete this requirement', 403);
    }

    await requirement.destroy();

    sendSuccess(res, null, 'Requirement deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create new version of requirement (change tracking)
 */
exports.createVersion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error, value } = requirementValidation.version.validate(req.body);
    if (error) {
      return sendError(res, error.message, 400);
    }

    const requirement = await Requirement.findByPk(id);
    if (!requirement) {
      return sendError(res, 'Requirement not found', 404);
    }

    // Get next version number
    const lastVersion = await RequirementVersion.findOne({
      where: { requirementId: id },
      order: [['versionNumber', 'DESC']],
    });

    const nextVersion = (lastVersion?.versionNumber || 0) + 1;

    // Create new version
    const version = await RequirementVersion.create({
      requirementId: id,
      versionNumber: nextVersion,
      title: value.title,
      body: value.body,
      createdBy: req.user.id,
      changeNotes: value.changeNotes || '',
    });

    // Update requirement currentVersion
    await requirement.update({
      currentVersion: nextVersion,
      status: 'clarification', // Change status when version is updated
    });

    sendSuccess(res, version, 'Version created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get requirement versions
 */
exports.getVersions = async (req, res, next) => {
  try {
    const { id } = req.params;

    const requirement = await Requirement.findByPk(id);
    if (!requirement) {
      return sendError(res, 'Requirement not found', 404);
    }

    const versions = await RequirementVersion.findAll({
      where: { requirementId: id },
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'email'] }],
      order: [['versionNumber', 'DESC']],
    });

    sendSuccess(res, versions, 'Requirement versions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Approve requirement (workflow)
 */
exports.approveRequirement = async (req, res, next) => {
  try {
    const { id } = req.params;

    const requirement = await Requirement.findByPk(id);
    if (!requirement) {
      return sendError(res, 'Requirement not found', 404);
    }

    // Authorization: Only project PM or admin can approve
    const project = await requirement.getProject();
    const isAuthorized = project.pmId === req.user.id || [1, 2].includes(req.user.roleId);

    if (!isAuthorized) {
      return sendError(res, 'Not authorized to approve this requirement', 403);
    }

    // Update status
    await requirement.update({ status: 'approved' });

    // Reload with associations
    await requirement.reload({
      include: [
        { model: Project, attributes: ['id', 'code', 'name'] },
        { model: User, as: 'submitter', attributes: ['id', 'name', 'email'] },
        { model: RequirementVersion, order: [['versionNumber', 'DESC']] },
      ],
    });

    sendSuccess(res, requirement, 'Requirement approved successfully');
  } catch (error) {
    next(error);
  }
};
