import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Investments from './pages/Investments'
import InvestmentDetail from './pages/InvestmentDetail'
import Profile from './pages/Profile'
import Tickets from './pages/Tickets'
import Shop from './pages/Shop'
import Invest from './pages/Invest'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminInvestments from './pages/admin/AdminInvestments'
import AdminProducts from './pages/admin/AdminProducts'
import AdminUsers from './pages/admin/AdminUsers'
import AdminTickets from './pages/admin/AdminTickets'
import AdminPayments from './pages/admin/AdminPayments'
import AdminTracking from './pages/admin/AdminTracking'

// Layouts
import DashboardLayout from './components/layouts/DashboardLayout'
import AdminLayout from './components/layouts/AdminLayout'

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/invest" element={<Invest />} />

      {/* User Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="investments" element={<Investments />} />
        <Route path="investments/:id" element={<InvestmentDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="tickets" element={<Tickets />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="investments" element={<AdminInvestments />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="tickets" element={<AdminTickets />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="tracking" element={<AdminTracking />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
