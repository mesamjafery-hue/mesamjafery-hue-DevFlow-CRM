const Joi = require('joi');

// Company validation schemas
const companyValidation = {
  create: Joi.object({
    name: Joi.string().required().min(2).max(100),
    industry: Joi.string().required().min(2).max(50),
    website: Joi.string().optional().uri(),
    address: Joi.string().optional().max(255),
    phone: Joi.string().optional().pattern(/^[0-9\-\+\(\)\s]+$/).max(20),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100),
    industry: Joi.string().min(2).max(50),
    website: Joi.string().optional().uri(),
    address: Joi.string().optional().max(255),
    phone: Joi.string().optional().pattern(/^[0-9\-\+\(\)\s]+$/).max(20),
  }),
};

// Lead validation schemas
const leadValidation = {
  create: Joi.object({
    companyId: Joi.number().required(),
    name: Joi.string().required().min(2).max(100),
    email: Joi.string().required().email(),
    phone: Joi.string().required().pattern(/^[0-9\-\+\(\)\s]+$/).max(20),
    source: Joi.string().required().valid('website', 'referral', 'cold_call', 'social_media', 'other'),
    status: Joi.string().optional().valid('new', 'contacted', 'qualified', 'lost'),
    score: Joi.number().optional().min(0).max(100),
    notes: Joi.string().optional().max(1000),
  }),

  update: Joi.object({
    companyId: Joi.number(),
    name: Joi.string().min(2).max(100),
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^[0-9\-\+\(\)\s]+$/).max(20),
    source: Joi.string().valid('website', 'referral', 'cold_call', 'social_media', 'other'),
    status: Joi.string().valid('new', 'contacted', 'qualified', 'lost'),
    score: Joi.number().min(0).max(100),
    notes: Joi.string().max(1000),
  }),
};

// Deal validation schemas
const dealValidation = {
  create: Joi.object({
    title: Joi.string().required().min(3).max(200),
    companyId: Joi.number().required(),
    leadId: Joi.number().optional(),
    stage: Joi.string()
      .required()
      .valid('new_lead', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost'),
    value: Joi.number().required().positive(),
    probability: Joi.number().optional().min(0).max(100),
    expectedClose: Joi.date().optional(),
  }),

  update: Joi.object({
    title: Joi.string().min(3).max(200),
    companyId: Joi.number(),
    leadId: Joi.number(),
    stage: Joi.string().valid('new_lead', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost'),
    value: Joi.number().positive(),
    probability: Joi.number().min(0).max(100),
    expectedClose: Joi.date(),
  }),
};

// Project validation schemas
const projectValidation = {
  create: Joi.object({
    code: Joi.string().required().min(3).max(20).uppercase(),
    name: Joi.string().required().min(3).max(100),
    description: Joi.string().optional().max(1000),
    clientId: Joi.number().required(),
    pmId: Joi.number().required(),
    status: Joi.string()
      .optional()
      .valid('planning', 'active', 'on_hold', 'in_review', 'uat', 'completed', 'archived'),
    startDate: Joi.date().required(),
    endDate: Joi.date().optional(),
    budget: Joi.number().optional().positive(),
  }),

  update: Joi.object({
    code: Joi.string().min(3).max(20).uppercase(),
    name: Joi.string().min(3).max(100),
    description: Joi.string().optional().max(1000),
    clientId: Joi.number(),
    pmId: Joi.number(),
    status: Joi.string().valid('planning', 'active', 'on_hold', 'in_review', 'uat', 'completed', 'archived'),
    startDate: Joi.date(),
    endDate: Joi.date(),
    budget: Joi.number().positive(),
  }),
};

// Task validation schemas
const taskValidation = {
  create: Joi.object({
    projectId: Joi.number().required(),
    title: Joi.string().required().min(3).max(200),
    description: Joi.string().optional().max(2000),
    assigneeId: Joi.number().optional(),
    status: Joi.string().optional().valid('todo', 'in_progress', 'review', 'done'),
    priority: Joi.string().optional().valid('low', 'medium', 'high', 'critical'),
    dueDate: Joi.date().optional(),
  }),

  update: Joi.object({
    projectId: Joi.number(),
    title: Joi.string().min(3).max(200),
    description: Joi.string().optional().max(2000),
    assigneeId: Joi.number(),
    status: Joi.string().valid('todo', 'in_progress', 'review', 'done'),
    priority: Joi.string().valid('low', 'medium', 'high', 'critical'),
    dueDate: Joi.date(),
  }),
};

// Requirement validation schemas (Signature Feature)
const requirementValidation = {
  create: Joi.object({
    projectId: Joi.number().required(),
    title: Joi.string().required().min(3).max(200),
    description: Joi.string().required().max(5000),
    priority: Joi.string().optional().valid('low', 'medium', 'high', 'critical'),
    status: Joi.string()
      .optional()
      .valid('draft', 'submitted', 'clarification', 'approved', 'rejected', 'implemented'),
  }),

  update: Joi.object({
    title: Joi.string().min(3).max(200),
    description: Joi.string().max(5000),
    priority: Joi.string().valid('low', 'medium', 'high', 'critical'),
    status: Joi.string().valid('draft', 'submitted', 'clarification', 'approved', 'rejected', 'implemented'),
  }),

  version: Joi.object({
    title: Joi.string().required().min(3).max(200),
    body: Joi.string().required().max(5000),
    changeNotes: Joi.string().optional().max(1000),
  }),
};

// Invoice validation schemas
const invoiceValidation = {
  create: Joi.object({
    clientId: Joi.number().required(),
    projectId: Joi.number().optional(),
    amount: Joi.number().required().positive(),
    status: Joi.string()
      .optional()
      .valid('draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled'),
    issueDate: Joi.date().required(),
    dueDate: Joi.date().required(),
    description: Joi.string().optional().max(1000),
  }),

  update: Joi.object({
    clientId: Joi.number(),
    projectId: Joi.number(),
    amount: Joi.number().positive(),
    status: Joi.string().valid('draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled'),
    issueDate: Joi.date(),
    dueDate: Joi.date(),
    description: Joi.string().optional().max(1000),
  }),
};

// Ticket validation schemas
const ticketValidation = {
  create: Joi.object({
    projectId: Joi.number().required(),
    clientId: Joi.number().required(),
    title: Joi.string().required().min(3).max(200),
    description: Joi.string().required().max(2000),
    priority: Joi.string().optional().valid('low', 'medium', 'high', 'urgent'),
    status: Joi.string().optional().valid('open', 'in_progress', 'pending', 'resolved', 'closed'),
    assignedTo: Joi.number().optional(),
  }),

  update: Joi.object({
    projectId: Joi.number(),
    clientId: Joi.number(),
    title: Joi.string().min(3).max(200),
    description: Joi.string().max(2000),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
    status: Joi.string().valid('open', 'in_progress', 'pending', 'resolved', 'closed'),
    assignedTo: Joi.number(),
  }),
};

module.exports = { companyValidation, leadValidation, dealValidation, projectValidation, taskValidation, requirementValidation, invoiceValidation, ticketValidation };
