import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, Lock, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'

interface ProfileForm {
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  country: string
  postalCode: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const Profile = () => {
  const { user, updateUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')

  const { register, handleSubmit, reset, watch } = useForm<ProfileForm>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      country: user?.country || '',
      postalCode: user?.postalCode || '',
    }
  })

  const newPassword = watch('newPassword')

  const onSubmitProfile = async (data: ProfileForm) => {
    setIsLoading(true)
    try {
      const response = await api.patch('/users/profile', {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        postalCode: data.postalCode,
      })
      updateUser(response.data.user)
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile')
    }
    setIsLoading(false)
  }

  const onSubmitPassword = async (data: ProfileForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      await api.patch('/users/profile', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success('Password updated successfully!')
      reset({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update password')
    }
    setIsLoading(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-gray-400">Manage your account information</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-primary-400/20">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'profile'
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Profile Information
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'password'
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Change Password
        </button>
      </div>

      {activeTab === 'profile' && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="label">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    className="input pl-10"
                    {...register('firstName', { required: 'Required' })}
                  />
                </div>
              </div>
              <div>
                <label className="label">Last Name</label>
                <input
                  type="text"
                  className="input"
                  {...register('lastName', { required: 'Required' })}
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  className="input pl-10 bg-dark-700 cursor-not-allowed"
                  value={user?.email}
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="label">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="tel"
                  className="input pl-10"
                  {...register('phone')}
                />
              </div>
            </div>

            <div>
              <label className="label">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  className="input pl-10"
                  {...register('address')}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="label">City</label>
                <input type="text" className="input" {...register('city')} />
              </div>
              <div>
                <label className="label">Country</label>
                <input type="text" className="input" {...register('country')} />
              </div>
              <div>
                <label className="label">Postal Code</label>
                <input type="text" className="input" {...register('postalCode')} />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </motion.div>
      )}

      {activeTab === 'password' && (
        <motion.div
          className="card max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-6">
            <div>
              <label className="label">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  className="input pl-10"
                  {...register('currentPassword', { required: 'Required' })}
                />
              </div>
            </div>

            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  className="input pl-10"
                  {...register('newPassword', {
                    required: 'Required',
                    minLength: { value: 8, message: 'Min 8 characters' }
                  })}
                />
              </div>
            </div>

            <div>
              <label className="label">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  className="input pl-10"
                  {...register('confirmPassword', {
                    validate: value => value === newPassword || 'Passwords do not match'
                  })}
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary">
              <Lock className="w-4 h-4 mr-2" />
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  )
}

export default Profile
