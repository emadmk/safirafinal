import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Gem, Mail, Lock, User, Phone, MapPin, ArrowRight, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

interface RegisterForm {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
  address?: string
  city?: string
  country?: string
  postalCode?: string
}

const Register = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const referralCode = searchParams.get('ref') || ''
  const { register: registerUser, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(1)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>()
  const password = watch('password')

  const onSubmit = async (data: RegisterForm) => {
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
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary-400 rounded-full filter blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-primary-500 rounded-full filter blur-[150px]" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="card p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <Gem className="w-10 h-10 text-primary-400" />
              <span className="text-3xl font-serif font-bold gold-text">SAFIRA</span>
            </Link>
            <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-400">Join our luxury investment community</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s
                      ? 'bg-primary-400 text-dark-900'
                      : 'bg-dark-700 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s < 2 && (
                  <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-primary-400' : 'bg-dark-700'}`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        className="input pl-10"
                        placeholder="John"
                        {...register('firstName', { required: 'First name is required' })}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-red-400 text-sm">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="label">Last Name</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Doe"
                      {...register('lastName', { required: 'Last name is required' })}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-red-400 text-sm">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      className="input pl-10"
                      placeholder="your@email.com"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-red-400 text-sm">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input pl-10 pr-10"
                      placeholder="Min. 8 characters"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Password must be at least 8 characters' },
                      })}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-red-400 text-sm">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input pl-10"
                      placeholder="Confirm your password"
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) => value === password || 'Passwords do not match',
                      })}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-red-400 text-sm">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type="button"
                  className="btn-primary w-full py-4"
                  onClick={() => setStep(2)}
                >
                  Continue
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="label">Phone (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="tel"
                      className="input pl-10"
                      placeholder="+1 234 567 8900"
                      {...register('phone')}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Address (Optional)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      className="input pl-10"
                      placeholder="Street address"
                      {...register('address')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">City</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="City"
                      {...register('city')}
                    />
                  </div>
                  <div>
                    <label className="label">Country</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Country"
                      {...register('country')}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Postal Code</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Postal/Zip Code"
                    {...register('postalCode')}
                  />
                </div>

                {referralCode && (
                  <div className="p-4 bg-primary-400/10 border border-primary-400/30 rounded-lg">
                    <p className="text-primary-400 text-sm">
                      Referred by: <span className="font-bold">{referralCode}</span>
                    </p>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    type="button"
                    className="btn-secondary flex-1 py-4"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex-1 py-4"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        Create Account
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </span>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Register
