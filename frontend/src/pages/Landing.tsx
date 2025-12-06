import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Shield,
  TrendingUp,
  Clock,
  Gift,
  Star,
  CheckCircle,
  Users,
  Award,
  LogOut
} from 'lucide-react'
import { initTracking } from '../lib/tracking'
import { useAuthStore } from '../store/authStore'

const Landing = () => {
  const { user, logout } = useAuthStore()

  useEffect(() => {
    initTracking()
  }, [])

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 overflow-hidden">
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <img src="/logo.png" alt="Safira" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
              <span className="text-xl md:text-2xl font-luxury font-semibold tracking-wider gold-text">SAFIRALUX</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#how-it-works" className="text-gray-300 hover:text-primary-400 transition-colors">How It Works</a>
              <a href="#benefits" className="text-gray-300 hover:text-primary-400 transition-colors">Benefits</a>
              <a href="#shop" className="text-gray-300 hover:text-primary-400 transition-colors">Shop</a>
              {user ? (
                <>
                  <span className="text-gray-300">Hello, <span className="text-primary-400 font-medium">{user.firstName}</span></span>
                  <Link to="/dashboard" className="text-primary-400 hover:text-primary-300 transition-colors">Dashboard</Link>
                  <button onClick={logout} className="flex items-center text-gray-400 hover:text-red-400 transition-colors">
                    <LogOut className="w-4 h-4 mr-1" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-primary-400 hover:text-primary-300 transition-colors">Login</Link>
                  <Link to="/invest" className="btn-primary text-sm">Start Investing</Link>
                </>
              )}
            </div>
            {user ? (
              <Link to="/dashboard" className="md:hidden btn-primary text-sm px-3 py-2 whitespace-nowrap flex-shrink-0">Dashboard</Link>
            ) : (
              <Link to="/invest" className="md:hidden btn-primary text-sm px-4 py-2 whitespace-nowrap flex-shrink-0">Invest</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-30"
          >
            <source src="/Movie.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-dark-950/80 via-dark-900/70 to-dark-800/90" />
        </div>
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-400 rounded-full filter blur-[150px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-500 rounded-full filter blur-[150px] animate-pulse-slow delay-1000" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary-400/10 border border-primary-400/30 text-primary-400 text-sm font-medium mb-6">
              Limited Investment Opportunity
            </span>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-6">
              <span className="text-white">Double Your Money</span>
              <br />
              <span className="gold-text">With Persian Art</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Invest $100 in handcrafted Persian Pateh art. Earn up to $250 profit with
              <span className="text-primary-400 font-semibold"> 100% money-back guarantee</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/invest" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">
                Start With $100
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a href="#how-it-works" className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto">
                Learn How It Works
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-400">$100</div>
                <div className="text-sm text-gray-500">Your Investment</div>
              </motion.div>
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-400">$600</div>
                <div className="text-sm text-gray-500">Product Value</div>
              </motion.div>
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-400">250%</div>
                <div className="text-sm text-gray-500">Max Return</div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-primary-400/50 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-primary-400 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Product Showcase */}
      <section className="py-20 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-dark-700 to-dark-800 border border-primary-400/20 overflow-hidden">
                  <img
                    src="/Photo product (1).jpg"
                    alt="Handcrafted Pateh Artwork"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary-400/10 rounded-full blur-2xl" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="section-title mb-6">Authentic Persian Pateh Art</h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Each piece is handcrafted by master artisans in Kerman, Iran using traditional techniques
                passed down through generations. Made with natural fibers, silk, and organic dyes, these
                stunning artworks are perfect for wall mounting or table display.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Handwoven by master craftsmen',
                  'Natural fibers and silk',
                  'Organic plant-based dyes',
                  'Framed and ready to display',
                  'Certificate of authenticity',
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 text-primary-400 mr-3 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-primary-400">$600</span>
                <span className="text-gray-500">Retail Value</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A simple 3-step process to start your investment journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: TrendingUp,
                title: 'Invest $100',
                description: 'Start with a small investment of $100. We add $250 more to create your $600 artwork.',
              },
              {
                step: '02',
                icon: Clock,
                title: 'Wait 6 Months',
                description: 'Master craftsmen create your unique Pateh artwork using traditional techniques.',
              },
              {
                step: '03',
                icon: Gift,
                title: 'Earn or Receive',
                description: 'Earn up to $250 when sold, or receive the $600 artwork directly if not sold.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="card relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <span className="absolute -top-4 -left-4 text-6xl font-bold text-primary-400/10">{item.step}</span>
                <item.icon className="w-12 h-12 text-primary-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Breakdown */}
      <section className="py-20 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Your Investment Journey</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              See exactly how your investment grows over time
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Timeline */}
            <div className="relative">
              {/* Line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary-400/20 -translate-x-1/2" />

              {[
                {
                  title: 'Investment Start',
                  content: 'You invest $100 + We add $250 = $350 total production budget',
                  icon: TrendingUp,
                  side: 'left',
                },
                {
                  title: '6 Months Production',
                  content: 'Master craftsmen create your unique $600 Pateh artwork',
                  icon: Clock,
                  side: 'right',
                },
                {
                  title: '2 Months Sale Period',
                  content: 'Artwork listed at $550 (with $50 discount)',
                  icon: Star,
                  side: 'left',
                },
                {
                  title: 'Final Outcome',
                  content: 'Earn $200-$250 profit OR receive $600 artwork for free!',
                  icon: Gift,
                  side: 'right',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className={`relative flex items-center mb-12 ${
                    item.side === 'left' ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                  initial={{ opacity: 0, x: item.side === 'left' ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                >
                  <div className={`w-full md:w-1/2 ${item.side === 'left' ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <div className={`card inline-block ${item.side === 'left' ? 'md:ml-auto' : ''}`}>
                      <item.icon className="w-8 h-8 text-primary-400 mb-3" />
                      <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-gray-400">{item.content}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-primary-400 rounded-full border-4 border-dark-900" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Why Invest With Safira</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Risk-free investment with guaranteed returns
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: '100% Guaranteed',
                description: 'If unsold, receive the $600 artwork at no extra cost',
              },
              {
                icon: TrendingUp,
                title: 'Up to 250% ROI',
                description: 'Earn $250 on your $100 investment through referrals',
              },
              {
                icon: Users,
                title: 'Referral Bonus',
                description: 'Sell 4 pieces, get 1 free artwork worth $600',
              },
              {
                icon: Award,
                title: 'Authentic Art',
                description: 'Genuine handcrafted Persian Pateh with certificate',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="card text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-400/10 flex items-center justify-center">
                  <item.icon className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="py-20 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="card bg-gradient-to-br from-dark-800 to-dark-900 border-primary-400/30">
              <div className="text-center mb-8">
                <h2 className="section-title mb-4">Your Potential Earnings</h2>
                <p className="text-gray-400">Three possible outcomes - all guaranteed!</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <motion.div
                  className="p-6 rounded-xl bg-dark-800/50 border border-primary-400/20 text-center"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-sm text-primary-400 mb-2">If sold through your referral</div>
                  <div className="text-4xl font-bold text-green-400 mb-2">+$250</div>
                  <div className="text-gray-500 text-sm">Your profit</div>
                </motion.div>

                <motion.div
                  className="p-6 rounded-xl bg-dark-800/50 border border-primary-400/20 text-center"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-sm text-primary-400 mb-2">If sold by Safira</div>
                  <div className="text-4xl font-bold text-green-400 mb-2">+$200</div>
                  <div className="text-gray-500 text-sm">Your profit</div>
                </motion.div>

                <motion.div
                  className="p-6 rounded-xl bg-dark-800/50 border border-primary-400/20 text-center"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-sm text-primary-400 mb-2">If not sold (guarantee)</div>
                  <div className="text-4xl font-bold text-primary-400 mb-2">$600</div>
                  <div className="text-gray-500 text-sm">Artwork shipped to you</div>
                </motion.div>
              </div>

              <div className="mt-8 text-center">
                <Link to="/invest" className="btn-primary text-lg px-10 py-4">
                  Start Investing Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop Preview */}
      <section id="shop" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Ready-to-Buy Artworks</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Browse our collection of finished Pateh artworks available for immediate purchase
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { id: 1, name: 'Royal Persian Pateh', image: '/Photo product (2).jpg' },
              { id: 2, name: 'Classic Kerman Art', image: '/Photo product (3).jpg' },
              { id: 3, name: 'Traditional Silk Pateh', image: '/Photo product (4).jpg' },
            ].map((product, i) => (
              <motion.div
                key={product.id}
                className="card p-0 overflow-hidden group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="aspect-square bg-dark-700 relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2">{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">Handcrafted artwork with natural silk and dyes</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary-400">$550</span>
                      <span className="text-gray-500 line-through ml-2">$600</span>
                    </div>
                    <Link to="/shop" className="btn-secondary text-sm px-4 py-2">View Details</Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/shop" className="btn-secondary text-lg px-8 py-4">
              View All Artworks
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-400/10 to-dark-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">
              Ready to Start Your Investment?
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Join hundreds of investors who are growing their wealth with authentic Persian art.
              Start with just $100 and watch your investment flourish.
            </p>
            <Link to="/invest" className="btn-primary text-xl px-12 py-5">
              Invest $100 Now
              <ArrowRight className="ml-2 w-6 h-6" />
            </Link>
            <p className="mt-6 text-gray-500 text-sm">
              Secure payment via cryptocurrency. 100% money-back guarantee.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-dark-950 border-t border-primary-400/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link to="/" className="flex items-center space-x-2 mb-4">
                <img src="/logo.png" alt="Safira" className="w-10 h-10 object-contain" />
                <span className="text-2xl font-luxury font-semibold tracking-wider gold-text">SAFIRALUX</span>
              </Link>
              <p className="text-gray-400 text-sm">
                Authentic Persian Pateh art investment platform. Transform $100 into lasting value.
              </p>
            </div>
            <div>
              <h4 className="text-primary-400 font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#how-it-works" className="text-gray-400 hover:text-primary-400 text-sm">How It Works</a></li>
                <li><a href="#benefits" className="text-gray-400 hover:text-primary-400 text-sm">Benefits</a></li>
                <li><Link to="/shop" className="text-gray-400 hover:text-primary-400 text-sm">Shop</Link></li>
                <li><Link to="/invest" className="text-gray-400 hover:text-primary-400 text-sm">Start Investing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-primary-400 font-semibold mb-4">Account</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-gray-400 hover:text-primary-400 text-sm">Login</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-primary-400 text-sm">Register</Link></li>
                <li><Link to="/dashboard" className="text-gray-400 hover:text-primary-400 text-sm">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-primary-400 font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="mailto:support@safiralux.com" className="text-gray-400 hover:text-primary-400 text-sm">support@safiralux.com</a></li>
                <li><Link to="/dashboard/tickets" className="text-gray-400 hover:text-primary-400 text-sm">Submit Ticket</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-400/10 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Safira Luxury. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
