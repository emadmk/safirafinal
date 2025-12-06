import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, ChevronDown, ChevronUp, Mail, MailOpen } from 'lucide-react'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const AdminTickets = () => {
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const { register, handleSubmit, reset } = useForm<{ message: string }>()

  useEffect(() => {
    fetchTickets()
  }, [statusFilter])

  const fetchTickets = async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : ''
      const response = await api.get(`/admin/tickets${params}`)
      setTickets(response.data.tickets)
      setUnreadCount(response.data.unreadCount || 0)
    } catch {
      toast.error('Failed to load tickets')
    }
    setIsLoading(false)
  }

  // Filter tickets based on unread toggle
  const displayedTickets = showUnreadOnly
    ? tickets.filter(t => t.isUnread)
    : tickets

  const sendReply = async (ticketId: string, data: { message: string }) => {
    try {
      await api.post(`/tickets/${ticketId}/reply`, data)
      toast.success('Reply sent!')
      reset()
      fetchTickets()
    } catch {
      toast.error('Failed to send reply')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-green-400 bg-green-400/10'
      case 'IN_PROGRESS': return 'text-blue-400 bg-blue-400/10'
      case 'WAITING_REPLY': return 'text-yellow-400 bg-yellow-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Support Tickets</h1>
          <p className="text-gray-400">Manage customer support</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Unread Toggle */}
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              showUnreadOnly
                ? 'bg-primary-400 text-dark-900'
                : 'bg-dark-700 text-gray-400 hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                showUnreadOnly ? 'bg-dark-900 text-primary-400' : 'bg-red-500 text-white'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
          <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_REPLY">Waiting Reply</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="card animate-pulse h-24" />)}</div>
      ) : displayedTickets.length === 0 ? (
        <div className="card text-center py-12">
          <MessageSquare className="w-16 h-16 text-primary-400/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            {showUnreadOnly ? 'No Unread Tickets' : 'No Tickets'}
          </h3>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedTickets.map(ticket => (
            <motion.div
              key={ticket.id}
              className={`card ${ticket.isUnread ? 'border-l-4 border-l-primary-400' : ''}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    ticket.isUnread ? 'bg-primary-400/20' : 'bg-primary-400/10'
                  }`}>
                    {ticket.isUnread ? (
                      <Mail className="w-5 h-5 text-primary-400" />
                    ) : (
                      <MailOpen className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${ticket.isUnread ? 'text-white' : 'text-gray-300'}`}>
                      {ticket.subject}
                      {ticket.isUnread && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-primary-400 text-dark-900 rounded-full">NEW</span>
                      )}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {ticket.user?.firstName} {ticket.user?.lastName} - {format(new Date(ticket.createdAt), 'MMM dd')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace(/_/g, ' ')}
                  </span>
                  {expandedTicket === ticket.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </div>

              <AnimatePresence>
                {expandedTicket === ticket.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-4 pt-4 border-t border-primary-400/10">
                      <div className="p-4 bg-dark-700/50 rounded-lg mb-4">
                        <p className="text-gray-300 whitespace-pre-wrap">{ticket.message}</p>
                      </div>

                      {ticket.replies?.map((reply: any) => (
                        <div key={reply.id} className={`p-4 rounded-lg mb-2 ${reply.isAdminReply ? 'bg-primary-400/10 ml-4' : 'bg-dark-700/50 mr-4'}`}>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`text-sm font-medium ${reply.isAdminReply ? 'text-primary-400' : 'text-white'}`}>
                              {reply.user.firstName} {reply.user.lastName}
                              {reply.isAdminReply && ' (Admin)'}
                            </span>
                            <span className="text-gray-500 text-xs">{format(new Date(reply.createdAt), 'MMM dd, HH:mm')}</span>
                          </div>
                          <p className="text-gray-300 whitespace-pre-wrap">{reply.message}</p>
                        </div>
                      ))}

                      <form onSubmit={handleSubmit(data => sendReply(ticket.id, data))} className="flex space-x-2 mt-4">
                        <input type="text" className="input flex-1" placeholder="Type your reply..." {...register('message', { required: true })} />
                        <button type="submit" className="btn-primary px-4"><Send className="w-4 h-4" /></button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminTickets
