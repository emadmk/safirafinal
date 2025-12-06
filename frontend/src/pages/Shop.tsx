import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Gem, ShoppingCart, X, ArrowRight, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { Product } from '../types'
import { initTracking } from '../lib/tracking'

interface PurchaseForm {
  buyerName: string
  buyerEmail: string
  buyerAddress: string
}

const Shop = () => {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)

  const referralCode = searchParams.get('ref') || ''

  const { register, handleSubmit, formState: { errors } } = useForm<PurchaseForm>()

  useEffect(() => {
    initTracking()
    fetchProducts()

    if (searchParams.get('purchase') === 'success') {
      toast.success('Purchase successful! You will receive a confirmation email.')
    }
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await api.get('/shop/products')
      setProducts(response.data.products)
    } catch {
      toast.error('Failed to load products')
    }
    setIsLoading(false)
  }

  const handlePurchase = async (data: PurchaseForm) => {
    if (!selectedProduct) return

    setIsPurchasing(true)
    try {
      const response = await api.post('/shop/purchase', {
        productId: selectedProduct.id,
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        buyerAddress: data.buyerAddress,
        referralCode,
      })
      window.location.href = response.data.invoiceUrl
    } catch {
      toast.error('Failed to process purchase')
      setIsPurchasing(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="glass border-b border-primary-400/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Gem className="w-8 h-8 text-primary-400" />
            <span className="text-xl font-serif font-bold gold-text">SAFIRA</span>
          </Link>
          <Link to="/invest" className="btn-primary text-sm">
            Invest Now
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-400 mb-4">
            Ready-to-Buy Artworks
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Browse our collection of handcrafted Persian Pateh artworks, ready for immediate purchase and shipping.
          </p>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-square bg-dark-700 rounded-lg mb-4" />
                <div className="h-4 bg-dark-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-dark-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Gem className="w-16 h-16 text-primary-400/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Products Available</h3>
            <p className="text-gray-400 mb-6">Check back soon for new artworks!</p>
            <Link to="/invest" className="btn-primary">
              Start Investing Instead
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                className="card p-0 overflow-hidden group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="aspect-square bg-dark-700 relative overflow-hidden">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Gem className="w-16 h-16 text-primary-400/20" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-primary-400 text-dark-900 rounded-full text-sm font-bold">
                    -$50
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2">{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary-400">${product.price}</span>
                      <span className="text-gray-500 line-through ml-2">${product.originalPrice}</span>
                    </div>
                    <button className="btn-secondary text-sm px-4 py-2">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Buy
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Purchase Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Complete Purchase</h3>
                <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 bg-dark-700/50 rounded-xl mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-dark-600 rounded-lg flex items-center justify-center">
                    <Gem className="w-8 h-8 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{selectedProduct.name}</h4>
                    <p className="text-primary-400 font-bold">${selectedProduct.price}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(handlePurchase)} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="John Doe"
                    {...register('buyerName', { required: 'Required' })}
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="your@email.com"
                    {...register('buyerEmail', { required: 'Required' })}
                  />
                </div>
                <div>
                  <label className="label">Shipping Address</label>
                  <textarea
                    className="input min-h-[100px]"
                    placeholder="Full shipping address..."
                    {...register('buyerAddress', { required: 'Required' })}
                  />
                </div>

                <div className="p-4 bg-primary-400/10 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Check className="w-5 h-5 text-primary-400" />
                    <span className="text-white font-medium">Secure Payment</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    You'll be redirected to our secure payment provider to complete your purchase with cryptocurrency.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isPurchasing}
                  className="btn-primary w-full py-4"
                >
                  {isPurchasing ? 'Processing...' : `Pay $${selectedProduct.price}`}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Shop
