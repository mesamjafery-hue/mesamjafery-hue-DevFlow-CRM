const { Task, Project, User } = require('../models');
const { sendSuccess, sendError, sendPaginatedSuccess } = require('../utils/response');
const { taskValidation } = require('../validators');
const sequelize = require('../config/database');

/**
 * Get all tasks with pagination and filtering
 */
exports.getAllTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, priority, projectId, assigneeId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[sequelize.Op.or] = [
        { title: { [sequelize.Op.iLike]: `%${search}%` } },
      ];
    }
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (projectId) whereClause.projectId = projectId;
    if (assigneeId) whereClause.assigneeId = assigneeId;

    const { count, rows } = await Task.findAndCountAll({
      where: whereClause,
      include: [
        { model: Project, attributes: ['id', 'code', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
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

    sendPaginatedSuccess(res, rows, meta, 'Tasks retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new task
 */
exports.createTask = async (req, res, next) => {
  try {
    const { error, value } = taskValidation.create.validate(req.body);
    if (error) {
      return sendError(res, error.message, 400);
    }

    // Check if project exists
    const project = await Project.findByPk(value.projectId);
    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    // Create task
    const task = await Task.create({
      ...value,
      status: value.status || 'todo',
    });

    // Reload with associations
    await task.reload({
      include: [
        { model: Project, attributes: ['id', 'code', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });

    sendSuccess(res, task, 'Task created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get task by ID
 */
exports.getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id, {
      include: [
        { model: Project, attributes: ['id', 'code', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (!task) {
      return sendError(res, 'Task not found', 404);
    }

    sendSuccess(res, task, 'Task retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update task
 */
exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error, value } = taskValidation.update.validate(req.body);
    if (error) {
      return sendError(res, error.message, 400);
    }

    const task = await Task.findByPk(id);
    if (!task) {
      return sendError(res, 'Task not found', 404);
    }

    // Authorization: Assignee, admin, or project PM can update
    const project = await task.getProject();
    const isAuthorized =
      task.assigneeId === req.user.id ||
      project.pmId === req.user.id ||
      [1, 2].includes(req.user.roleId);

    if (!isAuthorized) {
      return sendError(res, 'Not authorized to update this task', 403);
    }

    await task.update(value);

    await task.reload({
      include: [
        { model: Project, attributes: ['id', 'code', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });

    sendSuccess(res, task, 'Task updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete task (soft delete)
 */
exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id);
    if (!task) {
      return sendError(res, 'Task not found', 404);
    }

    // Authorization: Project PM or admin can delete
    const project = await task.getProject();
    const isAuthorized = project.pmId === req.user.id || [1, 2].includes(req.user.roleId);

    if (!isAuthorized) {
      return sendError(res, 'Not authorized to delete this task', 403);
    }

    await task.destroy();

    sendSuccess(res, null, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};
