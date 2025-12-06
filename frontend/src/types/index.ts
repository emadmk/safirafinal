export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  referralCode: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  phone?: string
  address?: string
  city?: string
  country?: string
  postalCode?: string
  createdAt: string
}

export interface Investment {
  id: string
  userId: string
  userInvestment: number
  companyInvestment: number
  productValue: number
  paymentId?: string
  paymentStatus: PaymentStatus
  paymentMethod?: string
  paymentCurrency?: string
  paymentAmount?: number
  nowPaymentId?: string
  investmentDate?: string
  productionStartDate?: string
  productionEndDate?: string
  saleStartDate?: string
  saleEndDate?: string
  productionStatus: ProductionStatus
  productionStage: number
  productionNotes?: string
  saleStatus: SaleStatus
  finalOutcome?: FinalOutcome
  userEarnings?: number
  companyEarnings?: number
  productId?: string
  product?: Product
  referralCode: string
  createdAt: string
  timeline?: {
    productionDaysElapsed: number
    productionDaysTotal: number
    productionProgress: number
    saleDaysElapsed: number
    saleDaysTotal: number
    saleProgress: number
  }
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number
  images: string[]
  isAvailable: boolean
  isFeatured: boolean
  material?: string
  dimensions?: string
  weight?: string
  craftsman?: string
  createdAt: string
}

export interface Sale {
  id: string
  investmentId?: string
  productId?: string
  buyerEmail?: string
  buyerName?: string
  buyerAddress?: string
  paymentId?: string
  paymentStatus: PaymentStatus
  amount: number
  referredByUserId?: string
  referralCode?: string
  saleType: 'REFERRAL' | 'DIRECT'
  investorEarnings?: number
  companyEarnings?: number
  createdAt: string
}

export interface Ticket {
  id: string
  userId: string
  subject: string
  message: string
  status: TicketStatus
  priority: TicketPriority
  category?: string
  createdAt: string
  replies: TicketReply[]
}

export interface TicketReply {
  id: string
  ticketId: string
  userId: string
  message: string
  isAdminReply: boolean
  createdAt: string
  user: {
    firstName: string
    lastName: string
    role: string
  }
}

export type PaymentStatus =
  | 'PENDING'
  | 'CONFIRMING'
  | 'CONFIRMED'
  | 'SENDING'
  | 'PARTIALLY_PAID'
  | 'FINISHED'
  | 'FAILED'
  | 'REFUNDED'
  | 'EXPIRED'

export type ProductionStatus =
  | 'PENDING_PAYMENT'
  | 'QUEUED'
  | 'IN_PRODUCTION'
  | 'QUALITY_CHECK'
  | 'FRAMING'
  | 'COMPLETED'

export type SaleStatus =
  | 'NOT_STARTED'
  | 'ACTIVE'
  | 'SOLD_BY_INVESTOR'
  | 'SOLD_BY_COMPANY'
  | 'GUARANTEED_DELIVERY'

export type FinalOutcome =
  | 'SOLD_BY_INVESTOR'
  | 'SOLD_BY_COMPANY'
  | 'GUARANTEED_DELIVERY'

export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_REPLY'
  | 'RESOLVED'
  | 'CLOSED'

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
