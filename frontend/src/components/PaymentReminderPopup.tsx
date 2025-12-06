import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, AlertCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Investment {
  id: string
  userInvestment: number
  productValue: number
  paymentStatus: string
  createdAt: string
}

interface PaymentReminderPopupProps {
  investments: Investment[]
}

const PaymentReminderPopup = ({ investments }: PaymentReminderPopupProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Find pending investments
  const pendingInvestments = investments.filter(
    inv => inv.paymentStatus === 'PENDING'
  )

  useEffect(() => {
    // Show popup after 3 seconds if there are pending investments
    if (pendingInvestments.length > 0 && !dismissed) {
      const timer = setTimeout(() => {
        // Check if user hasn't dismissed today
        const lastDismissed = localStorage.getItem('paymentReminderDismissed')
        const today = new Date().toDateString()

        if (lastDismissed !== today) {
          setIsVisible(true)
        }
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [pendingInvestments.length, dismissed])

  const handleDismiss = () => {
    setIsVisible(false)
    setDismissed(true)
    localStorage.setItem('paymentReminderDismissed', new Date().toDateString())
  }

  if (pendingInvestments.length === 0) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
          />

          {/* Popup */}
          <motion.div
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-50"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <div className="bg-dark-800 border border-primary-400/30 rounded-2xl p-6 shadow-2xl">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-primary-400/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-primary-400" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white text-center mb-2">
                Complete Your Payment
              </h3>
              <p className="text-gray-400 text-center mb-6">
                You have {pendingInvestments.length} pending investment{pendingInvestments.length > 1 ? 's' : ''} waiting for payment.
                Complete your payment to start production!
              </p>

              {/* Investment Summary */}
              <div className="bg-dark-700/50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Total Pending</span>
                  <span className="text-primary-400 font-bold">
                    ${pendingInvestments.reduce((sum, inv) => sum + inv.userInvestment, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Potential Value</span>
                  <span className="text-white font-bold">
                    ${pendingInvestments.reduce((sum, inv) => sum + inv.productValue, 0)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                <Link
                  to={`/dashboard/investments/${pendingInvestments[0].id}`}
                  onClick={handleDismiss}
                  className="btn-primary w-full py-3 flex items-center justify-center"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Remind me later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default PaymentReminderPopup
