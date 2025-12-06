import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Search, Edit, Eye } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const AdminInvestments = () => {
  const [investments, setInvestments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null)

  useEffect(() => {
    fetchInvestments()
  }, [statusFilter])

  const fetchInvestments = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('paymentStatus', statusFilter)
      if (search) params.append('search', search)
      const response = await api.get(`/admin/investments?${params}`)
      setInvestments(response.data.investments)
    } catch {
      toast.error('Failed to load investments')
    }
    setIsLoading(false)
  }

  const updateInvestment = async (id: string, data: any) => {
    try {
      await api.patch(`/admin/investments/${id}`, data)
      toast.success('Investment updated!')
      fetchInvestments()
      setSelectedInvestment(null)
    } catch {
      toast.error('Failed to update investment')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Investments</h1>
        <p className="text-gray-400">Manage all investments</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchInvestments()}
          />
        </div>
        <select
          className="input w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="FINISHED">Finished</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* Table */}
      <motion.div
        className="card overflow-x-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 text-sm border-b border-primary-400/10">
              <th className="pb-3">User</th>
              <th className="pb-3">Investment</th>
              <th className="pb-3">Payment</th>
              <th className="pb-3">Production</th>
              <th className="pb-3">Sale</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">Loading...</td>
              </tr>
            ) : investments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">No investments found</td>
              </tr>
            ) : (
              investments.map((inv) => (
                <tr key={inv.id} className="border-b border-primary-400/5">
                  <td className="py-3">
                    <div>
                      <p className="text-white">{inv.user?.firstName} {inv.user?.lastName}</p>
                      <p className="text-gray-500 text-sm">{inv.user?.email}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <p className="text-primary-400 font-bold">${inv.userInvestment}</p>
                    <p className="text-gray-500 text-sm">{format(new Date(inv.createdAt), 'MMM dd')}</p>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      inv.paymentStatus === 'FINISHED' ? 'text-green-400 bg-green-400/10' :
                      inv.paymentStatus === 'PENDING' ? 'text-yellow-400 bg-yellow-400/10' :
                      'text-red-400 bg-red-400/10'
                    }`}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-gray-400 text-sm">{inv.productionStatus?.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="py-3">
                    <span className="text-gray-400 text-sm">{inv.saleStatus?.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => setSelectedInvestment(inv)}
                      className="p-2 text-gray-400 hover:text-primary-400"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Edit Modal */}
      {selectedInvestment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedInvestment(null)}>
          <div className="card w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-6">Update Investment</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Production Status</label>
                <select
                  className="input"
                  value={selectedInvestment.productionStatus}
                  onChange={(e) => setSelectedInvestment({ ...selectedInvestment, productionStatus: e.target.value })}
                >
                  <option value="PENDING_PAYMENT">Pending Payment</option>
                  <option value="QUEUED">Queued</option>
                  <option value="IN_PRODUCTION">In Production</option>
                  <option value="QUALITY_CHECK">Quality Check</option>
                  <option value="FRAMING">Framing</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div>
                <label className="label">Production Stage (%)</label>
                <input
                  type="number"
                  className="input"
                  min="0"
                  max="100"
                  value={selectedInvestment.productionStage || 0}
                  onChange={(e) => setSelectedInvestment({ ...selectedInvestment, productionStage: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="label">Sale Status</label>
                <select
                  className="input"
                  value={selectedInvestment.saleStatus}
                  onChange={(e) => setSelectedInvestment({ ...selectedInvestment, saleStatus: e.target.value })}
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SOLD_BY_INVESTOR">Sold by Investor</option>
                  <option value="SOLD_BY_COMPANY">Sold by Company</option>
                  <option value="GUARANTEED_DELIVERY">Guaranteed Delivery</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <button onClick={() => setSelectedInvestment(null)} className="btn-secondary flex-1">Cancel</button>
                <button
                  onClick={() => updateInvestment(selectedInvestment.id, {
                    productionStatus: selectedInvestment.productionStatus,
                    productionStage: selectedInvestment.productionStage,
                    saleStatus: selectedInvestment.saleStatus,
                  })}
                  className="btn-primary flex-1"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminInvestments
