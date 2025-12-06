import axios from 'axios';
import crypto from 'crypto';

const NOWPAYMENT_API_URL = process.env.NOWPAYMENT_API_URL || 'https://api.nowpayments.io/v1';
const NOWPAYMENT_API_KEY = process.env.NOWPAYMENT_API_KEY || '';
const NOWPAYMENT_IPN_SECRET = process.env.NOWPAYMENT_IPN_SECRET || '';

const api = axios.create({
  baseURL: NOWPAYMENT_API_URL,
  headers: {
    'x-api-key': NOWPAYMENT_API_KEY,
    'Content-Type': 'application/json',
  },
});

export interface CreatePaymentParams {
  price_amount: number;
  price_currency: string;
  order_id: string;
  order_description?: string;
  ipn_callback_url?: string;
  success_url?: string;
  cancel_url?: string;
}

export interface PaymentResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description?: string;
  ipn_callback_url?: string;
  created_at: string;
  updated_at: string;
  purchase_id: string;
  invoice_url?: string;
}

export interface InvoiceResponse {
  id: string;
  order_id: string;
  order_description?: string;
  price_amount: number;
  price_currency: string;
  invoice_url: string;
  success_url?: string;
  cancel_url?: string;
  created_at: string;
  updated_at: string;
}

// Get available currencies
export const getAvailableCurrencies = async () => {
  const response = await api.get('/currencies');
  return response.data;
};

// Get minimum payment amount for a currency
export const getMinimumPaymentAmount = async (currencyFrom: string, currencyTo: string = 'usd') => {
  const response = await api.get(`/min-amount?currency_from=${currencyFrom}&currency_to=${currencyTo}`);
  return response.data;
};

// Get estimated price
export const getEstimatedPrice = async (amount: number, currencyFrom: string, currencyTo: string) => {
  const response = await api.get(`/estimate?amount=${amount}&currency_from=${currencyFrom}&currency_to=${currencyTo}`);
  return response.data;
};

// Create an invoice (recommended method - user chooses currency)
export const createInvoice = async (params: {
  price_amount: number;
  price_currency: string;
  order_id: string;
  order_description?: string;
  ipn_callback_url?: string;
  success_url?: string;
  cancel_url?: string;
}): Promise<InvoiceResponse> => {
  const response = await api.post('/invoice', params);
  return response.data;
};

// Create a payment directly (when currency is known)
export const createPayment = async (params: CreatePaymentParams & { pay_currency: string }): Promise<PaymentResponse> => {
  const response = await api.post('/payment', params);
  return response.data;
};

// Get payment status
export const getPaymentStatus = async (paymentId: string): Promise<PaymentResponse> => {
  const response = await api.get(`/payment/${paymentId}`);
  return response.data;
};

// Verify IPN signature
export const verifyIPNSignature = (data: any, receivedSignature: string): boolean => {
  if (!NOWPAYMENT_IPN_SECRET) return false;

  // Sort the object keys
  const sortedData = sortObject(data);
  const jsonString = JSON.stringify(sortedData);

  const hmac = crypto.createHmac('sha512', NOWPAYMENT_IPN_SECRET);
  hmac.update(jsonString);
  const calculatedSignature = hmac.digest('hex');

  return calculatedSignature === receivedSignature;
};

// Helper to sort object keys for IPN verification
const sortObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObject);
  }

  const sortedKeys = Object.keys(obj).sort();
  const result: any = {};

  for (const key of sortedKeys) {
    result[key] = sortObject(obj[key]);
  }

  return result;
};

// Map NowPayment status to our PaymentStatus enum
export const mapPaymentStatus = (nowPaymentStatus: string): string => {
  const statusMap: { [key: string]: string } = {
    'waiting': 'PENDING',
    'confirming': 'CONFIRMING',
    'confirmed': 'CONFIRMED',
    'sending': 'SENDING',
    'partially_paid': 'PARTIALLY_PAID',
    'finished': 'FINISHED',
    'failed': 'FAILED',
    'refunded': 'REFUNDED',
    'expired': 'EXPIRED',
  };

  return statusMap[nowPaymentStatus] || 'PENDING';
};

export default {
  getAvailableCurrencies,
  getMinimumPaymentAmount,
  getEstimatedPrice,
  createInvoice,
  createPayment,
  getPaymentStatus,
  verifyIPNSignature,
  mapPaymentStatus,
};
