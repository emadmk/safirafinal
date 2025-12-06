import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, Users, Eye, TrendingUp, ShoppingCart } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const AdminTracking = () => {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTracking()
  }, [])

  const fetchTracking = async () => {
    try {
      const response = await api.get('/admin/tracking')
      setData(response.data)
    } catch {
      toast.error('Failed to load analytics')
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="card animate-pulse h-24" />)}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-gray-400">Track visitor and conversion data</p>
      </div>

      {/* Funnel */}
      {data?.funnel && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Page Views', value: data.funnel.visits, icon: Eye, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Sign Ups', value: data.funnel.signups, icon: Users, color: 'text-green-400', bg: 'bg-green-400/10' },
            { label: 'Investments', value: data.funnel.investments, icon: TrendingUp, color: 'text-primary-400', bg: 'bg-primary-400/10' },
            { label: 'Purchases', value: data.funnel.purchases, icon: ShoppingCart, color: 'text-purple-400', bg: 'bg-purple-400/10' },
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

      {/* Conversion Rates */}
      {data?.funnel && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-bold text-white mb-4">Conversion Rates</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-4 bg-dark-700/50 rounded-xl">
              <p className="text-gray-400 text-sm mb-2">Visit to Signup</p>
              <p className="text-3xl font-bold text-primary-400">{data.funnel.signupRate}%</p>
            </div>
            <div className="p-4 bg-dark-700/50 rounded-xl">
              <p className="text-gray-400 text-sm mb-2">Signup to Investment</p>
              <p className="text-3xl font-bold text-green-400">{data.funnel.investmentRate}%</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Traffic Sources */}
      {data?.summary?.bySource && data.summary.bySource.length > 0 && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-bold text-white mb-4">Traffic Sources</h3>
          <div className="space-y-3">
            {data.summary.bySource.map((source: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                <span className="text-white">{source.source || 'Direct'}</span>
                <span className="text-primary-400 font-bold">{source.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Device Breakdown */}
      {data?.summary?.byDevice && data.summary.byDevice.length > 0 && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-bold text-white mb-4">Device Breakdown</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {data.summary.byDevice.map((device: any, i: number) => (
              <div key={i} className="text-center p-4 bg-dark-700/50 rounded-xl">
                <p className="text-2xl font-bold text-primary-400">{device.count}</p>
                <p className="text-gray-400 capitalize">{device.device || 'Unknown'}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Events */}
      {data?.recentEvents && data.recentEvents.length > 0 && (
        <motion.div
          className="card overflow-x-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-bold text-white mb-4">Recent Events</h3>
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-primary-400/10">
                <th className="pb-3">Event</th>
                <th className="pb-3">Source</th>
                <th className="pb-3">Device</th>
                <th className="pb-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {data.recentEvents.slice(0, 20).map((event: any) => (
                <tr key={event.id} className="border-b border-primary-400/5">
                  <td className="py-2 text-white">{event.eventType}</td>
                  <td className="py-2 text-gray-400">{event.utmSource || 'Direct'}</td>
                  <td className="py-2 text-gray-400 capitalize">{event.deviceType || '-'}</td>
                  <td className="py-2 text-gray-500 text-sm">{format(new Date(event.createdAt), 'MMM dd, HH:mm')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  )
}

export default AdminTracking
