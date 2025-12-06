import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Gem,
  LayoutDashboard,
  TrendingUp,
  User,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/dashboard/investments', icon: TrendingUp, label: 'My Investments' },
  { path: '/dashboard/profile', icon: User, label: 'Profile' },
  { path: '/dashboard/tickets', icon: MessageSquare, label: 'Support' },
]

const DashboardLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-primary-400/10">
        <div className="flex items-center justify-between px-4 h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Gem className="w-8 h-8 text-primary-400" />
            <span className="text-xl font-serif font-bold gold-text">SAFIRA</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-400 hover:text-primary-400"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-dark-800 border-r border-primary-400/10 transform transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="hidden lg:flex items-center space-x-2 px-6 h-20 border-b border-primary-400/10">
            <Link to="/" className="flex items-center space-x-2">
              <Gem className="w-8 h-8 text-primary-400" />
              <span className="text-xl font-serif font-bold gold-text">SAFIRA</span>
            </Link>
          </div>

          {/* User Info */}
          <div className="px-6 py-6 border-b border-primary-400/10 mt-16 lg:mt-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary-400/10 flex items-center justify-center">
                <span className="text-primary-400 font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-gray-400 text-sm truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-400/10 text-primary-400'
                      : 'text-gray-400 hover:bg-dark-700 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              )
            })}
          </nav>

          {/* Admin Link */}
          {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
            <div className="px-4 py-2 border-t border-primary-400/10">
              <Link
                to="/admin"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-primary-400 hover:bg-primary-400/10 transition-colors"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Admin Panel</span>
              </Link>
            </div>
          )}

          {/* Logout */}
          <div className="px-4 py-4 border-t border-primary-400/10">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:bg-dark-700 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
