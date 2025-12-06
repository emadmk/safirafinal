import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const AdminPayments = () => {
  const [logs, setLogs] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchPayments()
  }, [statusFilter])

  const fetchPayments = async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : ''
      const response = await api.get(`/admin/payments${params}`)
      setLogs(response.data.logs)
      setStats(response.data.stats)
    } catch {
      toast.error('Failed to load payments')
    }
    setIsLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'finished': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'waiting': return <Clock className="w-5 h-5 text-yellow-400" />
      case 'confirming': return <AlertCircle className="w-5 h-5 text-blue-400" />
      case 'failed':
      case 'expired': return <XCircle className="w-5 h-5 text-red-400" />
      default: return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Payments</h1>
        <p className="text-gray-400">NowPayment transaction logs</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Pending', value: stats.pending, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
            { label: 'Confirming', value: stats.confirming, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Finished', value: stats.finished, color: 'text-green-400', bg: 'bg-green-400/10' },
            { label: 'Failed', value: stats.failed, color: 'text-red-400', bg: 'bg-red-400/10' },
            { label: 'Expired', value: stats.expired, color: 'text-gray-400', bg: 'bg-gray-400/10' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="card text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="waiting">Waiting</option>
          <option value="confirming">Confirming</option>
          <option value="finished">Finished</option>
          <option value="failed">Failed</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <motion.div className="card overflow-x-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 text-sm border-b border-primary-400/10">
              <th className="pb-3">Status</th>
              <th className="pb-3">Payment ID</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Order ID</th>
              <th className="pb-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="py-8 text-center text-gray-400">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-gray-400">No payment logs</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-primary-400/5">
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(log.paymentStatus)}
                      <span className="text-white capitalize">{log.paymentStatus}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <code className="text-primary-400 text-sm">{log.nowPaymentId || '-'}</code>
                  </td>
                  <td className="py-3 text-gray-400 capitalize">{log.payType || '-'}</td>
                  <td className="py-3 text-gray-400 text-sm">{log.relatedId || '-'}</td>
                  <td className="py-3 text-gray-400">{format(new Date(log.createdAt), 'MMM dd, HH:mm')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}

export default AdminPayments
