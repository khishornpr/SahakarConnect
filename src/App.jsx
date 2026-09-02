import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { I18nProvider } from './context/I18nContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import VerifyPin from './pages/auth/VerifyPin'
import ResetPassword from './pages/auth/ResetPassword'
import EmailConfirmation from './pages/auth/EmailConfirmation'
import Unauthorized from './pages/Unauthorized'

// Worker Portal Pages
import WorkerDashboard from './pages/worker/Dashboard'
import WorkerJobs from './pages/worker/Jobs'
import WorkerEarnings from './pages/worker/Earnings'
import WorkerProfile from './pages/worker/Profile'
import WorkerWelfare from './pages/worker/Welfare'

// Household Portal Pages
import HouseholdDashboard from './pages/household/Dashboard'
import HouseholdBookService from './pages/household/BookService'
import HouseholdBookings from './pages/household/Bookings'
import HouseholdInvoices from './pages/household/Invoices'

// Cooperative Federation Admin Pages
import CooperativeDashboard from './pages/cooperative/Dashboard'
import CooperativeWorkers from './pages/cooperative/Workers'
import CooperativeDispatch from './pages/cooperative/Dispatch'
import CooperativeFinancials from './pages/cooperative/Financials'
import CooperativeDemandForecast from './pages/cooperative/DemandForecast'

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
  }
  return <Navigate to={redirects[profile.role] || '/worker/dashboard'} />
}

function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <HashRouter>
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

              {/* Fallback to root */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </HashRouter>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}

export default App
