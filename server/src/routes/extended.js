const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { Document, TicketMessage, Ticket, Payment, Invoice, Quotation, Client } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();
router.use(authMiddleware);

const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, callback) => callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: Number.parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    callback(null, allowed.includes(file.mimetype));
  },
});

router.post('/documents', authorize('requirements.create'), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 'A supported file is required', 400);
    const document = await Document.create({ originalName: req.file.originalname, storedName: req.file.filename, mimeType: req.file.mimetype, size: req.file.size, path: req.file.path, uploadedBy: req.user.id, relatedType: req.body.relatedType, relatedId: req.body.relatedId || null });
    return sendSuccess(res, document, 'Document uploaded successfully', 201);
  } catch (error) { return next(error); }
});

router.get('/documents', authorize('requirements.view'), async (req, res, next) => {
  try { const where = {}; if (req.query.relatedType) where.relatedType = req.query.relatedType; if (req.query.relatedId) where.relatedId = req.query.relatedId; const documents = await Document.findAll({ where, order: [['createdAt', 'DESC']] }); return sendSuccess(res, documents); } catch (error) { return next(error); }
});

router.get('/documents/:id/download', authorize('requirements.view'), async (req, res, next) => {
  try { const document = await Document.findByPk(req.params.id); if (!document || !fs.existsSync(document.path)) return sendError(res, 'Document not found', 404); return res.download(document.path, document.originalName); } catch (error) { return next(error); }
});

router.get('/tickets/:ticketId/messages', authorize('tickets.view'), async (req, res, next) => {
  try { const messages = await TicketMessage.findAll({ where: { ticketId: req.params.ticketId }, order: [['createdAt', 'ASC']] }); return sendSuccess(res, messages); } catch (error) { return next(error); }
});

router.post('/tickets/:ticketId/messages', authorize('tickets.create'), async (req, res, next) => {
  try { const ticket = await Ticket.findByPk(req.params.ticketId); if (!ticket) return sendError(res, 'Ticket not found', 404); if (!req.body.body) return sendError(res, 'body is required', 400); const message = await TicketMessage.create({ ticketId: ticket.id, authorId: req.user.id, body: req.body.body, isInternal: Boolean(req.body.isInternal), slaDueAt: req.body.slaDueAt || null }); return sendSuccess(res, message, 'Ticket message created', 201); } catch (error) { return next(error); }
});

router.post('/payments', authorize('invoices.manage'), async (req, res, next) => {
  try { const { invoiceId, amount, method, reference, paidAt, status } = req.body; if (!invoiceId || !amount || !method) return sendError(res, 'invoiceId, amount, and method are required', 400); const invoice = await Invoice.findByPk(invoiceId); if (!invoice) return sendError(res, 'Invoice not found', 404); const payment = await Payment.create({ invoiceId, amount, method, reference, paidAt, status }); return sendSuccess(res, payment, 'Payment recorded successfully', 201); } catch (error) { return next(error); }
});

router.get('/payments', authorize('invoices.view'), async (req, res, next) => {
  try { return sendSuccess(res, await Payment.findAll({ where: req.query.invoiceId ? { invoiceId: req.query.invoiceId } : {}, order: [['paidAt', 'DESC']] })); } catch (error) { return next(error); }
});

router.get('/quotations', authorize('deals.view'), async (req, res, next) => {
  try { return sendSuccess(res, await Quotation.findAll({ include: [{ model: Client, attributes: ['id', 'companyId'] }], order: [['createdAt', 'DESC']] })); } catch (error) { return next(error); }
});

router.post('/quotations', authorize('deals.manage'), async (req, res, next) => {
  try { const { clientId, title, amount } = req.body; if (!clientId || !title || amount === undefined) return sendError(res, 'clientId, title, and amount are required', 400); const client = await Client.findByPk(clientId); if (!client) return sendError(res, 'Client not found', 404); const number = `QUO-${new Date().getFullYear()}-${crypto.randomInt(10000, 99999)}`; const quotation = await Quotation.create({ ...req.body, number }); return sendSuccess(res, quotation, 'Quotation created successfully', 201); } catch (error) { return next(error); }
});

module.exports = router;
