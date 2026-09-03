const { Project, Requirement, Invoice, Ticket } = require('../models');
const { sendSuccess } = require('../utils/response');

exports.getOverview = async (req, res, next) => {
  try {
    const clientId = req.portalClient.id;
    const [projects, requirements, invoices, tickets] = await Promise.all([
      Project.findAll({ where: { clientId }, order: [['createdAt', 'DESC']] }),
      Requirement.findAll({ include: [{ model: Project, where: { clientId }, attributes: [] }], order: [['updatedAt', 'DESC']] }),
      Invoice.findAll({ where: { clientId }, order: [['issueDate', 'DESC']] }),
      Ticket.findAll({ where: { clientId }, order: [['createdAt', 'DESC']] }),
    ]);
    return sendSuccess(res, { client: req.portalClient, projects, requirements, invoices, tickets }, 'Portal overview retrieved');
  } catch (error) { return next(error); }
};
