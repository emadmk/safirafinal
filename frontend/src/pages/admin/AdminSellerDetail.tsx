import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Users, DollarSign,
  CheckCircle, Clock, AlertCircle, User, Mail, Phone,
  MapPin, Calendar, Monitor
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../lib/api'

interface UserDetail {
  id: string
  email: string
  name: string
  phone: string | null
  location: string
  registeredAt: string
  firstVisit: string | null
  lastActivity: string | null
  device: string | null
  browser: string | null
  source: string
  status: 'registered' | 'pending_payment' | 'invested'
  totalInvestments: number
  finishedInvestments: number
  pendingInvestments: number
  totalInvested: number
  commissionEarned: number
  investments: {
    id: string
    amount: number
    paymentStatus: string
    productionStatus: string
    createdAt: string
    paidAt: string | null
  }[]
}

interface SellerData {
  referralCode: string
  summary: {
    totalUsers: number
    totalFinishedInvestments: number
    totalPendingInvestments: number
    totalRevenue: number
    totalCommission: number
    byStatus: {
      registered: number
      pending_payment: number
      invested: number
    }
    bySource: { source: string; count: number }[]
    byEvent: { event: string; count: number }[]
  }
  users: UserDetail[]
}

const AdminSellerDetail = () => {
  const { code } = useParams<{ code: string }>()
  const [data, setData] = useState<SellerData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  useEffect(() => {
    fetchSellerData()
  }, [code])

  const fetchSellerData = async () => {
    try {
      const response = await api.get(`/admin/sellers?code=${code}`)
      setData(response.data)
    } catch {
      toast.error('Failed to load seller details')
    }
    setIsLoading(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'invested':
        return (
          <span className="px-2 py-1 bg-green-400/10 text-green-400 rounded-full text-xs flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Paid
          </span>
        )
      case 'pending_payment':
        return (
          <span className="px-2 py-1 bg-yellow-400/10 text-yellow-400 rounded-full text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 bg-gray-400/10 text-gray-400 rounded-full text-xs flex items-center gap-1">
            <User className="w-3 h-3" />
            Registered
          </span>
        )
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      FINISHED: 'bg-green-400/10 text-green-400',
      PENDING: 'bg-yellow-400/10 text-yellow-400',
      CONFIRMING: 'bg-blue-400/10 text-blue-400',
      CONFIRMED: 'bg-blue-400/10 text-blue-400',
      FAILED: 'bg-red-400/10 text-red-400',
      EXPIRED: 'bg-red-400/10 text-red-400',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[status] || 'bg-gray-400/10 text-gray-400'}`}>
        {status}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="card animate-pulse h-32" />
        <div className="card animate-pulse h-64" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-white">Seller not found</p>
        <Link to="/admin/sellers" className="text-primary-400 hover:underline mt-2 inline-block">
          Back to Sellers
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/sellers" className="p-2 hover:bg-dark-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Seller Details</h1>
          <p className="text-primary-400 font-mono">{data.referralCode}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Users', value: data.summary.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Registered Only', value: data.summary.byStatus.registered, icon: User, color: 'text-gray-400', bg: 'bg-gray-400/10' },
          { label: 'Pending Payment', value: data.summary.byStatus.pending_payment, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Paid (Finished)', value: data.summary.byStatus.invested, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Commission Earned', value: `$${data.summary.totalCommission}`, icon: DollarSign, color: 'text-primary-400', bg: 'bg-primary-400/10' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-gray-400 text-xs">{stat.label}</p>
            <p className="text-xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Source & Events Breakdown */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* By Source */}
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 className="text-lg font-bold text-white mb-4">Traffic by Source</h3>
          <div className="space-y-2">
            {data.summary.bySource.length > 0 ? (
              data.summary.bySource.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-dark-700/50 rounded-lg">
                  <span className="text-gray-300 capitalize">{s.source || 'Direct'}</span>
                  <span className="text-primary-400 font-bold">{s.count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No source data</p>
            )}
          </div>
        </motion.div>

        {/* By Event */}
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 className="text-lg font-bold text-white mb-4">Events Breakdown</h3>
          <div className="space-y-2">
            {data.summary.byEvent.length > 0 ? (
              data.summary.byEvent.map((e, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-dark-700/50 rounded-lg">
                  <span className="text-gray-300">{e.event}</span>
                  <span className="text-primary-400 font-bold">{e.count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No event data</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Users Table */}
      <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h3 className="text-lg font-bold text-white mb-4">
          Users from this Referral ({data.users.length})
        </h3>

        {data.users.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No users have registered from this referral yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-primary-400/10">
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Source</th>
                  <th className="pb-3 pr-4">Registered</th>
                  <th className="pb-3 pr-4">Investments</th>
                  <th className="pb-3 pr-4">Paid</th>
                  <th className="pb-3 pr-4">Commission</th>
                  <th className="pb-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user) => (
                  <>
                    <tr
                      key={user.id}
                      className="border-b border-primary-400/5 hover:bg-dark-700/50 cursor-pointer"
                      onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-400/10 flex items-center justify-center">
                            <span className="text-primary-400 font-bold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-gray-500 text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">{getStatusBadge(user.status)}</td>
                      <td className="py-3 pr-4">
                        <span className="text-gray-400 capitalize">{user.source}</span>
                      </td>
                      <td className="py-3 pr-4 text-gray-400 text-sm">
                        {format(new Date(user.registeredAt), 'MMM dd, HH:mm')}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-white">{user.totalInvestments}</span>
                        {user.pendingInvestments > 0 && (
                          <span className="text-yellow-400 text-xs ml-1">
                            ({user.pendingInvestments} pending)
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-green-400 font-bold">
                          ${user.totalInvested}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={user.commissionEarned > 0 ? 'text-primary-400 font-bold' : 'text-gray-500'}>
                          ${user.commissionEarned}
                        </span>
                      </td>
                      <td className="py-3">
                        <button className="text-primary-400 hover:text-primary-300 text-sm">
                          {expandedUser === user.id ? 'Hide' : 'Show'}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Details */}
                    {expandedUser === user.id && (
                      <tr>
                        <td colSpan={8} className="bg-dark-800/50 p-4">
                          <div className="grid md:grid-cols-3 gap-4">
                            {/* User Info */}
                            <div className="space-y-3">
                              <h4 className="text-white font-medium mb-2">User Info</h4>
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-400">{user.email}</span>
                              </div>
                              {user.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-400">{user.phone}</span>
                                </div>
                              )}
                              {user.location && (
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-400">{user.location}</span>
                                </div>
                              )}
                            </div>

                            {/* Activity */}
                            <div className="space-y-3">
                              <h4 className="text-white font-medium mb-2">Activity</h4>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-400">
                                  First visit: {user.firstVisit ? format(new Date(user.firstVisit), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-400">
                                  Last activity: {user.lastActivity ? format(new Date(user.lastActivity), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Monitor className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-400">
                                  {user.device || 'Unknown'} / {user.browser || 'Unknown'}
                                </span>
                              </div>
                            </div>

                            {/* Investments */}
                            <div>
                              <h4 className="text-white font-medium mb-2">Investments</h4>
                              {user.investments.length > 0 ? (
                                <div className="space-y-2">
                                  {user.investments.map((inv, idx) => (
                                    <div key={idx} className="p-2 bg-dark-700 rounded-lg text-sm">
                                      <div className="flex items-center justify-between">
                                        <span className="text-white">${inv.amount}</span>
                                        {getPaymentStatusBadge(inv.paymentStatus)}
                                      </div>
                                      <div className="text-gray-500 text-xs mt-1">
                                        Created: {format(new Date(inv.createdAt), 'MMM dd, HH:mm')}
                                        {inv.paidAt && (
                                          <> | Paid: {format(new Date(inv.paidAt), 'MMM dd, HH:mm')}</>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500 text-sm">No investments yet</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Referral Links */}
      <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h3 className="text-lg font-bold text-white mb-4">Referral Links</h3>
        <div className="space-y-2">
          {[
            { name: 'General', url: `https://safiralux.com/invest?ref=${data.referralCode}&utm_source=${data.referralCode}` },
            { name: 'Instagram', url: `https://safiralux.com/invest?ref=${data.referralCode}&utm_source=${data.referralCode}&utm_medium=instagram` },
            { name: 'TikTok', url: `https://safiralux.com/invest?ref=${data.referralCode}&utm_source=${data.referralCode}&utm_medium=tiktok` },
            { name: 'YouTube', url: `https://safiralux.com/invest?ref=${data.referralCode}&utm_source=${data.referralCode}&utm_medium=youtube` },
            { name: 'Twitter', url: `https://safiralux.com/invest?ref=${data.referralCode}&utm_source=${data.referralCode}&utm_medium=twitter` },
            { name: 'Facebook', url: `https://safiralux.com/invest?ref=${data.referralCode}&utm_source=${data.referralCode}&utm_medium=facebook` },
          ].map((link, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
              <span className="text-white font-medium">{link.name}</span>
              <div className="flex items-center gap-2">
                <code className="text-xs text-gray-400 bg-dark-600 px-2 py-1 rounded max-w-md truncate">
                  {link.url}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(link.url)
                    toast.success('Link copied!')
                  }}
                  className="px-3 py-1 bg-primary-400/10 text-primary-400 rounded text-sm hover:bg-primary-400/20"
                >
                  Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default AdminSellerDetail
