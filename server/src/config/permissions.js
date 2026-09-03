const allPermissions = [
  'users.view', 'users.create', 'users.update', 'users.delete',
  'companies.view', 'companies.create', 'companies.update', 'companies.delete',
  'contacts.view', 'contacts.create', 'contacts.update', 'contacts.delete',
  'prospects.view', 'prospects.create', 'prospects.update', 'prospects.delete',
  'activities.view', 'activities.create', 'activities.update', 'activities.delete',
  'leads.view', 'leads.create', 'leads.update', 'leads.delete',
  'deals.view', 'deals.create', 'deals.update', 'deals.delete', 'deals.manage',
  'clients.view', 'clients.create', 'clients.update', 'clients.delete',
  'projects.view', 'projects.create', 'projects.update', 'projects.delete', 'projects.manage',
  'tasks.view', 'tasks.create', 'tasks.update', 'tasks.delete', 'tasks.assign',
  'requirements.view', 'requirements.create', 'requirements.update', 'requirements.delete', 'requirements.approve',
  'invoices.view', 'invoices.create', 'invoices.update', 'invoices.delete', 'invoices.manage',
  'tickets.view', 'tickets.create', 'tickets.update', 'tickets.delete', 'tickets.manage',
  'documents.view', 'documents.create', 'payments.view', 'payments.manage', 'quotations.view', 'quotations.manage',
  'reports.view', 'audit.view',
];

const modulePermissions = (module, actions) => actions.map((action) => `${module}.${action}`);
const rolePermissions = {
  'Super Admin': allPermissions,
  Admin: allPermissions,
  Sales: [
    ...modulePermissions('companies', ['view']),
    ...modulePermissions('contacts', ['view', 'create', 'update', 'delete']),
    ...modulePermissions('prospects', ['view', 'create', 'update', 'delete']),
    ...modulePermissions('activities', ['view', 'create', 'update', 'delete']),
    ...modulePermissions('leads', ['view', 'create', 'update', 'delete']),
    ...modulePermissions('deals', ['view', 'create', 'update', 'delete', 'manage']),
    'reports.view',
  ],
  'Project Manager': [
    ...modulePermissions('companies', ['view']),
    ...modulePermissions('clients', ['view']),
    ...modulePermissions('projects', ['view', 'create', 'update', 'delete', 'manage']),
    ...modulePermissions('tasks', ['view', 'create', 'update', 'delete', 'assign']),
    ...modulePermissions('requirements', ['view', 'create', 'update', 'delete', 'approve']),
    ...modulePermissions('tickets', ['view', 'create', 'update']),
    ...modulePermissions('activities', ['view', 'create', 'update']),
    'reports.view',
  ],
  Developer: [
    ...modulePermissions('projects', ['view']),
    ...modulePermissions('tasks', ['view', 'update']),
    ...modulePermissions('requirements', ['view', 'update']),
    ...modulePermissions('tickets', ['view', 'create', 'update']),
    ...modulePermissions('activities', ['view', 'create']),
  ],
  Accounts: [
    ...modulePermissions('clients', ['view']),
    ...modulePermissions('invoices', ['view', 'create', 'update', 'delete', 'manage']),
    'reports.view',
  ],
  Support: [
    ...modulePermissions('clients', ['view']),
    ...modulePermissions('projects', ['view']),
    ...modulePermissions('tickets', ['view', 'create', 'update', 'delete', 'manage']),
  ],
  Client: [
    ...modulePermissions('projects', ['view']),
    ...modulePermissions('requirements', ['view', 'create', 'update', 'approve']),
    ...modulePermissions('invoices', ['view']),
    ...modulePermissions('tickets', ['view', 'create', 'update']),
    ...modulePermissions('activities', ['view', 'create']),
  ],
};

const legacyToPermission = {
  'create:company': 'companies.create', 'update:company': 'companies.update', 'delete:company': 'companies.delete',
  'create:lead': 'leads.create', 'update:lead': 'leads.update', 'delete:lead': 'leads.delete',
  'create:deal': 'deals.create', 'update:deal': 'deals.update', 'delete:deal': 'deals.delete',
  'create:project': 'projects.create', 'update:project': 'projects.update', 'delete:project': 'projects.delete',
  'create:task': 'tasks.create', 'update:task': 'tasks.update', 'delete:task': 'tasks.delete',
  'create:requirement': 'requirements.create', 'update:requirement': 'requirements.update', 'delete:requirement': 'requirements.delete', 'approve:requirement': 'requirements.approve',
  'create:invoice': 'invoices.create', 'update:invoice': 'invoices.update', 'delete:invoice': 'invoices.delete',
  'create:ticket': 'tickets.create', 'update:ticket': 'tickets.update', 'delete:ticket': 'tickets.delete',
};

module.exports = { rolePermissions, legacyToPermission };
