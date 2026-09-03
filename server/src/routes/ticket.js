const express = require('express');
const ticketController = require('../controllers/ticketController');
const { authMiddleware } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.use(authMiddleware);

router.get('/', ticketController.getAllTickets);
router.post('/', authorize(['create:ticket']), ticketController.createTicket);
router.get('/:id', ticketController.getTicketById);
router.patch('/:id', authorize(['update:ticket']), ticketController.updateTicket);
router.delete('/:id', authorize(['delete:ticket']), ticketController.deleteTicket);

module.exports = router;
