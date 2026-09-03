const { Invoice, Client, Project, User } = require('../models');
const { sendSuccess, sendError, sendPaginatedSuccess } = require('../utils/response');
const { invoiceValidation } = require('../validators');
const sequelize = require('../config/database');

/**
 * Get all invoices with pagination and filtering
 */
exports.getAllInvoices = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, clientId, projectId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[sequelize.Op.or] = [
        { number: { [sequelize.Op.iLike]: `%${search}%` } },
      ];
    }
    if (status) whereClause.status = status;
    if (clientId) whereClause.clientId = clientId;
    if (projectId) whereClause.projectId = projectId;

    const { count, rows } = await Invoice.findAndCountAll({
      where: whereClause,
      include: [
        { model: Client, attributes: ['id'] },
        { model: Project, attributes: ['id', 'code', 'name'] },
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

    sendPaginatedSuccess(res, rows, meta, 'Invoices retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new invoice
 */
exports.createInvoice = async (req, res, next) => {
  try {
    const { error, value } = invoiceValidation.create.validate(req.body);
    if (error) {
      return sendError(res, error.message, 400);
    }

    // Check if client exists
    const client = await Client.findByPk(value.clientId);
    if (!client) {
      return sendError(res, 'Client not found', 404);
    }

    // Generate invoice number
    const invoiceCount = await Invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(5, '0')}`;

    // Create invoice
    const invoice = await Invoice.create({
      ...value,
      number: invoiceNumber,
      status: value.status || 'draft',
    });

    // Reload with associations
    await invoice.reload({
      include: [
        { model: Client, attributes: ['id'] },
        { model: Project, attributes: ['id', 'code', 'name'] },
      ],
    });

    sendSuccess(res, invoice, 'Invoice created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get invoice by ID
 */
exports.getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id, {
      include: [
        { model: Client, attributes: ['id'] },
        { model: Project, attributes: ['id', 'code', 'name'] },
      ],
    });

    if (!invoice) {
      return sendError(res, 'Invoice not found', 404);
    }

    sendSuccess(res, invoice, 'Invoice retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update invoice
 */
exports.updateInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error, value } = invoiceValidation.update.validate(req.body);
    if (error) {
      return sendError(res, error.message, 400);
    }

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return sendError(res, 'Invoice not found', 404);
    }

    // Authorization: Only accounts/finance or admin can update
    const allowedRoles = [1, 6]; // Super Admin, Accounts
    if (!allowedRoles.includes(req.user.roleId)) {
      return sendError(res, 'Not authorized to update this invoice', 403);
    }

    // Track payment info
    if (value.status === 'paid' && invoice.status !== 'paid') {
      value.paidDate = new Date();
    }

    await invoice.update(value);

    await invoice.reload({
      include: [
        { model: Client, attributes: ['id'] },
        { model: Project, attributes: ['id', 'code', 'name'] },
      ],
    });

    sendSuccess(res, invoice, 'Invoice updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete invoice (soft delete)
 */
exports.deleteInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return sendError(res, 'Invoice not found', 404);
    }

    // Authorization: Only admin can delete
    if (req.user.roleId !== 1) {
      return sendError(res, 'Not authorized to delete this invoice', 403);
    }

    await invoice.destroy();

    sendSuccess(res, null, 'Invoice deleted successfully');
  } catch (error) {
    next(error);
  }
};

exports.downloadInvoicePdf = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, { include: [{ model: Client, attributes: ['id', 'companyId'] }, { model: Project, attributes: ['code', 'name'] }] });
    if (!invoice) return sendError(res, 'Invoice not found', 404);
    const text = [`DevFlow CRM Invoice`, `Number: ${invoice.number}`, `Amount: $${invoice.amount}`, `Status: ${invoice.status}`, `Issue date: ${invoice.issueDate?.toISOString().slice(0, 10) || ''}`, `Due date: ${invoice.dueDate?.toISOString().slice(0, 10) || ''}`, `Description: ${invoice.description || ''}`];
    const escapePdf = (value) => value.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');
    const stream = `BT /F1 18 Tf 50 760 Td (${escapePdf(text[0])}) Tj /F1 11 Tf 0 -32 Td ${text.slice(1).map((line) => `(${escapePdf(line)}) Tj 0 -20 Td`).join(' ')} ET`;
    const objects = [`<< /Type /Catalog /Pages 2 0 R >>`, `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`, `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`, `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`];
    let pdf = '%PDF-1.4\n'; const offsets = [0]; objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; }); const xref = Buffer.byteLength(pdf); pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    res.setHeader('Content-Type', 'application/pdf'); res.setHeader('Content-Disposition', `attachment; filename=${invoice.number}.pdf`); return res.send(Buffer.from(pdf));
  } catch (error) { return next(error); }
};
