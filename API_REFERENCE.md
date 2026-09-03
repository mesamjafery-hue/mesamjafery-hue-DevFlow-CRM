# DevFlow CRM - API Quick Reference

## 🔑 Authentication Headers

All requests (except login/register) require:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## 🚀 API Endpoints

### Authentication (No Auth Required)

```
POST /auth/register
Body: { name, email, password }
Response: { user, accessToken, refreshToken }

POST /auth/login
Body: { email, password }
Response: { user, accessToken, refreshToken }

POST /auth/verify-email
Body: { token }
Response: { success: true }

POST /auth/forgot-password
Body: { email }
Response: { message: "Reset link sent" }

POST /auth/reset-password
Body: { token, newPassword }
Response: { success: true }

POST /auth/refresh-token
Body: { refreshToken }
Response: { accessToken, refreshToken }
```

### Companies (Auth Required)

```
GET /companies?page=1&limit=10&search=tech&industry=Technology
Response: { data: [], meta: { total, page, limit, totalPages } }

POST /companies
Body: { name, industry, website, address, phone }
Response: { id, name, industry, ... }

GET /companies/:id
Response: { id, name, industry, owner: {...} }

PATCH /companies/:id
Body: { name?, industry?, ... }
Response: { id, name, ... }

DELETE /companies/:id
Response: { success: true }
```

### Leads (Auth Required)

```
GET /leads?page=1&limit=10&search=&status=new&source=website&ownerId=1
Response: { data: [], meta: {...} }

POST /leads
Body: { 
  companyId, name, email, phone, 
  source: "website|referral|cold_call|social_media|other",
  status: "new|contacted|qualified|lost",
  score: 0-100,
  notes
}
Response: { id, name, email, ... }

GET /leads/:id
Response: { id, name, company: {...}, owner: {...}, ... }

PATCH /leads/:id
Body: { status?, score?, notes?, ... }
Response: { id, name, ... }

DELETE /leads/:id
Response: { success: true }

POST /leads/:id/convert
Body: { dealTitle, dealValue }
Response: { id, name, status: "qualified", ... }
```

### Deals (Auth Required)

```
GET /deals?page=1&limit=10&search=&stage=proposal_sent&ownerId=1
Response: { data: [], meta: {...} }

POST /deals
Body: {
  title, companyId, leadId?,
  stage: "new_lead|contacted|qualified|proposal_sent|negotiation|won|lost",
  value: number,
  probability: 0-100,
  expectedClose: date
}
Response: { id, title, stage, value, ... }

GET /deals/:id
Response: { id, title, company: {...}, lead: {...}, owner: {...}, ... }

PATCH /deals/:id
Body: { stage?, value?, probability?, ... }
Response: { id, title, ... }

DELETE /deals/:id
Response: { success: true }

GET /deals/pipeline
Response: [
  {
    stage: "new_lead",
    count: 5,
    total: 750000,
    deals: [...]
  },
  ...
]
```

### Projects (Auth Required)

```
GET /projects?page=1&limit=10&search=&status=active&clientId=1&pmId=1
Response: { data: [], meta: {...} }

POST /projects
Body: {
  code: "ABC001" (unique),
  name, description?,
  clientId, pmId,
  status: "planning|active|on_hold|in_review|uat|completed|archived",
  startDate, endDate?,
  budget?
}
Response: { id, code, name, status, ... }

GET /projects/:id
Response: { id, code, name, client: {...}, pm: {...}, ... }

PATCH /projects/:id
Body: { status?, endDate?, budget?, ... }
Response: { id, code, name, ... }

DELETE /projects/:id
Response: { success: true }
```

### Tasks (Auth Required)

```
GET /tasks?page=1&limit=10&search=&status=todo&priority=high&projectId=1&assigneeId=1
Response: { data: [], meta: {...} }

POST /tasks
Body: {
  projectId, title, description?,
  assigneeId?,
  status: "todo|in_progress|review|done",
  priority: "low|medium|high|critical",
  dueDate?
}
Response: { id, title, status, priority, ... }

GET /tasks/:id
Response: { id, title, project: {...}, assignee: {...}, ... }

PATCH /tasks/:id
Body: { status?, assigneeId?, priority?, dueDate?, ... }
Response: { id, title, ... }

DELETE /tasks/:id
Response: { success: true }
```

### Requirements (Auth Required) - Signature Feature

```
GET /requirements?page=1&limit=10&search=&status=approved&priority=high&projectId=1
Response: { data: [], meta: {...} }

POST /requirements
Body: {
  projectId, title, description,
  priority: "low|medium|high|critical",
  status: "draft|submitted|clarification|approved|rejected|implemented"
}
Response: { 
  id, code: "REQ-ABC001-001", title, 
  status, currentVersion: 1, 
  versions: [{versionNumber, title, body, ...}],
  ...
}

GET /requirements/:id
Response: { 
  id, code, title, 
  versions: [{all version history}],
  ...
}

PATCH /requirements/:id
Body: { status?, priority?, ... }
Response: { id, code, status, ... }

DELETE /requirements/:id
Response: { success: true }

GET /requirements/:id/versions
Response: { data: [{versionNumber, title, body, createdBy, changeNotes}] }

POST /requirements/:id/versions
Body: { title, body, changeNotes? }
Response: { versionNumber, title, body, ... }

POST /requirements/:id/approve
Response: { id, code, status: "approved", ... }
```

### Invoices (Auth Required)

```
GET /invoices?page=1&limit=10&search=&status=sent&clientId=1&projectId=1
Response: { data: [], meta: {...} }

POST /invoices
Body: {
  clientId, projectId?,
  amount, description?,
  issueDate, dueDate,
  status: "draft|sent|partially_paid|paid|overdue|cancelled"
}
Response: { number: "INV-2026-00001", amount, status, ... }

GET /invoices/:id
Response: { number, amount, status, client: {...}, ... }

PATCH /invoices/:id
Body: { status?, amount?, dueDate?, ... }
Response: { number, status, ... }

DELETE /invoices/:id
Response: { success: true }
```

### Tickets (Auth Required)

```
GET /tickets?page=1&limit=10&search=&status=open&priority=high&projectId=1&assignedTo=1
Response: { data: [], meta: {...} }

POST /tickets
Body: {
  projectId, clientId?,
  title, description,
  priority: "low|medium|high|urgent",
  status: "open|in_progress|pending|resolved|closed",
  assignedTo?
}
Response: { number: "TKT-ABC001-0001", title, status, ... }

GET /tickets/:id
Response: { number, title, project: {...}, creator: {...}, ... }

PATCH /tickets/:id
Body: { status?, assignedTo?, priority?, ... }
Response: { number, status, ... }

DELETE /tickets/:id
Response: { success: true }
```

## 📊 Query Parameters

### Pagination
```
?page=1        # Default: 1
&limit=10      # Default: 10, Max: 100
```

### Filtering & Search
```
?search=query           # Search across relevant fields
&status=value           # Filter by status
&priority=value         # Filter by priority
&clientId=1             # Filter by client ID
&projectId=1            # Filter by project ID
&ownerId=1              # Filter by owner ID
&assigneeId=1           # Filter by assignee ID
```

## ✅ Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* entity data */ }
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Items retrieved",
  "data": [/* array of entities */],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "errors": [/* detailed errors if validation */]
}
```

## 🔒 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Server Error |

## 🧪 Example Requests

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@devflow.com","password":"Password@123"}'
```

### Create Lead
```bash
curl -X POST http://localhost:5000/api/v1/leads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-415-555-0001",
    "source": "website",
    "score": 80,
    "notes": "Potential customer"
  }'
```

### Get Pipeline
```bash
curl -X GET http://localhost:5000/api/v1/deals/pipeline \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Requirement Version
```bash
curl -X POST http://localhost:5000/api/v1/requirements/1/versions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated requirement",
    "body": "Detailed description",
    "changeNotes": "Added new features"
  }'
```

## 🚨 Common Errors

### 401 Unauthorized
- Missing Authorization header
- Invalid or expired token
- Solution: Login again and get fresh token

### 403 Forbidden
- User doesn't have permission for this action
- Insufficient role/permissions
- Solution: Check user role and operation permissions

### 400 Bad Request
- Validation error in request body
- Missing required fields
- Solution: Check error details in response

### 404 Not Found
- Resource doesn't exist
- Invalid ID provided
- Solution: Verify the resource ID exists

---

**For full API documentation, see README.md**
**Last Updated:** September 2026
