# DevFlow CRM - Full Stack Implementation

## 📋 Project Overview

DevFlow CRM is a production-grade PERN stack (PostgreSQL, Express, React, Node.js) Customer Relationship Management application designed specifically for software houses. It includes a comprehensive CRM module, project management, a signature requirement vault with versioning, client portal, invoicing, support tickets, and full role-based access control.

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Node.js 18+ with Express 5.x
- PostgreSQL 14+ with Sequelize ORM
- JWT Authentication with refresh tokens
- Joi validation
- Bcryptjs password hashing
- Nodemailer for email notifications

**Frontend:**
- React 18.x with Vite 5.x
- Redux Toolkit for state management
- Axios HTTP client with JWT interceptors
- React Router for navigation
- Bootstrap 5 / Tailwind CSS for styling

## 🚀 Quick Start

### Prerequisites

1. **Node.js** 18+ installed
2. **PostgreSQL** 14+ running on localhost:5432
3. Default PostgreSQL credentials:
   - User: `postgres`
   - Password: `postgres`
   - Database: `devflow_crm` (will be created automatically)

### Backend Setup

```bash
cd server

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env and update if needed
cp .env.example .env

# Seed demo data
npm run seed

# Start development server
npm run dev
```

Backend runs on: `http://localhost:5000`
API Base: `http://localhost:5000/api/v1`

### Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

### Demo Credentials

```
Email: admin@devflow.com
Password: Password@123
Role: Super Admin
```

All users share the same password for demo purposes.

## 📦 Database Schema

### Core Entities

1. **Role** - User roles (Super Admin, Admin, Sales, PM, Developer, Accounts, Support, Client)
2. **User** - User accounts with authentication
3. **Company** - Client organizations
4. **Lead** - Sales pipeline prospects
5. **Deal** - Sales opportunities with monetary values
6. **Client** - Converted active clients
7. **Project** - Client projects with budget tracking
8. **Task** - Project tasks with assignments
9. **Requirement** - Formalized requirements (signature feature)
10. **RequirementVersion** - Requirement change tracking and versioning
11. **Invoice** - Client billing and invoicing
12. **Ticket** - Support and issue tracking
13. **AuditLog** - Complete system audit trail

## 🔑 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify-email` - Verify email address
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/refresh-token` - Refresh access token

### CRM Core
- `GET/POST /companies` - Company management
- `GET/POST /leads` - Lead management
- `GET/POST /deals` - Deal management
- `GET /deals/pipeline` - Pipeline view grouped by stage

### Project Management
- `GET/POST /projects` - Project CRUD
- `GET/POST /tasks` - Task management

### Requirements (Signature Feature)
- `GET/POST /requirements` - Requirement CRUD
- `GET /requirements/:id/versions` - Version history
- `POST /requirements/:id/versions` - Create new version
- `POST /requirements/:id/approve` - Approve requirement

### Financials & Support
- `GET/POST /invoices` - Invoice management
- `GET/POST /tickets` - Support ticket management

## 🔐 Authentication & Authorization

### JWT Token Flow

1. **Login**: User provides credentials → Server returns access & refresh tokens
2. **Access Token**: Valid for 15 minutes, sent in Authorization header
3. **Refresh Flow**: When access token expires, client uses refresh token to get new access token
4. **Logout**: Clear tokens from client storage

### Role-Based Access Control (RBAC)

Roles are defined in the database and include permissions for:
- Creating/Reading/Updating/Deleting entities
- Approving requirements
- Managing projects and tasks
- Financial operations

## 🎯 Key Features

### 1. CRM Module
- Lead lifecycle management (New → Contacted → Qualified → Lost/Converted)
- Deal pipeline with 7 stages and probability tracking
- Company management with contact information
- Lead scoring system

### 2. Project Management
- Project creation and tracking
- Kanban-style task board
- Resource allocation and task assignments
- Project status lifecycle (Planning → Active → UAT → Completed)
- Budget tracking

### 3. Requirement Vault (Signature Feature)
- Formalized requirements with automatic versioning
- Change tracking with detailed version history
- Requirement approval workflow
- Status management (Draft → Submitted → Clarification → Approved → Implemented)
- Requirements linked to projects for full traceability

### 4. Financial Management
- Invoice generation and tracking
- Invoice status lifecycle (Draft → Sent → Partially Paid → Paid → Overdue)
- Payment date tracking
- Client billing information

### 5. Support & Ticketing
- Issue tracking system
- Priority-based ticket management (Low → Medium → High → Urgent)
- Ticket assignment to team members
- Status tracking (Open → In Progress → Pending → Resolved → Closed)

### 6. Client Portal
- Clients can view their projects
- Access requirements for their projects
- View invoices and payment status
- Open and track support tickets
- Secure, role-based access

### 7. Audit Logging
- Complete audit trail of all user actions
- Entity change tracking
- Metadata logging for compliance

## 🛣️ Frontend Routing

```
/login                    - Login page
/register                 - Registration page
/dashboard                - Main dashboard
/leads                    - Leads list
/deals                    - Deals pipeline
/companies                - Companies list
/projects                 - Projects list
/projects/:id             - Project details
/tasks                    - Task board
/requirements             - Requirements vault
/invoices                 - Invoicing
/tickets                  - Support tickets
```

## 📝 Development Workflow

### Adding a New CRM Entity

1. **Model** - Create Sequelize model in `server/src/models/`
2. **Controller** - Implement CRUD operations in `server/src/controllers/`
3. **Routes** - Define endpoints in `server/src/routes/`
4. **Validation** - Add Joi schemas in `server/src/validators/`
5. **API Service** - Create service in `client/src/api/`
6. **Redux Slice** - Add state management in `client/src/store/slices/`
7. **Components** - Build React components in `client/src/pages/` and `client/src/components/`

### Database Migrations

For schema changes:
```bash
cd server

# Models are auto-synced on startup with logging
# For production, implement proper migrations using sequelize-cli
```

## 🧪 Testing

### API Testing with Postman/Insomnia

1. Import the API collection from `server/docs/postman-collection.json`
2. Set up environment variables for API_URL and ACCESS_TOKEN
3. Test endpoints with sample data

### Frontend Testing

```bash
cd client
npm run dev
# Visit http://localhost:5173
# Use demo credentials to login
```

## 🚨 Error Handling

### Common Issues

**PostgreSQL Connection Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
Solution: Ensure PostgreSQL is running and credentials in `.env` are correct

**Port Already in Use:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
Solution: Change port in `.env` or kill process on port 5000

**CORS Error:**
```
Access to XMLHttpRequest blocked by CORS
```
Solution: Ensure `CLIENT_URL` in backend `.env` matches frontend URL

## 📚 API Documentation

Detailed API documentation available at:
- `POST /api/v1/health` - Health check endpoint
- Each controller includes JSDoc comments
- Request/response schemas in validators

## 🔄 Deployment Checklist

Before production deployment:

- [ ] Update `.env` with production database credentials
- [ ] Set `NODE_ENV=production`
- [ ] Generate strong JWT secrets (32+ characters)
- [ ] Configure SMTP for email notifications
- [ ] Set up database backups
- [ ] Configure HTTPS and SSL certificates
- [ ] Set up rate limiting middleware
- [ ] Enable database connection pooling
- [ ] Configure CDN for static assets
- [ ] Set up monitoring and logging

## 📞 Support & Maintenance

### Logging
- Backend logs to console (development)
- Configure Winston or Pino for production logging
- Check `src/utils/logger.js` for logging setup

### Performance Optimization
- Database indexes on frequently queried fields
- Connection pooling configured in Sequelize
- Frontend code splitting with React.lazy()
- API response caching strategies

## 📄 License

Private project for internal use.

## 👥 Team

Developed for software house teams managing complex client projects with emphasis on requirement tracking and project delivery.

---

**Last Updated:** September 2026
**Version:** 1.0.0
