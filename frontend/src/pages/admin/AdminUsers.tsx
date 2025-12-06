import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const params = search ? `?search=${search}` : ''
      const response = await api.get(`/admin/users${params}`)
      setUsers(response.data.users)
    } catch {
      toast.error('Failed to load users')
    }
    setIsLoading(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Users</h1>
        <p className="text-gray-400">Manage platform users</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          className="input pl-10"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
        />
      </div>

      <motion.div className="card overflow-x-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 text-sm border-b border-primary-400/10">
              <th className="pb-3">User</th>
              <th className="pb-3">Referral Code</th>
              <th className="pb-3">Investments</th>
              <th className="pb-3">Joined</th>
              <th className="pb-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="py-8 text-center text-gray-400">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-gray-400">No users found</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-primary-400/5">
                  <td className="py-3">
                    <div>
                      <p className="text-white">{user.firstName} {user.lastName}</p>
                      <p className="text-gray-500 text-sm">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <code className="text-primary-400 text-sm">{user.referralCode}</code>
                  </td>
                  <td className="py-3 text-gray-400">{user._count?.investments || 0}</td>
                  <td className="py-3 text-gray-400">{format(new Date(user.createdAt), 'MMM dd, yyyy')}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'SUPER_ADMIN' ? 'text-red-400 bg-red-400/10' :
                      user.role === 'ADMIN' ? 'text-primary-400 bg-primary-400/10' :
                      'text-gray-400 bg-gray-400/10'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}

export default AdminUsers
