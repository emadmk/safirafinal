import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users,
  TrendingUp,
  DollarSign,
  Package,
  MessageSquare,
  Clock,
  CheckCircle,
  ArrowRight,
  Eye,
  LogIn,
  CreditCard,
  UserCheck,
  Download
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'

interface DashboardStats {
  totalUsers: number
  totalInvestments: number
  payments: { pending: number; confirming: number; finished: number }
  production: { inProduction: number; completed: number }
  sales: { active: number; sold: number }
  totalProducts: number
  openTickets: number
  totalRevenue: number
  investmentsThisMonth: number
  pageViews?: number
  loginClicks?: number
  paymentClicks?: number
  totalSellers?: number
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentInvestments, setRecentInvestments] = useState<any[]>([])
  const [sellers, setSellers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/admin/dashboard')
      setStats(response.data.stats)
      setRecentInvestments(response.data.recentInvestments || [])
      setSellers(response.data.sellers || [])
    } catch {
      toast.error('Failed to load dashboard')
    }
    setIsLoading(false)
  }

  const exportUsers = async () => {
    setExporting(true)
    try {
      const response = await api.get('/admin/users/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `users-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Export completed!')
    } catch {
      toast.error('Failed to export users')
    }
    setExporting(false)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="card animate-pulse">
            <div className="h-20 bg-dark-700 rounded" />
          </div>
        ))}
      </div>
    )
  }

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats?.totalUsers || 0, color: 'text-blue-400', bg: 'bg-blue-400/10', link: '/admin/users' },
    { icon: TrendingUp, label: 'Investments', value: stats?.totalInvestments || 0, color: 'text-primary-400', bg: 'bg-primary-400/10', link: '/admin/investments' },
    { icon: DollarSign, label: 'Revenue', value: `$${stats?.totalRevenue || 0}`, color: 'text-green-400', bg: 'bg-green-400/10', link: '/admin/payments' },
    { icon: Package, label: 'Products', value: stats?.totalProducts || 0, color: 'text-purple-400', bg: 'bg-purple-400/10', link: '/admin/products' },
    { icon: Clock, label: 'Pending Payments', value: stats?.payments.pending || 0, color: 'text-yellow-400', bg: 'bg-yellow-400/10', link: '/admin/payments' },
    { icon: CheckCircle, label: 'Completed', value: stats?.payments.finished || 0, color: 'text-green-400', bg: 'bg-green-400/10', link: '/admin/payments' },
    { icon: MessageSquare, label: 'Open Tickets', value: stats?.openTickets || 0, color: 'text-red-400', bg: 'bg-red-400/10', link: '/admin/tickets' },
    { icon: TrendingUp, label: 'This Month', value: stats?.investmentsThisMonth || 0, color: 'text-primary-400', bg: 'bg-primary-400/10', link: '/admin/investments' },
  ]

  const trackingCards = [
    { icon: Eye, label: 'Page Views', value: stats?.pageViews || 0, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { icon: LogIn, label: 'Login Clicks', value: stats?.loginClicks || 0, color: 'text-green-400', bg: 'bg-green-400/10' },
    { icon: CreditCard, label: 'Payment Clicks', value: stats?.paymentClicks || 0, color: 'text-primary-400', bg: 'bg-primary-400/10' },
    { icon: UserCheck, label: 'Total Sellers', value: stats?.totalSellers || 0, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Overview of your platform</p>
        </div>
        <button
          onClick={exportUsers}
          disabled={exporting}
          className="btn-secondary flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          {exporting ? 'Exporting...' : 'Export Users'}
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Link to={stat.link} key={i}>
            <motion.div
              className="card hover:border-primary-400/40 cursor-pointer transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Tracking Stats */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Analytics Overview</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {trackingCards.map((stat, i) => (
            <motion.div
              key={i}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 + 0.2 }}
            >
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { to: '/admin/investments', label: 'Manage Investments', icon: TrendingUp },
          { to: '/admin/products', label: 'Manage Products', icon: Package },
          { to: '/admin/tickets', label: 'View Tickets', icon: MessageSquare },
          { to: '/admin/tracking', label: 'View Analytics', icon: Eye },
        ].map((link, i) => (
          <Link
            key={i}
            to={link.to}
            className="card flex items-center justify-between hover:border-primary-400/40"
          >
            <div className="flex items-center space-x-3">
              <link.icon className="w-5 h-5 text-primary-400" />
              <span className="text-white">{link.label}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </Link>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Investments */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Recent Investments</h3>
            <Link to="/admin/investments" className="text-primary-400 text-sm">View All</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-primary-400/10">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInvestments.slice(0, 5).map((inv) => (
                  <tr key={inv.id} className="border-b border-primary-400/5">
                    <td className="py-3">
                      <p className="text-white">{inv.user?.firstName} {inv.user?.lastName}</p>
                    </td>
                    <td className="py-3 text-primary-400">${inv.userInvestment}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        inv.paymentStatus === 'FINISHED' ? 'text-green-400 bg-green-400/10' :
                        inv.paymentStatus === 'PENDING' ? 'text-yellow-400 bg-yellow-400/10' :
                        'text-gray-400 bg-gray-400/10'
                      }`}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Top Sellers */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Top Sellers (Affiliates)</h3>
            <Link to="/admin/tracking" className="text-primary-400 text-sm">View All</Link>
          </div>

          <div className="space-y-3">
            {sellers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No sellers yet</p>
            ) : (
              sellers.slice(0, 5).map((seller, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{seller.name || seller.referralCode}</p>
                    <p className="text-gray-500 text-sm">{seller.referralCode}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary-400 font-bold">{seller.sales || 0} sales</p>
                    <p className="text-gray-500 text-sm">{seller.visits || 0} visits</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminDashboard
