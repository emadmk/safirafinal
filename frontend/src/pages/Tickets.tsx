import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Plus, Send, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { Ticket } from '../types'

interface TicketForm {
  subject: string
  message: string
  category: string
}

interface ReplyForm {
  message: string
}

const Tickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null)

  const { register, handleSubmit, reset } = useForm<TicketForm>()
  const { register: registerReply, handleSubmit: handleSubmitReply, reset: resetReply } = useForm<ReplyForm>()

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets')
      setTickets(response.data.tickets)
    } catch {
      toast.error('Failed to load tickets')
    }
    setIsLoading(false)
  }

  const createTicket = async (data: TicketForm) => {
    try {
      await api.post('/tickets', data)
      toast.success('Ticket created!')
      reset()
      setShowNewTicket(false)
      fetchTickets()
    } catch {
      toast.error('Failed to create ticket')
    }
  }

  const sendReply = async (ticketId: string, data: ReplyForm) => {
    try {
      await api.post(`/tickets/${ticketId}/reply`, data)
      toast.success('Reply sent!')
      resetReply()
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
      case 'RESOLVED': return 'text-gray-400 bg-gray-400/10'
      case 'CLOSED': return 'text-gray-500 bg-gray-500/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Support Tickets</h1>
          <p className="text-gray-400">Get help with your investments</p>
        </div>
        <button
          onClick={() => setShowNewTicket(true)}
          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-dark-900 font-semibold rounded-xl shadow-lg shadow-primary-400/25 hover:shadow-primary-400/40 transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Ticket
        </button>
      </div>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {showNewTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewTicket(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-6">Create New Ticket</h3>
              <form onSubmit={handleSubmit(createTicket)} className="space-y-4">
                <div>
                  <label className="label">Category</label>
                  <select className="input" {...register('category')}>
                    <option value="general">General Question</option>
                    <option value="payment">Payment Issue</option>
                    <option value="investment">Investment Question</option>
                    <option value="technical">Technical Support</option>
                  </select>
                </div>
                <div>
                  <label className="label">Subject</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Brief description of your issue"
                    {...register('subject', { required: 'Required' })}
                  />
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea
                    className="input min-h-[150px]"
                    placeholder="Describe your issue in detail..."
                    {...register('message', { required: 'Required' })}
                  />
                </div>
                <div className="flex space-x-4">
                  <button type="button" onClick={() => setShowNewTicket(false)} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    Submit Ticket
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tickets List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-20 bg-dark-700 rounded" />
            </div>
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <motion.div className="card text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <MessageSquare className="w-16 h-16 text-primary-400/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Tickets</h3>
          <p className="text-gray-400">Create a ticket if you need help</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <motion.div
              key={ticket.id}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-400/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{ticket.subject}</p>
                    <p className="text-gray-400 text-sm">
                      {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace(/_/g, ' ')}
                  </span>
                  {expandedTicket === ticket.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {expandedTicket === ticket.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-primary-400/10">
                      <div className="p-4 bg-dark-700/50 rounded-lg mb-4">
                        <p className="text-gray-300 whitespace-pre-wrap">{ticket.message}</p>
                      </div>

                      {ticket.replies?.map(reply => (
                        <div
                          key={reply.id}
                          className={`p-4 rounded-lg mb-2 ${
                            reply.isAdminReply
                              ? 'bg-primary-400/10 ml-4'
                              : 'bg-dark-700/50 mr-4'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`text-sm font-medium ${reply.isAdminReply ? 'text-primary-400' : 'text-white'}`}>
                              {reply.user.firstName} {reply.user.lastName}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {format(new Date(reply.createdAt), 'MMM dd, HH:mm')}
                            </span>
                          </div>
                          <p className="text-gray-300 whitespace-pre-wrap">{reply.message}</p>
                        </div>
                      ))}

                      {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
                        <form
                          onSubmit={handleSubmitReply(data => sendReply(ticket.id, data))}
                          className="flex space-x-2 mt-4"
                        >
                          <input
                            type="text"
                            className="input flex-1"
                            placeholder="Type your reply..."
                            {...registerReply('message', { required: true })}
                          />
                          <button type="submit" className="btn-primary px-4">
                            <Send className="w-4 h-4" />
                          </button>
                        </form>
                      )}
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

export default Tickets
