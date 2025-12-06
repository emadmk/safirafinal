import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Eye, TrendingUp, DollarSign, CheckCircle, Clock, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../lib/api'

interface Seller {
  referralCode: string
  totalEvents: number
  pageViews: number
  uniqueVisitors: number
  signups: number
  investments: number
  purchases: number
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
  const [sellers, setSellers] = useState<Seller[]>([])
  const [totals, setTotals] = useState<Totals | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)

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
            { label: 'Total Conversions', value: totals.totalConversions, icon: TrendingUp, color: 'text-primary-400', bg: 'bg-primary-400/10' },
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
                <th className="pb-3 pr-4">Visitors</th>
                <th className="pb-3 pr-4">Conversions</th>
                <th className="pb-3 pr-4">Rate</th>
                <th className="pb-3 pr-4">Slots</th>
                <th className="pb-3 pr-4">Commission</th>
                <th className="pb-3">Last Active</th>
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
                  onClick={() => setSelectedSeller(seller)}
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono text-sm">{seller.referralCode}</span>
                      <ExternalLink className="w-3 h-3 text-gray-500" />
                    </div>
                  </td>
                  <td className="py-3 pr-4">{getStatusBadge(seller.status)}</td>
                  <td className="py-3 pr-4 text-gray-300">{seller.uniqueVisitors}</td>
                  <td className="py-3 pr-4">
                    <span className="text-primary-400 font-bold">{seller.conversions}</span>
                    <span className="text-gray-500 text-sm ml-1">
                      ({seller.investments}inv + {seller.purchases}pur)
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-300">{seller.conversionRate}%</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-dark-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-400 rounded-full"
                          style={{ width: `${(seller.slotsUsed / seller.slotsTotal) * 100}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-sm">{seller.slotsUsed}/{seller.slotsTotal}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-green-400 font-bold">${seller.commissionEarned}</span>
                    {seller.pendingCommission > 0 && (
                      <span className="text-gray-500 text-sm ml-1">(+${seller.pendingCommission})</span>
                    )}
                  </td>
                  <td className="py-3 text-gray-500 text-sm">
                    {seller.lastActivity ? format(new Date(seller.lastActivity), 'MMM dd, HH:mm') : '-'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Seller Detail Modal */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="card max-w-lg w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Seller Details</h3>
              <button
                onClick={() => setSelectedSeller(null)}
                className="text-gray-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-dark-700/50 rounded-xl">
                <p className="text-gray-400 text-sm mb-1">Referral Code</p>
                <p className="text-white font-mono text-lg">{selectedSeller.referralCode}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-dark-700/50 rounded-xl">
                  <p className="text-gray-400 text-sm mb-1">Page Views</p>
                  <p className="text-2xl font-bold text-white">{selectedSeller.pageViews}</p>
                </div>
                <div className="p-4 bg-dark-700/50 rounded-xl">
                  <p className="text-gray-400 text-sm mb-1">Unique Visitors</p>
                  <p className="text-2xl font-bold text-white">{selectedSeller.uniqueVisitors}</p>
                </div>
                <div className="p-4 bg-dark-700/50 rounded-xl">
                  <p className="text-gray-400 text-sm mb-1">Sign Ups</p>
                  <p className="text-2xl font-bold text-white">{selectedSeller.signups}</p>
                </div>
                <div className="p-4 bg-dark-700/50 rounded-xl">
                  <p className="text-gray-400 text-sm mb-1">Conversions</p>
                  <p className="text-2xl font-bold text-primary-400">{selectedSeller.conversions}</p>
                </div>
              </div>

              <div className="p-4 bg-dark-700/50 rounded-xl">
                <p className="text-gray-400 text-sm mb-2">Slot Progress</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-dark-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-400 rounded-full transition-all"
                      style={{ width: `${(selectedSeller.slotsUsed / selectedSeller.slotsTotal) * 100}%` }}
                    />
                  </div>
                  <span className="text-white font-bold">{selectedSeller.slotsUsed}/{selectedSeller.slotsTotal}</span>
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  {selectedSeller.slotsUsed >= 20
                    ? 'All slots filled - ready for $800 payout!'
                    : `${20 - selectedSeller.slotsUsed} more conversions needed for payout`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-400/10 rounded-xl">
                  <p className="text-gray-400 text-sm mb-1">Commission Earned</p>
                  <p className="text-2xl font-bold text-green-400">${selectedSeller.commissionEarned}</p>
                </div>
                <div className="p-4 bg-blue-400/10 rounded-xl">
                  <p className="text-gray-400 text-sm mb-1">Pending Next Cycle</p>
                  <p className="text-2xl font-bold text-blue-400">${selectedSeller.pendingCommission}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">First Activity</p>
                  <p className="text-white">
                    {selectedSeller.firstActivity
                      ? format(new Date(selectedSeller.firstActivity), 'MMM dd, yyyy HH:mm')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Last Activity</p>
                  <p className="text-white">
                    {selectedSeller.lastActivity
                      ? format(new Date(selectedSeller.lastActivity), 'MMM dd, yyyy HH:mm')
                      : '-'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedSeller(null)}
              className="w-full mt-6 btn-secondary"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminSellers
