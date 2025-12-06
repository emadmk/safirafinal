import api from './api'
import { v4 as uuidv4 } from 'uuid'

const SESSION_KEY = 'safira_session'
const VISITOR_KEY = 'safira_visitor'

// Get or create session ID
export const getSessionId = (): string => {
  const existing = sessionStorage.getItem(SESSION_KEY)
  if (existing) {
    return existing
  }
  const newId = uuidv4()
  sessionStorage.setItem(SESSION_KEY, newId)
  return newId
}

// Get or create visitor ID
export const getVisitorId = (): string => {
  const existing = localStorage.getItem(VISITOR_KEY)
  if (existing) {
    return existing
  }
  const newId = uuidv4()
  localStorage.setItem(VISITOR_KEY, newId)
  return newId
}

// Parse UTM params from URL
export const getUTMParams = () => {
  const params = new URLSearchParams(window.location.search)
  return {
    utm_source: params.get('utm_source') || params.get('ref'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term'),
    ref: params.get('ref') || params.get('referral'),
  }
}

// Store UTM params in session
export const storeUTMParams = () => {
  const utmParams = getUTMParams()
  if (Object.values(utmParams).some(Boolean)) {
    sessionStorage.setItem('safira_utm', JSON.stringify(utmParams))
  }
}

// Get stored UTM params
export const getStoredUTMParams = () => {
  const stored = sessionStorage.getItem('safira_utm')
  return stored ? JSON.parse(stored) : {}
}

// Track an event
export const trackEvent = async (
  eventType: string,
  eventData?: Record<string, unknown>
) => {
  try {
    const sessionId = getSessionId()
    const utmParams = getStoredUTMParams()

    await api.post('/tracking/event', {
      eventType,
      pageUrl: window.location.href,
      pageTitle: document.title,
      eventData,
      sessionId,
      ...utmParams,
    })
  } catch {
    // Silent fail for tracking
  }
}

// Track page view
export const trackPageView = () => {
  trackEvent('PAGE_VIEW')
}

// Track scroll depth
let maxScrollDepth = 0
export const trackScroll = () => {
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
  const scrollTop = window.scrollY
  const scrollPercent = Math.round((scrollTop / scrollHeight) * 100)

  if (scrollPercent > maxScrollDepth) {
    maxScrollDepth = scrollPercent
  }
}

// Send scroll depth on page leave
export const sendScrollDepth = () => {
  if (maxScrollDepth > 0) {
    trackEvent('SCROLL', { scrollDepth: maxScrollDepth })
    maxScrollDepth = 0
  }
}

// Initialize tracking
export const initTracking = () => {
  // Store UTM params
  storeUTMParams()

  // Track initial page view
  trackPageView()

  // Track session start
  if (!sessionStorage.getItem('safira_session_started')) {
    trackEvent('SESSION_START')
    sessionStorage.setItem('safira_session_started', 'true')
  }

  // Track scroll
  window.addEventListener('scroll', trackScroll, { passive: true })

  // Send data before page unload
  window.addEventListener('beforeunload', () => {
    sendScrollDepth()
    trackEvent('SESSION_END')
  })
}
