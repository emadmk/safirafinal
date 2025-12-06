import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Gift,
  Clock,
  TrendingUp,
  CheckCircle,
  Copy,
  Share2,
  Package,
  Truck
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import api from '../lib/api'
import { Investment } from '../types'

const InvestmentDetail = () => {
  const { id } = useParams()
  const [investment, setInvestment] = useState<Investment | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchInvestment()
  }, [id])

  const fetchInvestment = async () => {
    try {
      const response = await api.get(`/investments/${id}`)
      setInvestment(response.data.investment)
    } catch {
      toast.error('Failed to load investment')
    }
    setIsLoading(false)
  }

  const copyReferralLink = () => {
    if (!investment) return
    const link = `${window.location.origin}/shop?ref=${investment.referralCode}`
    navigator.clipboard.writeText(link)
    toast.success('Sale link copied!')
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-dark-700 rounded w-48" />
        <div className="h-64 bg-dark-700 rounded" />
      </div>
    )
  }

  if (!investment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Investment not found</p>
        <Link to="/dashboard/investments" className="text-primary-400 mt-4 inline-block">
          Go back
        </Link>
      </div>
    )
  }

  const stages = [
    { key: 'PENDING_PAYMENT', label: 'Payment', icon: Clock },
    { key: 'QUEUED', label: 'Queued', icon: Package },
    { key: 'IN_PRODUCTION', label: 'Production', icon: Gift },
    { key: 'QUALITY_CHECK', label: 'Quality Check', icon: CheckCircle },
    { key: 'FRAMING', label: 'Framing', icon: Package },
    { key: 'COMPLETED', label: 'Completed', icon: Truck },
  ]

  const currentStageIndex = stages.findIndex(s => s.key === investment.productionStatus)

  return (
    <div className="space-y-8">
      <Link to="/dashboard/investments" className="inline-flex items-center text-gray-400 hover:text-primary-400">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Investments
      </Link>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Investment #{investment.id.slice(0, 8)}
          </h1>
          <p className="text-gray-400">
            Created on {format(new Date(investment.createdAt), 'MMM dd, yyyy')}
          </p>
        </div>
      </div>

      {/* Investment Summary */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-bold text-white mb-6">Investment Summary</h3>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-dark-700/50 rounded-xl">
            <p className="text-gray-400 text-sm mb-1">Your Investment</p>
            <p className="text-3xl font-bold text-white">${investment.userInvestment}</p>
          </div>
          <div className="text-center p-4 bg-dark-700/50 rounded-xl">
            <p className="text-gray-400 text-sm mb-1">Our Contribution</p>
            <p className="text-3xl font-bold text-white">${investment.companyInvestment}</p>
          </div>
          <div className="text-center p-4 bg-primary-400/10 rounded-xl border border-primary-400/30">
            <p className="text-primary-400 text-sm mb-1">Product Value</p>
            <p className="text-3xl font-bold text-primary-400">${investment.productValue}</p>
          </div>
        </div>
      </motion.div>

      {/* Production Timeline */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-bold text-white mb-6">Production Progress</h3>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-primary-300 transition-all duration-500"
              style={{ width: `${((currentStageIndex + 1) / stages.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Stages */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {stages.map((stage, i) => {
            const isCompleted = i <= currentStageIndex
            const isCurrent = i === currentStageIndex
            return (
              <div
                key={stage.key}
                className={`text-center p-4 rounded-xl ${
                  isCurrent
                    ? 'bg-primary-400/10 border border-primary-400/30'
                    : isCompleted
                    ? 'bg-dark-700/50'
                    : 'bg-dark-800/50'
                }`}
              >
                <stage.icon
                  className={`w-8 h-8 mx-auto mb-2 ${
                    isCompleted ? 'text-primary-400' : 'text-gray-500'
                  }`}
                />
                <p className={`text-sm ${isCompleted ? 'text-white' : 'text-gray-500'}`}>
                  {stage.label}
                </p>
              </div>
            )
          })}
        </div>

        {/* Timeline Info */}
        {investment.timeline && (
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-dark-700/50 rounded-xl">
              <p className="text-gray-400 text-sm">Production Time</p>
              <p className="text-white font-bold">
                {investment.timeline.productionDaysElapsed} / {investment.timeline.productionDaysTotal} days
              </p>
            </div>
            <div className="p-4 bg-dark-700/50 rounded-xl">
              <p className="text-gray-400 text-sm">Estimated Completion</p>
              <p className="text-white font-bold">
                {investment.productionEndDate
                  ? format(new Date(investment.productionEndDate), 'MMM dd, yyyy')
                  : 'Pending'}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Sale Section */}
      {investment.saleStatus !== 'NOT_STARTED' && (
        <motion.div
          className="card bg-gradient-to-r from-primary-400/10 to-dark-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2 mb-2">
                <Share2 className="w-5 h-5 text-primary-400" />
                <h3 className="text-lg font-bold text-white">Sale Period Active</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Share this link to earn $250 when someone purchases your artwork
              </p>
            </div>
            <button onClick={copyReferralLink} className="btn-primary">
              <Copy className="w-4 h-4 mr-2" />
              Copy Sale Link
            </button>
          </div>
        </motion.div>
      )}

      {/* Earnings Info */}
      {investment.userEarnings && (
        <motion.div
          className="card bg-green-400/10 border-green-400/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-green-400/20 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <p className="text-green-400 font-medium">Investment Completed!</p>
              <p className="text-3xl font-bold text-white">+${investment.userEarnings}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default InvestmentDetail
