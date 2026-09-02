# Financial Analytics & Learning Dashboard

## Overview
A web-based Financial Analytics and Learning Dashboard with role-based access for Workers, Managers, Company Owners, and Labor Department Officers.

## Tech Stack
- **Frontend:** React (Vite) + Tailwind CSS + Recharts
- **Backend:** Supabase (PostgreSQL + Auth + REST API)
- **Hosting:** GitHub Pages (frontend) + Supabase Cloud (backend)
- **Routing:** HashRouter (GitHub Pages compatible)

## Project Structure
```
src/
├── App.jsx                    # Main router with role-based routes
├── main.jsx                   # Entry point
├── index.css                  # Tailwind CSS import
├── lib/
│   └── supabase.js           # Supabase client config
├── context/
│   └── AuthContext.jsx       # Auth state management
├── components/
│   ├── DashboardLayout.jsx   # Sidebar + content layout
│   ├── ProtectedRoute.jsx    # Role-based route guard
│   └── Sidebar.jsx           # Navigation sidebar
├── pages/
│   ├── auth/
│   │   ├── Login.jsx         # Login page
│   │   └── Register.jsx      # Registration with role selection
│   ├── Unauthorized.jsx      # 403 page
│   ├── worker/
│   │   ├── Dashboard.jsx     # Worker dashboard with charts
│   │   ├── Profile.jsx       # Personal profile
│   │   ├── Salary.jsx        # Salary & increment history
│   │   ├── Transactions.jsx  # Credit/debit transactions
│   │   ├── Complaints.jsx    # Raise & track complaints
│   │   └── Learning.jsx      # Learning content
│   ├── manager/
│   │   ├── Dashboard.jsx     # Manager overview with pie chart
│   │   ├── Workers.jsx       # Worker list management
│   │   ├── Payments.jsx      # Payment monitoring
│   │   ├── Reports.jsx       # Financial reports with line chart
│   │   └── Complaints.jsx    # Complaint monitoring
│   ├── owner/
│   │   ├── Dashboard.jsx     # Revenue/expense analytics
│   │   ├── Analytics.jsx     # Detailed analytics
│   │   ├── Expenses.jsx      # Equipment expense management
│   │   ├── Revenue.jsx       # Revenue & expense tracking
│   │   └── Reports.jsx       # Business reports (stacked bar)
│   └── labor/
│       ├── Dashboard.jsx     # Case statistics with pie chart
│       ├── Cases.jsx         # Case management with status actions
│       ├── Complaints.jsx    # Complaint review
│       └── Resolutions.jsx   # Resolution history
supabase/
└── migrations/
	└── 001_schema.sql        # Database schema + RLS policies
```

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- A Supabase account (free at https://supabase.com)

### 2. Supabase Setup
1. Create a new Supabase project
2. Go to SQL Editor and run `supabase/migrations/001_schema.sql`
3. Copy your project URL and anon key from Settings > API

### 3. Configure Environment
Edit `.env` file:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Locally
```bash
npm install
npm run dev
```
Open http://localhost:5173

### 5. Deploy to GitHub Pages
```bash
npm run deploy
```

## User Roles & Access

| Role | Portal | Capabilities |
|------|--------|-------------|
| Worker | `/worker/*` | View salary, transactions, raise complaints, learning |
| Manager | `/manager/*` | Monitor workers, payments, reports, complaints |
| Owner | `/owner/*` | Company-wide analytics, expenses, revenue tracking |
| Labor Officer | `/labor/*` | Case management, complaint resolution |

## Features Implemented
- ✅ Role-based authentication (Register/Login)
- ✅ Worker Dashboard (salary, credits, debits, overpaid, shortfall)
- ✅ Transaction management with filters (date, type, search)
- ✅ Complaint system (create, track, resolve)
- ✅ Manager financial reports with charts
- ✅ Owner revenue/expense analytics
- ✅ Labor case management with status workflow
- ✅ Learning dashboard
- ✅ Responsive design (Tailwind CSS)
- ✅ Charts (Recharts - Bar, Line, Pie)
- ✅ GitHub Pages deployment ready
