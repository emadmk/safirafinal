import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gift, ArrowRight, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { Investment } from '../types'

const Investments = () => {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchInvestments()
  }, [])

  const fetchInvestments = async () => {
    try {
      const response = await api.get('/investments')
      setInvestments(response.data.investments)
    } catch {
      toast.error('Failed to load investments')
    }
    setIsLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FINISHED':
      case 'COMPLETED':
        return 'text-green-400 bg-green-400/10'
      case 'IN_PRODUCTION':
      case 'ACTIVE':
        return 'text-blue-400 bg-blue-400/10'
      case 'PENDING':
      case 'PENDING_PAYMENT':
        return 'text-yellow-400 bg-yellow-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">My Investments</h1>
          <p className="text-gray-400">Track all your investment progress</p>
        </div>
        <Link to="/invest" className="btn-primary">
          New Investment
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-20 bg-dark-700 rounded" />
            </div>
          ))}
        </div>
      ) : investments.length === 0 ? (
        <motion.div
          className="card text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Gift className="w-16 h-16 text-primary-400/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Investments Yet</h3>
          <p className="text-gray-400 mb-6">Start investing today!</p>
          <Link to="/invest" className="btn-primary">
            Make Your First Investment
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {investments.map((investment, i) => (
            <motion.div
              key={investment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={`/dashboard/investments/${investment.id}`} className="card block hover:border-primary-400/40">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <div className="w-14 h-14 rounded-xl bg-primary-400/10 flex items-center justify-center">
                      <Gift className="w-7 h-7 text-primary-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Investment #{investment.id.slice(0, 8)}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(investment.productionStatus)}`}>
                          {investment.productionStatus.replace(/_/g, ' ')}
                        </span>
                        {investment.paymentStatus === 'FINISHED' && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">Invested</p>
                      <p className="text-white font-bold">${investment.userInvestment}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">Value</p>
                      <p className="text-primary-400 font-bold">${investment.productValue}</p>
                    </div>
                    {investment.timeline && (
                      <div className="text-center hidden md:block">
                        <p className="text-gray-400 text-sm">Progress</p>
                        <p className="text-white font-bold">{investment.timeline.productionProgress}%</p>
                      </div>
                    )}
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Progress Bar */}
                {investment.timeline && (
                  <div className="mt-4">
                    <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-400 rounded-full transition-all"
                        style={{ width: `${investment.timeline.productionProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Investments
