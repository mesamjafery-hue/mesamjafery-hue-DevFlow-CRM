const express = require('express');
const companyController = require('../controllers/companyController');
const { authMiddleware } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

// All company routes require authentication
router.use(authMiddleware);

// Get all companies
router.get('/', companyController.getAllCompanies);

// Create company
router.post('/', authorize(['create:company']), companyController.createCompany);

// Get company by ID
router.get('/:id', companyController.getCompanyById);

// Update company
router.patch('/:id', authorize(['update:company']), companyController.updateCompany);

// Delete company
router.delete('/:id', authorize(['delete:company']), companyController.deleteCompany);

module.exports = router;
