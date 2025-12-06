import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Eye, TrendingUp, DollarSign, CheckCircle, Clock, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../lib/api'

interface Seller {
  referralCode: string
  totalEvents: number
  pageViews: number
  uniqueVisitors: number
  signups: number
  investmentClicks: number
  referredUsers: number
  finishedInvestments: number
  pendingInvestments: number
  conversions: number
  conversionRate: string
  slotsUsed: number
  slotsTotal: number
  commissionEarned: number
  pendingCommission: number
  status: 'ready_payout' | 'active' | 'pending'
  firstActivity: string
  lastActivity: string
}

interface Totals {
  totalSellers: number
  totalPageViews: number
  totalUniqueVisitors: number
  totalConversions: number
  totalCommissionEarned: number
  totalPendingCommission: number
  sellersReadyForPayout: number
}

const AdminSellers = () => {
  const navigate = useNavigate()
  const [sellers, setSellers] = useState<Seller[]>([])
  const [totals, setTotals] = useState<Totals | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSellers()
  }, [])

  const fetchSellers = async () => {
    try {
      const response = await api.get('/admin/sellers')
      setSellers(response.data.sellers)
      setTotals(response.data.totals)
    } catch {
      toast.error('Failed to load sellers')
    }
    setIsLoading(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready_payout':
        return (
          <span className="px-2 py-1 bg-green-400/10 text-green-400 rounded-full text-xs flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Ready for Payout
          </span>
        )
      case 'active':
        return (
          <span className="px-2 py-1 bg-blue-400/10 text-blue-400 rounded-full text-xs flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Active
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 bg-gray-400/10 text-gray-400 rounded-full text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="card animate-pulse h-24" />)}
        </div>
        <div className="card animate-pulse h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Sellers / Influencers</h1>
        <p className="text-gray-400">Track performance and commissions for referral partners</p>
      </div>

      {/* Summary Stats */}
      {totals && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Sellers', value: totals.totalSellers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Total Visitors', value: totals.totalUniqueVisitors, icon: Eye, color: 'text-green-400', bg: 'bg-green-400/10' },
            { label: 'Paid Conversions', value: totals.totalConversions, icon: TrendingUp, color: 'text-primary-400', bg: 'bg-primary-400/10' },
            { label: 'Commission Earned', value: `$${totals.totalCommissionEarned}`, icon: DollarSign, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Payout Alert */}
      {totals && totals.sellersReadyForPayout > 0 && (
        <motion.div
          className="card bg-green-400/10 border-green-400/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div>
              <p className="text-white font-medium">
                {totals.sellersReadyForPayout} seller{totals.sellersReadyForPayout > 1 ? 's' : ''} ready for payout
              </p>
              <p className="text-gray-400 text-sm">
                Total pending: ${totals.totalCommissionEarned}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sellers Table */}
      <motion.div
        className="card overflow-x-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-bold text-white mb-4">All Sellers</h3>
        {sellers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No sellers found</p>
            <p className="text-gray-500 text-sm">Sellers will appear here when visitors come from referral links</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-primary-400/10">
                <th className="pb-3 pr-4">Referral Code</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Users</th>
                <th className="pb-3 pr-4">Visitors</th>
                <th className="pb-3 pr-4">Paid</th>
                <th className="pb-3 pr-4">Pending</th>
                <th className="pb-3 pr-4">Commission</th>
                <th className="pb-3 pr-4">Last Active</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller, i) => (
                <motion.tr
                  key={seller.referralCode}
                  className="border-b border-primary-400/5 hover:bg-dark-700/50 cursor-pointer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/admin/sellers/${seller.referralCode}`)}
                >
                  <td className="py-3 pr-4">
                    <span className="text-white font-mono text-sm">{seller.referralCode}</span>
                  </td>
                  <td className="py-3 pr-4">{getStatusBadge(seller.status)}</td>
                  <td className="py-3 pr-4">
                    <span className="text-white">{seller.referredUsers}</span>
                  </td>
                  <td className="py-3 pr-4 text-gray-300">{seller.uniqueVisitors}</td>
                  <td className="py-3 pr-4">
                    <span className="text-green-400 font-bold">{seller.finishedInvestments}</span>
                  </td>
                  <td className="py-3 pr-4">
                    {seller.pendingInvestments > 0 ? (
                      <span className="text-yellow-400">{seller.pendingInvestments}</span>
                    ) : (
                      <span className="text-gray-500">0</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-green-400 font-bold">${seller.commissionEarned}</span>
                  </td>
                  <td className="py-3 pr-4 text-gray-500 text-sm">
                    {seller.lastActivity ? format(new Date(seller.lastActivity), 'MMM dd, HH:mm') : '-'}
                  </td>
                  <td className="py-3">
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  )
}

export default AdminSellers
