const sequelize = require('../config/database');
const RoleModel = require('./Role');
const UserModel = require('./User');
const CompanyModel = require('./Company');
const LeadModel = require('./Lead');
const DealModel = require('./Deal');
const ClientModel = require('./Client');
const ProjectModel = require('./Project');
const TaskModel = require('./Task');
const RequirementModel = require('./Requirement');
const RequirementVersionModel = require('./RequirementVersion');
const InvoiceModel = require('./Invoice');
const TicketModel = require('./Ticket');
const AuditLogModel = require('./AuditLog');
const ContactModel = require('./Contact');
const ProspectModel = require('./Prospect');
const ActivityModel = require('./Activity');
const MilestoneModel = require('./Milestone');
const DocumentModel = require('./Document');
const TicketMessageModel = require('./TicketMessage');
const PaymentModel = require('./Payment');
const QuotationModel = require('./Quotation');
const RolePermissionModel = require('./RolePermission');
const TwoFactorChallengeModel = require('./TwoFactorChallenge');
const SubtaskModel = require('./Subtask');
const TaskCommentModel = require('./TaskComment');

// Initialize models
const Role = RoleModel(sequelize);
const User = UserModel(sequelize);
const Company = CompanyModel(sequelize);
const Lead = LeadModel(sequelize);
const Deal = DealModel(sequelize);
const Client = ClientModel(sequelize);
const Project = ProjectModel(sequelize);
const Task = TaskModel(sequelize);
const Requirement = RequirementModel(sequelize);
const RequirementVersion = RequirementVersionModel(sequelize);
const Invoice = InvoiceModel(sequelize);
const Ticket = TicketModel(sequelize);
const AuditLog = AuditLogModel(sequelize);
const Contact = ContactModel(sequelize);
const Prospect = ProspectModel(sequelize);
const Activity = ActivityModel(sequelize);
const Milestone = MilestoneModel(sequelize);
const Document = DocumentModel(sequelize);
const TicketMessage = TicketMessageModel(sequelize);
const Payment = PaymentModel(sequelize);
const Quotation = QuotationModel(sequelize);
const RolePermission = RolePermissionModel(sequelize);
const TwoFactorChallenge = TwoFactorChallengeModel(sequelize);
const Subtask = SubtaskModel(sequelize);
const TaskComment = TaskCommentModel(sequelize);

// Setup associations
Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });

User.hasMany(Company, { foreignKey: 'ownerId', as: 'ownedCompanies' });
Company.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

Company.hasMany(Lead, { foreignKey: 'companyId' });
Lead.belongsTo(Company, { foreignKey: 'companyId' });

User.hasMany(Lead, { foreignKey: 'ownerId', as: 'ownedLeads' });
Lead.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

Company.hasMany(Deal, { foreignKey: 'companyId' });
Deal.belongsTo(Company, { foreignKey: 'companyId' });

Lead.hasMany(Deal, { foreignKey: 'leadId' });
Deal.belongsTo(Lead, { foreignKey: 'leadId' });

User.hasMany(Deal, { foreignKey: 'ownerId', as: 'ownedDeals' });
Deal.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

Company.hasMany(Client, { foreignKey: 'companyId' });
Client.belongsTo(Company, { foreignKey: 'companyId' });

User.hasMany(Client, { foreignKey: 'accountManagerId', as: 'clientAccounts' });
Client.belongsTo(User, { foreignKey: 'accountManagerId', as: 'accountManager' });

Client.hasMany(Project, { foreignKey: 'clientId' });
Project.belongsTo(Client, { foreignKey: 'clientId' });

User.hasMany(Project, { foreignKey: 'pmId', as: 'managedProjects' });
Project.belongsTo(User, { foreignKey: 'pmId', as: 'pm' });

Project.hasMany(Task, { foreignKey: 'projectId' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

Project.hasMany(Requirement, { foreignKey: 'projectId' });
Requirement.belongsTo(Project, { foreignKey: 'projectId' });

User.hasMany(Requirement, { foreignKey: 'submittedBy', as: 'submittedRequirements' });
Requirement.belongsTo(User, { foreignKey: 'submittedBy', as: 'submitter' });

Requirement.hasMany(RequirementVersion, { foreignKey: 'requirementId', onDelete: 'CASCADE' });
RequirementVersion.belongsTo(Requirement, { foreignKey: 'requirementId' });

User.hasMany(RequirementVersion, { foreignKey: 'createdBy' });
RequirementVersion.belongsTo(User, { foreignKey: 'createdBy' });

Client.hasMany(Invoice, { foreignKey: 'clientId' });
Invoice.belongsTo(Client, { foreignKey: 'clientId' });

Project.hasMany(Invoice, { foreignKey: 'projectId' });
Invoice.belongsTo(Project, { foreignKey: 'projectId' });

Project.hasMany(Ticket, { foreignKey: 'projectId' });
Ticket.belongsTo(Project, { foreignKey: 'projectId' });

Client.hasMany(Ticket, { foreignKey: 'clientId' });
Ticket.belongsTo(Client, { foreignKey: 'clientId' });

User.hasMany(Ticket, { foreignKey: 'createdBy', as: 'createdTickets' });
Ticket.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

User.hasMany(Ticket, { foreignKey: 'assignedTo', as: 'assignedTickets' });
Ticket.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

User.hasMany(AuditLog, { foreignKey: 'userId' });
AuditLog.belongsTo(User, { foreignKey: 'userId' });

Company.hasMany(Contact, { foreignKey: 'companyId' });
Contact.belongsTo(Company, { foreignKey: 'companyId' });
Client.hasMany(Contact, { foreignKey: 'clientId' });
Contact.belongsTo(Client, { foreignKey: 'clientId' });
Company.hasMany(Prospect, { foreignKey: 'companyId' });
Prospect.belongsTo(Company, { foreignKey: 'companyId' });
Contact.hasMany(Prospect, { foreignKey: 'contactId' });
Prospect.belongsTo(Contact, { foreignKey: 'contactId' });
User.hasMany(Prospect, { foreignKey: 'ownerId' });
Prospect.belongsTo(User, { foreignKey: 'ownerId' });
User.hasMany(Activity, { foreignKey: 'ownerId' });
Activity.belongsTo(User, { foreignKey: 'ownerId' });
Project.hasMany(Milestone, { foreignKey: 'projectId' });
Milestone.belongsTo(Project, { foreignKey: 'projectId' });
User.hasMany(Document, { foreignKey: 'uploadedBy', as: 'documents' });
Document.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
Ticket.hasMany(TicketMessage, { foreignKey: 'ticketId', onDelete: 'CASCADE' });
TicketMessage.belongsTo(Ticket, { foreignKey: 'ticketId' });
User.hasMany(TicketMessage, { foreignKey: 'authorId', as: 'ticketMessages' });
TicketMessage.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Invoice.hasMany(Payment, { foreignKey: 'invoiceId', onDelete: 'CASCADE' });
Payment.belongsTo(Invoice, { foreignKey: 'invoiceId' });
Client.hasMany(Quotation, { foreignKey: 'clientId' });
Quotation.belongsTo(Client, { foreignKey: 'clientId' });
Role.hasMany(RolePermission, { foreignKey: 'roleId', onDelete: 'CASCADE' });
RolePermission.belongsTo(Role, { foreignKey: 'roleId' });
User.hasMany(TwoFactorChallenge, { foreignKey: 'userId' });
TwoFactorChallenge.belongsTo(User, { foreignKey: 'userId' });
Task.hasMany(Subtask, { foreignKey: 'taskId', onDelete: 'CASCADE' });
Subtask.belongsTo(Task, { foreignKey: 'taskId' });
User.hasMany(Subtask, { foreignKey: 'assigneeId', as: 'assignedSubtasks' });
Subtask.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });
Task.hasMany(TaskComment, { foreignKey: 'taskId', onDelete: 'CASCADE' });
TaskComment.belongsTo(Task, { foreignKey: 'taskId' });
User.hasMany(TaskComment, { foreignKey: 'authorId', as: 'taskComments' });
TaskComment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

module.exports = {
  sequelize,
  Role,
  User,
  Company,
  Lead,
  Deal,
  Client,
  Project,
  Task,
  Requirement,
  RequirementVersion,
  Invoice,
  Ticket,
  AuditLog,
  Contact,
  Prospect,
  Activity,
  Milestone,
  Document,
  TicketMessage,
  Payment,
  Quotation,
  RolePermission,
  TwoFactorChallenge,
  Subtask,
  TaskComment,
};
