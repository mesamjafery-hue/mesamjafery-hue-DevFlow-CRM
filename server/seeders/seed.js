require('dotenv').config();
const sequelize = require('../src/config/database');
const { Role, RolePermission, User, Company, Lead, Deal, Client, Project, Task, Requirement, RequirementVersion, Invoice, Ticket } = require('../src/models');
const { rolePermissions } = require('../src/config/permissions');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    await sequelize.truncate({ cascade: true });
    console.log('Database cleared');

    const roles = await Role.bulkCreate([
      { name: 'Super Admin', description: 'Full system access' },
      { name: 'Admin', description: 'Administrative access' },
      { name: 'Sales', description: 'Sales team member' },
      { name: 'Project Manager', description: 'Project management' },
      { name: 'Developer', description: 'Development team member' },
      { name: 'Accounts', description: 'Accounting team' },
      { name: 'Support', description: 'Support team member' },
      { name: 'Client', description: 'Client user' },
    ]);
    console.log('Roles created');

    await RolePermission.bulkCreate(roles.flatMap((role) => (rolePermissions[role.name] || []).map((permission) => ({ roleId: role.id, permission }))));
    console.log('Role permissions created');

    const hashedPassword = await bcrypt.hash('Password@123', 10);
    const users = await User.bulkCreate([
      { name: 'Admin User', email: 'admin@devflow.com', passwordHash: hashedPassword, roleId: roles[0].id, status: 'active', emailVerified: true },
      { name: 'Sales Manager', email: 'sales@devflow.com', passwordHash: hashedPassword, roleId: roles[2].id, status: 'active', emailVerified: true },
      { name: 'John Project Manager', email: 'john@devflow.com', passwordHash: hashedPassword, roleId: roles[3].id, status: 'active', emailVerified: true },
      { name: 'Alice Developer', email: 'alice@devflow.com', passwordHash: hashedPassword, roleId: roles[4].id, status: 'active', emailVerified: true },
      { name: 'Bob Developer', email: 'bob@devflow.com', passwordHash: hashedPassword, roleId: roles[4].id, status: 'active', emailVerified: true },
      { name: 'Finance Team', email: 'accounts@devflow.com', passwordHash: hashedPassword, roleId: roles[5].id, status: 'active', emailVerified: true },
      { name: 'Support Agent', email: 'support@devflow.com', passwordHash: hashedPassword, roleId: roles[6].id, status: 'active', emailVerified: true },
      { name: 'Client User', email: 'client@company.com', passwordHash: hashedPassword, roleId: roles[7].id, status: 'active', emailVerified: true },
    ]);
    console.log('Users created');

    const companies = await Company.bulkCreate([
      { name: 'Tech Innovations Inc', industry: 'Technology', website: 'https://techinnovations.com', address: '123 Tech Street, San Francisco, CA', phone: '+1-415-555-0001', ownerId: users[1].id },
      { name: 'Digital Solutions Ltd', industry: 'Consulting', website: 'https://digitalsolutions.com', address: '456 Digital Ave, New York, NY', phone: '+1-212-555-0002', ownerId: users[1].id },
      { name: 'Enterprise Corp', industry: 'Enterprise Software', website: 'https://enterprisecorp.com', address: '789 Business Blvd, Boston, MA', phone: '+1-617-555-0003', ownerId: users[1].id },
    ]);
    console.log('Companies created');

    const leads = await Lead.bulkCreate([
      { companyId: companies[0].id, name: 'Sarah Johnson', email: 'sarah@techinnovations.com', phone: '+1-415-555-1001', source: 'website', status: 'new', score: 75, ownerId: users[1].id, notes: 'Interested in enterprise solutions' },
      { companyId: companies[1].id, name: 'Michael Chen', email: 'michael@digitalsolutions.com', phone: '+1-212-555-1002', source: 'referral', status: 'contacted', score: 80, ownerId: users[1].id, notes: 'Decision maker for tech initiatives' },
      { companyId: companies[2].id, name: 'Emma Wilson', email: 'emma@enterprisecorp.com', phone: '+1-617-555-1003', source: 'cold_call', status: 'qualified', score: 85, ownerId: users[1].id, notes: 'Ready to discuss partnership' },
    ]);
    console.log('Leads created');

    await Deal.bulkCreate([
      { title: 'Enterprise CRM Implementation', companyId: companies[0].id, leadId: leads[0].id, ownerId: users[1].id, stage: 'proposal_sent', value: 150000, probability: 60, expectedClose: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
      { title: 'Cloud Migration Project', companyId: companies[1].id, leadId: leads[1].id, ownerId: users[1].id, stage: 'negotiation', value: 200000, probability: 75, expectedClose: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) },
      { title: 'Mobile App Development', companyId: companies[2].id, leadId: leads[2].id, ownerId: users[1].id, stage: 'proposal_sent', value: 175000, probability: 70, expectedClose: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    ]);
    console.log('Deals created');

    const clients = await Client.bulkCreate([
      { companyId: companies[0].id, accountManagerId: users[1].id, portalUserId: users[7].id, billingInfo: 'Monthly invoicing', status: 'active', portalAccess: true },
      { companyId: companies[1].id, accountManagerId: users[1].id, billingInfo: 'Quarterly invoicing', status: 'active', portalAccess: true },
      { companyId: companies[2].id, accountManagerId: users[1].id, billingInfo: 'Custom terms', status: 'active', portalAccess: true },
    ]);
    console.log('Clients created');

    const projects = await Project.bulkCreate([
      { code: 'CRM001', name: 'Enterprise CRM System', description: 'Full-featured CRM implementation', clientId: clients[0].id, pmId: users[2].id, status: 'active', startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), budget: 150000 },
      { code: 'CLOUD01', name: 'Cloud Migration Initiative', description: 'Migrate infrastructure to cloud', clientId: clients[1].id, pmId: users[2].id, status: 'planning', startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), budget: 200000 },
      { code: 'APP001', name: 'Mobile App Development', description: 'iOS and Android mobile application', clientId: clients[2].id, pmId: users[2].id, status: 'planning', startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000), budget: 175000 },
    ]);
    console.log('Projects created');

    await Task.bulkCreate([
      { projectId: projects[0].id, title: 'Database schema design', description: 'Design and optimize database schema', assigneeId: users[3].id, status: 'in_progress', priority: 'high', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) },
      { projectId: projects[0].id, title: 'API endpoint development', description: 'Build REST API for CRM features', assigneeId: users[4].id, status: 'todo', priority: 'high', dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
      { projectId: projects[0].id, title: 'Frontend UI implementation', description: 'Create user interface components', assigneeId: users[3].id, status: 'todo', priority: 'medium', dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) },
    ]);
    console.log('Tasks created');

    const requirements = await Requirement.bulkCreate([
      { projectId: projects[0].id, code: 'REQ-CRM001-001', title: 'User authentication with JWT', description: 'Implement secure JWT-based authentication system', submittedBy: users[1].id, status: 'approved', priority: 'critical', currentVersion: 1 },
      { projectId: projects[0].id, code: 'REQ-CRM001-002', title: 'Lead management module', description: 'Create full lead lifecycle management', submittedBy: users[1].id, status: 'submitted', priority: 'high', currentVersion: 2 },
      { projectId: projects[0].id, code: 'REQ-CRM001-003', title: 'Deal pipeline visualization', description: 'Interactive deal pipeline dashboard', submittedBy: users[1].id, status: 'clarification', priority: 'high', currentVersion: 1 },
    ]);
    console.log('Requirements created');

    await RequirementVersion.bulkCreate([
      { requirementId: requirements[0].id, versionNumber: 1, title: 'User authentication with JWT', body: 'Implement secure JWT-based authentication system with 15-minute access token expiry and 7-day refresh token expiry.', createdBy: users[1].id, changeNotes: 'Initial requirement submission' },
      { requirementId: requirements[1].id, versionNumber: 1, title: 'Lead management module', body: 'Create full lead lifecycle management including lead creation, qualification, scoring, and conversion to deals.', createdBy: users[1].id, changeNotes: 'Initial submission' },
      { requirementId: requirements[1].id, versionNumber: 2, title: 'Lead management module with analytics', body: 'Create full lead lifecycle management including lead creation, qualification, scoring, conversion to deals, and lead source analytics.', createdBy: users[1].id, changeNotes: 'Added analytics requirement based on feedback' },
      { requirementId: requirements[2].id, versionNumber: 1, title: 'Deal pipeline visualization', body: 'Interactive deal pipeline dashboard with drag-drop to update deal stage, real-time pipeline value calculation.', createdBy: users[1].id, changeNotes: 'Initial requirement' },
    ]);
    console.log('Requirement versions created');

    await Invoice.bulkCreate([
      { number: 'INV-2026-00001', clientId: clients[0].id, projectId: projects[0].id, amount: 50000, status: 'sent', issueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), description: 'CRM Implementation - Phase 1' },
      { number: 'INV-2026-00002', clientId: clients[0].id, projectId: projects[0].id, amount: 50000, status: 'paid', issueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), description: 'CRM Implementation - Phase 1 (50% deposit)', paidDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { number: 'INV-2026-00003', clientId: clients[1].id, projectId: projects[1].id, amount: 100000, status: 'draft', issueDate: new Date(), dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), description: 'Cloud Migration - Kickoff' },
    ]);
    console.log('Invoices created');

    await Ticket.bulkCreate([
      { number: 'TKT-CRM001-0001', projectId: projects[0].id, clientId: clients[0].id, title: 'Database connection issue', description: 'Cannot connect to PostgreSQL database from staging environment', priority: 'high', status: 'in_progress', createdBy: users[1].id, assignedTo: users[3].id },
      { number: 'TKT-CRM001-0002', projectId: projects[0].id, clientId: clients[0].id, title: 'Login not working on mobile', description: 'OAuth login failing on mobile devices', priority: 'high', status: 'open', createdBy: users[1].id, assignedTo: users[4].id },
      { number: 'TKT-CRM001-0003', projectId: projects[0].id, clientId: clients[0].id, title: 'Performance optimization needed', description: 'Dashboard loading is slow with large datasets', priority: 'medium', status: 'open', createdBy: users[1].id, assignedTo: null },
    ]);
    console.log('Tickets created');

    console.log('');
    console.log('Database seeding completed successfully!');
    console.log('');
    console.log('Demo credentials:');
    console.log('Email: admin@devflow.com');
    console.log('Password: Password@123');
    console.log('Role: Super Admin');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
