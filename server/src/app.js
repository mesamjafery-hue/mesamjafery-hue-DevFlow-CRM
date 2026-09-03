const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler');
const auditMiddleware = require('./middleware/audit');

const app = express();
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174'].filter(Boolean);

// Middleware
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(auditMiddleware);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const companyRoutes = require('./routes/company');
const clientRoutes = require('./routes/client');
const leadRoutes = require('./routes/lead');
const dealRoutes = require('./routes/deal');
const projectRoutes = require('./routes/project');
const taskRoutes = require('./routes/task');
const requirementRoutes = require('./routes/requirement');
const invoiceRoutes = require('./routes/invoice');
const ticketRoutes = require('./routes/ticket');
const workflowRoutes = require('./routes/workflow');
const extendedRoutes = require('./routes/extended');
const portalRoutes = require('./routes/portal');
const taskExtraRoutes = require('./routes/taskExtras');

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/deals', dealRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/tasks', taskExtraRoutes);
app.use('/api/v1/requirements', requirementRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1', workflowRoutes);
app.use('/api/v1', extendedRoutes);
app.use('/api/v1/portal', portalRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
