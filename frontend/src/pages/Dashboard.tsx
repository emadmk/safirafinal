import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Clock,
  Gift,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Share2,
  Copy,
  Zap,
  Sparkles,
  Users,
  Hash
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { Investment } from '../types'
import PaymentReminderPopup from '../components/PaymentReminderPopup'

const Dashboard = () => {
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [referrals, setReferrals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for payment success
    if (searchParams.get('payment') === 'success') {
      toast.success('Payment successful! Your investment has started.')
    }

    fetchInvestments()
  }, [])

  const fetchInvestments = async () => {
    try {
      const [investmentsRes, referralsRes] = await Promise.all([
        api.get('/investments'),
        api.get('/referrals').catch(() => ({ data: { referrals: [] } }))
      ])
      setInvestments(investmentsRes.data.investments)
      setReferrals(referralsRes.data.referrals || [])
    } catch (error) {
      toast.error('Failed to load investments')
    }
    setIsLoading(false)
  }

  const copyReferralLink = () => {
    const link = `${window.location.origin}/invest?ref=${user?.referralCode}`
    navigator.clipboard.writeText(link)
    toast.success('Referral link copied!')
  }

  const totalInvested = investments.reduce((sum, inv) => sum + inv.userInvestment, 0)
  const totalValue = investments.reduce((sum, inv) => sum + inv.productValue, 0)
  const potentialEarnings = investments.length * 250

  // Get latest investment
  const latestInvestment = investments[0]

  return (
    <div className="space-y-8">
      {/* Payment Reminder Popup */}
      <PaymentReminderPopup investments={investments} />

      {/* Opportunity/Congratulations Banner */}
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-400/20 via-primary-500/10 to-dark-800 border border-primary-400/30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-400/20 flex items-center justify-center flex-shrink-0">
                {investments.some(inv => inv.paymentStatus === 'FINISHED') ? (
                  <Sparkles className="w-7 h-7 text-primary-400" />
                ) : (
                  <Zap className="w-7 h-7 text-primary-400" />
                )}
              </div>
              <div>
                {investments.some(inv => inv.paymentStatus === 'FINISHED') ? (
                  <>
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                      Congratulations! 🎉
                    </h2>
                    <p className="text-gray-300">
                      You're on your way to <span className="text-primary-400 font-semibold">doubling your money</span>.
                      Your investment is working for you!
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                      Don't Miss This Opportunity! ⚡
                    </h2>
                    <p className="text-gray-300">
                      <span className="text-primary-400 font-semibold">Double your money</span> with our exclusive
                      investment program. Start with just $100!
                    </p>
                  </>
                )}
              </div>
            </div>
            {!investments.some(inv => inv.paymentStatus === 'FINISHED') && (
              <Link
                to="/invest"
                className="btn-primary whitespace-nowrap flex-shrink-0"
              >
                <Zap className="w-5 h-5 mr-2" />
                Double It Now
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-400">
            Track your investments and earnings
          </p>
        </div>
        <Link to="/invest" className="btn-primary mt-4 md:mt-0">
          New Investment
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: DollarSign,
            label: 'Total Invested',
            value: `$${totalInvested}`,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
          },
          {
            icon: Gift,
            label: 'Total Value',
            value: `$${totalValue}`,
            color: 'text-primary-400',
            bg: 'bg-primary-400/10',
          },
          {
            icon: TrendingUp,
            label: 'Potential Earnings',
            value: `$${potentialEarnings}`,
            color: 'text-green-400',
            bg: 'bg-green-400/10',
          },
          {
            icon: Clock,
            label: 'Active Investments',
            value: investments.length.toString(),
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Referral Section */}
      <motion.div
        className="card bg-gradient-to-r from-primary-400/10 to-dark-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-2 mb-2">
              <Share2 className="w-5 h-5 text-primary-400" />
              <h3 className="text-lg font-bold text-white">Your Referral Link</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Earn $250 for each investment made through your link!
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <code className="px-4 py-2 bg-dark-900 rounded-lg text-primary-400 text-sm truncate max-w-xs">
              {user?.referralCode}
            </code>
            <button
              onClick={copyReferralLink}
              className="btn-secondary px-4 py-2"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Referral Slots Section */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <div className="flex items-center space-x-2 mb-6">
          <Users className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-bold text-white">Referral Progress</h3>
          <span className="text-sm text-gray-400">({Math.min(referrals.length, 4)}/4 slots filled)</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((slot) => {
            const referral = referrals[slot]
            return (
              <motion.div
                key={slot}
                className={`relative p-4 rounded-xl border-2 border-dashed transition-all ${
                  referral
                    ? 'border-primary-400 bg-primary-400/10'
                    : 'border-gray-600 bg-dark-700/50 hover:border-gray-500'
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + slot * 0.1 }}
              >
                {referral ? (
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-primary-400/20 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="w-5 h-5 text-primary-400" />
                    </div>
                    <p className="text-white font-medium text-sm truncate">
                      {referral.firstName || 'User'} {referral.lastName?.[0] || ''}
                    </p>
                    <p className="text-primary-400 text-xs font-semibold mt-1">+$250</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center mx-auto mb-2">
                      <Users className="w-5 h-5 text-gray-500" />
                    </div>
                    <p className="text-gray-500 text-sm">Empty Slot</p>
                    <p className="text-gray-600 text-xs mt-1">Invite a friend</p>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {referrals.length < 4 && (
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm">
              Share your link to fill all slots and earn up to <span className="text-primary-400 font-bold">$1,000</span>!
            </p>
          </div>
        )}
      </motion.div>

      {/* Investment Timeline */}
      {latestInvestment && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Latest Investment Progress</h3>
            {/* Unique Piece Number */}
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-400/20 to-primary-400/5 rounded-xl border border-primary-400/30">
              <Hash className="w-5 h-5 text-primary-400" />
              <div>
                <p className="text-xs text-gray-400">Your Piece</p>
                <p className="text-lg font-bold text-primary-400">
                  #{latestInvestment.id.slice(-6).toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Investment Summary */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-dark-700/50 rounded-xl">
              <div className="text-center">
                <p className="text-sm text-gray-400">Your Investment</p>
                <p className="text-xl font-bold text-white">${latestInvestment.userInvestment}</p>
              </div>
              <div className="text-center border-x border-primary-400/20">
                <p className="text-sm text-gray-400">Our Investment</p>
                <p className="text-xl font-bold text-white">${latestInvestment.companyInvestment}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Final Value</p>
                <p className="text-xl font-bold text-primary-400">${latestInvestment.productValue}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Progress Bar */}
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-400 to-primary-300"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      latestInvestment.timeline
                        ? latestInvestment.saleStatus !== 'NOT_STARTED'
                          ? 100
                          : (latestInvestment.timeline.productionProgress * 0.75)
                        : 0
                    }%`
                  }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>

              {/* Timeline Steps */}
              <div className="flex justify-between mt-4">
                {[
                  { label: 'Payment', status: latestInvestment.paymentStatus === 'FINISHED' },
                  { label: 'Production', status: latestInvestment.productionStatus !== 'PENDING_PAYMENT' && latestInvestment.productionStatus !== 'QUEUED' },
                  { label: 'Quality Check', status: latestInvestment.productionStatus === 'QUALITY_CHECK' || latestInvestment.productionStatus === 'FRAMING' || latestInvestment.productionStatus === 'COMPLETED' },
                  { label: 'Sale Period', status: latestInvestment.saleStatus === 'ACTIVE' || latestInvestment.saleStatus !== 'NOT_STARTED' },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.status
                          ? 'bg-primary-400 text-dark-900'
                          : 'bg-dark-700 text-gray-500'
                      }`}
                    >
                      {step.status ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs">{i + 1}</span>}
                    </div>
                    <span className={`text-xs mt-2 ${step.status ? 'text-primary-400' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Info */}
            <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl">
              <div>
                <p className="text-gray-400 text-sm">Current Status</p>
                <p className="text-white font-medium">
                  {latestInvestment.productionStatus.replace(/_/g, ' ')}
                </p>
              </div>
              {latestInvestment.timeline && (
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Time Remaining</p>
                  <p className="text-primary-400 font-bold">
                    {Math.max(0, latestInvestment.timeline.productionDaysTotal - latestInvestment.timeline.productionDaysElapsed)} days
                  </p>
                </div>
              )}
            </div>
          </div>

          <Link
            to={`/dashboard/investments/${latestInvestment.id}`}
            className="mt-4 text-primary-400 hover:text-primary-300 text-sm inline-flex items-center"
          >
            View Details
            <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && investments.length === 0 && (
        <motion.div
          className="card text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Gift className="w-16 h-16 text-primary-400/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Investments Yet</h3>
          <p className="text-gray-400 mb-6">
            Start your investment journey with just $100
          </p>
          <Link to="/invest" className="btn-primary">
            Make Your First Investment
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </motion.div>
      )}

      {/* Investments List */}
      {investments.length > 1 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">All Investments</h3>
            <Link to="/dashboard/investments" className="text-primary-400 hover:text-primary-300 text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {investments.slice(0, 3).map((investment) => (
              <Link
                key={investment.id}
                to={`/dashboard/investments/${investment.id}`}
                className="card flex items-center justify-between hover:border-primary-400/40"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-400/10 flex items-center justify-center">
                    <Hash className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      Piece #{investment.id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-gray-400 text-sm">{investment.productionStatus.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-primary-400 font-bold">${investment.productValue}</p>
                  <p className="text-gray-500 text-sm">Value</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
