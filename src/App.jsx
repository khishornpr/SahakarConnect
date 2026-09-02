import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { I18nProvider } from './context/I18nContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'

// Auth Pages (Lazy loaded)
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const VerifyPin = lazy(() => import('./pages/auth/VerifyPin'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))
const EmailConfirmation = lazy(() => import('./pages/auth/EmailConfirmation'))
const Unauthorized = lazy(() => import('./pages/Unauthorized'))

// Worker Portal Pages (Lazy loaded)
const WorkerDashboard = lazy(() => import('./pages/worker/Dashboard'))
const WorkerJobs = lazy(() => import('./pages/worker/Jobs'))
const WorkerEarnings = lazy(() => import('./pages/worker/Earnings'))
const WorkerProfile = lazy(() => import('./pages/worker/Profile'))
const WorkerWelfare = lazy(() => import('./pages/worker/Welfare'))
const WorkerComplaints = lazy(() => import('./pages/worker/Complaints'))
const WorkerLearning = lazy(() => import('./pages/worker/Learning'))

// Household Portal Pages (Lazy loaded)
const HouseholdDashboard = lazy(() => import('./pages/household/Dashboard'))
const HouseholdBookService = lazy(() => import('./pages/household/BookService'))
const HouseholdBookings = lazy(() => import('./pages/household/Bookings'))
const HouseholdInvoices = lazy(() => import('./pages/household/Invoices'))

// Cooperative Federation Admin Pages (Lazy loaded)
const CooperativeDashboard = lazy(() => import('./pages/cooperative/Dashboard'))
const CooperativeWorkers = lazy(() => import('./pages/cooperative/Workers'))
const CooperativeDispatch = lazy(() => import('./pages/cooperative/Dispatch'))
const CooperativeFinancials = lazy(() => import('./pages/cooperative/Financials'))
const CooperativeDemandForecast = lazy(() => import('./pages/cooperative/DemandForecast'))

// Labor Department Officer Portal Pages (Lazy loaded)
const OfficerDashboard = lazy(() => import('./pages/officer/Dashboard'))
const OfficerCases = lazy(() => import('./pages/officer/Cases'))

// Manager Portal Pages (Lazy loaded)
const ManagerDashboard = lazy(() => import('./pages/manager/Dashboard'))
const ManagerWorkers = lazy(() => import('./pages/manager/Workers'))
const ManagerReports = lazy(() => import('./pages/manager/Reports'))

function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full text-slate-400 text-xs">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#ff6b00] border-t-transparent rounded-full animate-spin"></div>
        <span className="font-semibold tracking-wide uppercase text-[11px] text-slate-400">Loading module...</span>
      </div>
    </div>
  )
}

function HomeRedirect() {
  const { profile, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Loading SahakarConnect Portal...
        </div>
      </div>
    )
  }
  if (!profile) return <Navigate to="/login" />
  const redirects = {
    worker: '/worker/dashboard',
    household: '/household/dashboard',
    cooperative: '/cooperative/dashboard',
    manager: '/manager/dashboard',
    officer: '/officer/dashboard',
    labor_officer: '/officer/dashboard',
    labor: '/officer/dashboard',
  }
  return <Navigate to={redirects[profile.role] || '/worker/dashboard'} />
}

function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <HashRouter>
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                <Route path="/" element={<HomeRedirect />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-pin" element={<VerifyPin />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth/confirm" element={<EmailConfirmation />} />
                <Route path="/verify-email" element={<EmailConfirmation />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* 1. Worker Portal */}
                <Route
                  path="/worker"
                  element={
                    <ProtectedRoute allowedRoles={['worker']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<WorkerDashboard />} />
                  <Route path="jobs" element={<WorkerJobs />} />
                  <Route path="earnings" element={<WorkerEarnings />} />
                  <Route path="profile" element={<WorkerProfile />} />
                  <Route path="welfare" element={<WorkerWelfare />} />
                  <Route path="complaints" element={<WorkerComplaints />} />
                  <Route path="learning" element={<WorkerLearning />} />
                </Route>

                {/* 2. Household Portal */}
                <Route
                  path="/household"
                  element={
                    <ProtectedRoute allowedRoles={['household']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<HouseholdDashboard />} />
                  <Route path="book" element={<HouseholdBookService />} />
                  <Route path="bookings" element={<HouseholdBookings />} />
                  <Route path="invoices" element={<HouseholdInvoices />} />
                </Route>

                {/* 3. Cooperative Federation Admin Portal */}
                <Route
                  path="/cooperative"
                  element={
                    <ProtectedRoute allowedRoles={['cooperative']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<CooperativeDashboard />} />
                  <Route path="workers" element={<CooperativeWorkers />} />
                  <Route path="dispatch" element={<CooperativeDispatch />} />
                  <Route path="financials" element={<CooperativeFinancials />} />
                  <Route path="demand-forecast" element={<CooperativeDemandForecast />} />
                </Route>

                {/* 4. Labor Department Officer Portal */}
                <Route
                  path="/officer"
                  element={
                    <ProtectedRoute allowedRoles={['officer', 'labor_officer', 'labor']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<OfficerDashboard />} />
                  <Route path="cases" element={<OfficerCases />} />
                </Route>

                {/* 5. Manager Portal */}
                <Route
                  path="/manager"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<ManagerDashboard />} />
                  <Route path="workers" element={<ManagerWorkers />} />
                  <Route path="reports" element={<ManagerReports />} />
                </Route>

                {/* Fallback to root */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </HashRouter>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}

export default App
