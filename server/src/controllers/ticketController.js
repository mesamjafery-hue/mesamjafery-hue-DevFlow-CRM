const { Ticket, Project, Client, User } = require('../models');
const { sendSuccess, sendError, sendPaginatedSuccess } = require('../utils/response');
const { ticketValidation } = require('../validators');
const sequelize = require('../config/database');

/**
 * Get all tickets with pagination and filtering
 */
exports.getAllTickets = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, priority, projectId, clientId, assignedTo } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[sequelize.Op.or] = [
        { title: { [sequelize.Op.iLike]: `%${search}%` } },
        { number: { [sequelize.Op.iLike]: `%${search}%` } },
      ];
    }
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (projectId) whereClause.projectId = projectId;
    if (clientId) whereClause.clientId = clientId;
    if (assignedTo) whereClause.assignedTo = assignedTo;

    const { count, rows } = await Ticket.findAndCountAll({
      where: whereClause,
      include: [
        { model: Project, attributes: ['id', 'code', 'name'] },
        { model: Client, attributes: ['id'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
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

    sendPaginatedSuccess(res, rows, meta, 'Tickets retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new ticket
 */
exports.createTicket = async (req, res, next) => {
  try {
    const { error, value } = ticketValidation.create.validate(req.body);
    if (error) {
      return sendError(res, error.message, 400);
    }

    // Check if project exists
    const project = await Project.findByPk(value.projectId);
    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    // Generate ticket number
    const ticketCount = await Ticket.count({ where: { projectId: value.projectId } });
    const ticketNumber = `TKT-${project.code}-${String(ticketCount + 1).padStart(4, '0')}`;

    // Create ticket
    const ticket = await Ticket.create({
      ...value,
      number: ticketNumber,
      createdBy: req.user.id,
      status: value.status || 'open',
    });

    // Reload with associations
    await ticket.reload({
      include: [
        { model: Project, attributes: ['id', 'code', 'name'] },
        { model: Client, attributes: ['id'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });

    sendSuccess(res, ticket, 'Ticket created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get ticket by ID
 */
exports.getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id, {
      include: [
        { model: Project, attributes: ['id', 'code', 'name'] },
        { model: Client, attributes: ['id'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (!ticket) {
      return sendError(res, 'Ticket not found', 404);
    }

    sendSuccess(res, ticket, 'Ticket retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update ticket
 */
exports.updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error, value } = ticketValidation.update.validate(req.body);
    if (error) {
      return sendError(res, error.message, 400);
    }

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return sendError(res, 'Ticket not found', 404);
    }

    // Authorization: Assignee, creator, support, or admin can update
    const allowedRoles = [1, 7]; // Super Admin, Support
    const isAuthorized =
      ticket.assignedTo === req.user.id ||
      ticket.createdBy === req.user.id ||
      allowedRoles.includes(req.user.roleId);

    if (!isAuthorized) {
      return sendError(res, 'Not authorized to update this ticket', 403);
    }

    await ticket.update(value);

    await ticket.reload({
      include: [
        { model: Project, attributes: ['id', 'code', 'name'] },
        { model: Client, attributes: ['id'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
    });

    sendSuccess(res, ticket, 'Ticket updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete ticket (soft delete)
 */
exports.deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return sendError(res, 'Ticket not found', 404);
    }

    // Authorization: Only admin can delete
    if (req.user.roleId !== 1) {
      return sendError(res, 'Not authorized to delete this ticket', 403);
    }

    await ticket.destroy();

    sendSuccess(res, null, 'Ticket deleted successfully');
  } catch (error) {
    next(error);
  }
};
