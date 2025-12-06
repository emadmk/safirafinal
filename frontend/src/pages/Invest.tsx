import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import {
  Gem,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  User,
  Mail,
  Lock,
  MapPin,
  CreditCard,
  Shield,
  TrendingUp,
  Gift
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'
import { trackEvent } from '../lib/tracking'

interface InvestForm {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
  address: string
  city: string
  country: string
  postalCode: string
}

const Invest = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const referralCode = searchParams.get('ref') || ''
  const { isAuthenticated, register: registerUser, user } = useAuthStore()
  const [step, setStep] = useState(isAuthenticated ? 2 : 1)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, watch } = useForm<InvestForm>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      address: user?.address || '',
      city: user?.city || '',
      country: user?.country || '',
      postalCode: user?.postalCode || '',
    }
  })

  useEffect(() => {
    if (isAuthenticated && step === 1) {
      setStep(2)
    }
  }, [isAuthenticated])

  const handleCreateAccount = async (data: InvestForm) => {
    if (isAuthenticated) {
      setStep(2)
      return
    }

    setIsLoading(true)
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        postalCode: data.postalCode,
        referredBy: referralCode,
      })
      toast.success('Account created!')
      setStep(2)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed')
    }
    setIsLoading(false)
  }

  const handleUpdateAddress = async (data: InvestForm) => {
    setIsLoading(true)
    try {
      await api.patch('/users/profile', {
        address: data.address,
        city: data.city,
        country: data.country,
        postalCode: data.postalCode,
      })
      setStep(3)
    } catch (error: any) {
      toast.error('Failed to update address')
    }
    setIsLoading(false)
  }

  const handleInvest = async () => {
    setIsLoading(true)
    try {
      trackEvent('INVESTMENT', { step: 'payment_initiated' })
      const response = await api.post('/investments/create')
      const { invoiceUrl } = response.data

      // Redirect to NowPayment
      window.location.href = invoiceUrl
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create investment')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary-400 rounded-full filter blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-primary-500 rounded-full filter blur-[150px]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-4">
          <Link to="/" className="inline-flex items-center space-x-2">
            <Gem className="w-8 h-8 text-primary-400" />
            <span className="text-2xl font-serif font-bold gold-text">SAFIRA</span>
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Side - Investment Summary */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden md:block"
              >
                <div className="card bg-gradient-to-br from-dark-800 to-dark-900 h-full">
                  <h2 className="text-2xl font-serif font-bold text-primary-400 mb-6">
                    Your Investment
                  </h2>

                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-primary-400/10 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-primary-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Your Investment</p>
                        <p className="text-2xl font-bold text-white">$100</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-primary-400/10 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-primary-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Our Contribution</p>
                        <p className="text-2xl font-bold text-white">$250</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-primary-400/10 flex items-center justify-center">
                        <Gift className="w-6 h-6 text-primary-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Product Value</p>
                        <p className="text-2xl font-bold text-primary-400">$600</p>
                      </div>
                    </div>

                    <hr className="border-primary-400/20" />

                    <div className="space-y-3">
                      {[
                        '6 months handcrafted production',
                        '2 months sale period',
                        'Up to $250 profit potential',
                        '100% money-back guarantee',
                        'Free shipping if unsold',
                      ].map((item, i) => (
                        <div key={i} className="flex items-center text-gray-300 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary-400 mr-2 flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Side - Form Steps */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="card">
                  {/* Progress Steps */}
                  <div className="flex items-center justify-center mb-8">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className="flex items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                            step >= s
                              ? 'bg-primary-400 text-dark-900'
                              : 'bg-dark-700 text-gray-500'
                          }`}
                        >
                          {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                        </div>
                        {s < 3 && (
                          <div className={`w-12 h-1 mx-2 transition-colors ${step > s ? 'bg-primary-400' : 'bg-dark-700'}`} />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Step 1: Account */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <h3 className="text-xl font-bold text-white mb-6 text-center">
                        Create Your Account
                      </h3>

                      <form onSubmit={handleSubmit(handleCreateAccount)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="label">First Name</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="John"
                              {...register('firstName', { required: 'Required' })}
                            />
                          </div>
                          <div>
                            <label className="label">Last Name</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Doe"
                              {...register('lastName', { required: 'Required' })}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="label">Email</label>
                          <input
                            type="email"
                            className="input"
                            placeholder="your@email.com"
                            {...register('email', { required: 'Email is required' })}
                          />
                        </div>

                        <div>
                          <label className="label">Password</label>
                          <input
                            type="password"
                            className="input"
                            placeholder="Min. 8 characters"
                            {...register('password', {
                              required: 'Password is required',
                              minLength: { value: 8, message: 'Min 8 characters' }
                            })}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="btn-primary w-full py-4"
                        >
                          {isLoading ? 'Creating...' : 'Continue'}
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </button>
                      </form>

                      <p className="mt-4 text-center text-gray-400 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-400">Sign in</Link>
                      </p>
                    </motion.div>
                  )}

                  {/* Step 2: Shipping Address */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <h3 className="text-xl font-bold text-white mb-6 text-center">
                        Shipping Address
                      </h3>
                      <p className="text-gray-400 text-sm text-center mb-6">
                        Where should we ship your artwork if unsold?
                      </p>

                      <form onSubmit={handleSubmit(handleUpdateAddress)} className="space-y-4">
                        <div>
                          <label className="label">Street Address</label>
                          <input
                            type="text"
                            className="input"
                            placeholder="123 Main Street"
                            {...register('address', { required: 'Address is required' })}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="label">City</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="New York"
                              {...register('city', { required: 'City is required' })}
                            />
                          </div>
                          <div>
                            <label className="label">Postal Code</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="10001"
                              {...register('postalCode', { required: 'Postal code is required' })}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="label">Country</label>
                          <input
                            type="text"
                            className="input"
                            placeholder="United States"
                            {...register('country', { required: 'Country is required' })}
                          />
                        </div>

                        <div className="flex space-x-4">
                          <button
                            type="button"
                            className="btn-secondary flex-1 py-4"
                            onClick={() => setStep(1)}
                          >
                            <ArrowLeft className="mr-2 w-5 h-5" />
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary flex-1 py-4"
                          >
                            {isLoading ? 'Saving...' : 'Continue'}
                            <ArrowRight className="ml-2 w-5 h-5" />
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* Step 3: Payment */}
                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <h3 className="text-xl font-bold text-white mb-6 text-center">
                        Complete Payment
                      </h3>

                      <div className="bg-dark-700/50 rounded-xl p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-gray-400">Investment Amount</span>
                          <span className="text-2xl font-bold text-primary-400">$100</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-400 mb-4">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay with Cryptocurrency (Bitcoin, Ethereum, USDT, etc.)
                        </div>

                        <p className="text-xs text-gray-500">
                          You'll be redirected to our secure payment provider to complete your investment.
                        </p>
                      </div>

                      <div className="flex space-x-4">
                        <button
                          type="button"
                          className="btn-secondary flex-1 py-4"
                          onClick={() => setStep(2)}
                        >
                          <ArrowLeft className="mr-2 w-5 h-5" />
                          Back
                        </button>
                        <button
                          onClick={handleInvest}
                          disabled={isLoading}
                          className="btn-primary flex-1 py-4"
                        >
                          {isLoading ? 'Processing...' : 'Pay $100'}
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </button>
                      </div>

                      <p className="mt-4 text-center text-gray-500 text-xs">
                        Secure payment powered by NowPayments
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Invest
