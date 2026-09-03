const express = require('express');
const invoiceController = require('../controllers/invoiceController');
const { authMiddleware } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.use(authMiddleware);

router.get('/', invoiceController.getAllInvoices);
router.get('/:id/pdf', invoiceController.downloadInvoicePdf);
router.post('/', authorize(['create:invoice']), invoiceController.createInvoice);
router.get('/:id', invoiceController.getInvoiceById);
router.patch('/:id', authorize(['update:invoice']), invoiceController.updateInvoice);
router.delete('/:id', authorize(['delete:invoice']), invoiceController.deleteInvoice);

module.exports = router;
