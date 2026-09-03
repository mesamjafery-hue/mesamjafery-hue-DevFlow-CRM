# 🚀 DevFlow CRM - Quick Start (5 Minutes)

## Step 1: Start Backend (Terminal 1)

```powershell
cd C:\Users\Meesam Abbas\DevFlow-CRM\server
npm run seed
npm run dev
```

**Expected Output:**
```
✓ Database synchronized successfully
✓ Server running on port 5000
```

## Step 2: Start Frontend (Terminal 2)

```powershell
cd C:\Users\Meesam Abbas\DevFlow-CRM\client
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready
Local: http://localhost:5173/
```

## Step 3: Open in Browser

Visit: `http://localhost:5173/`

## Step 4: Login

```
Email: admin@devflow.com
Password: Password@123
```

## ✅ You're In!

You should now see the Dashboard with:
- Welcome message
- Statistics cards
- Main menu (Leads, Deals, Projects, etc.)

---

## 🎯 What to Try

### 1. View Existing Data
- Go to **Leads** - See 3 demo leads
- Go to **Deals** - See 3 demo deals in pipeline
- Go to **Projects** - See 3 demo projects

### 2. Create Something New
- Click **Create Lead** button
- Fill in the form and submit
- See new lead appear in list

### 3. View Pipeline
- Go to **Deals**
- See deals grouped by stage
- Drag and drop to move between stages (coming soon)

### 4. Test Requirements
- Go to **Requirements**
- Click on a requirement to see versions
- See change history

### 5. Check Financial
- Go to **Invoices**
- See payment status
- View paid/unpaid invoices

---

## 🛠️ If Something Doesn't Work

### Backend Won't Start

```powershell
# 1. Make sure PostgreSQL is running
# 2. Check .env file exists in server folder
# 3. Try deleting database and re-seeding:
```

Go to PostgreSQL and run:
```sql
DROP DATABASE IF EXISTS devflow_crm;
```

Then run in server folder:
```
npm run seed
npm run dev
```

### Frontend Won't Load

```powershell
# 1. Clear browser cache (Ctrl+Shift+Delete)
# 2. Try localhost:5173 in incognito mode
# 3. Check backend is running on port 5000
```

### Port Already in Use

```powershell
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

---

## 📚 Full Documentation

- **README.md** - Project overview
- **SETUP_GUIDE.md** - Detailed setup
- **API_REFERENCE.md** - All API endpoints
- **IMPLEMENTATION_SUMMARY.md** - Complete feature list

---

## 💡 Quick Tips

**Demo Users** (all use password: `Password@123`)
- admin@devflow.com - Super Admin
- sales@devflow.com - Sales person
- john@devflow.com - Project Manager
- accounts@devflow.com - Finance

**API Testing**
```bash
# Get all leads
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/v1/leads
```

**Common Actions**
- Login → Dashboard visible
- Click menu items to navigate
- Logout removes token from storage
- Refresh page keeps you logged in

---

**Ready? Start with Step 1 above! 🎉**
