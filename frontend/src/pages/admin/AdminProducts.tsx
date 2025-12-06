import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Package, Plus, Edit, Trash2, X, Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import { Product } from '../../types'

interface ProductForm {
  name: string
  description: string
  price: number
  originalPrice: number
  material: string
  dimensions: string
  isAvailable: boolean
  isFeatured: boolean
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, setValue } = useForm<ProductForm>()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await api.get('/admin/products')
      setProducts(response.data.products)
    } catch {
      toast.error('Failed to load products')
    }
    setIsLoading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB')
      return
    }

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.url) {
        setImages([...images, response.data.url])
        toast.success('Image uploaded!')
      }
    } catch (error) {
      toast.error('Failed to upload image')
    }
    setUploadingImage(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setValue('name', product.name)
      setValue('description', product.description)
      setValue('price', product.price)
      setValue('originalPrice', product.originalPrice)
      setValue('material', product.material || '')
      setValue('dimensions', product.dimensions || '')
      setValue('isAvailable', product.isAvailable)
      setValue('isFeatured', product.isFeatured)
      setImages(product.images || [])
    } else {
      setEditingProduct(null)
      reset({
        name: '',
        description: '',
        price: 550,
        originalPrice: 600,
        material: 'Silk and Natural Fibers',
        dimensions: '50x50cm',
        isAvailable: true,
        isFeatured: false,
      })
      setImages([])
    }
    setShowModal(true)
  }

  const saveProduct = async (data: ProductForm) => {
    try {
      const productData = { ...data, images }
      if (editingProduct) {
        await api.patch(`/admin/products/${editingProduct.id}`, productData)
        toast.success('Product updated!')
      } else {
        await api.post('/admin/products', productData)
        toast.success('Product created!')
      }
      setShowModal(false)
      setImages([])
      fetchProducts()
    } catch {
      toast.error('Failed to save product')
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await api.delete(`/admin/products/${id}`)
      toast.success('Product deleted!')
      fetchProducts()
    } catch {
      toast.error('Failed to delete product')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Products</h1>
          <p className="text-gray-400">Manage shop products</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square bg-dark-700 rounded-lg mb-4" />
              <div className="h-4 bg-dark-700 rounded w-3/4" />
            </div>
          ))
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="w-16 h-16 text-primary-400/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Products</h3>
            <p className="text-gray-400">Add your first product</p>
          </div>
        ) : (
          products.map((product) => (
            <motion.div
              key={product.id}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="aspect-square bg-dark-700 rounded-lg mb-4 flex items-center justify-center">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Package className="w-12 h-12 text-primary-400/30" />
                )}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{product.name}</h3>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-primary-400 font-bold">${product.price}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${product.isAvailable ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                  {product.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => openModal(product)} className="btn-secondary flex-1 py-2 text-sm">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button onClick={() => deleteProduct(product.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit(saveProduct)} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="label">Product Images</label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {images.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-dark-700">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-gray-600 hover:border-primary-400 flex flex-col items-center justify-center cursor-pointer transition-colors">
                      {uploadingImage ? (
                        <div className="animate-spin w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-gray-400 mb-1" />
                          <span className="text-xs text-gray-400">Upload</span>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-500">Max 5 images, 10MB each. JPG, PNG, WebP</p>
              </div>

              <div>
                <label className="label">Name</label>
                <input type="text" className="input" {...register('name', { required: true })} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input min-h-[100px]" {...register('description', { required: true })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Price ($)</label>
                  <input type="number" className="input" {...register('price', { required: true, valueAsNumber: true })} />
                </div>
                <div>
                  <label className="label">Original Price ($)</label>
                  <input type="number" className="input" {...register('originalPrice', { required: true, valueAsNumber: true })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Material</label>
                  <input type="text" className="input" {...register('material')} />
                </div>
                <div>
                  <label className="label">Dimensions</label>
                  <input type="text" className="input" {...register('dimensions')} />
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-primary-400" {...register('isAvailable')} />
                  <span className="text-gray-400">Available</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-primary-400" {...register('isFeatured')} />
                  <span className="text-gray-400">Featured</span>
                </label>
              </div>
              <button type="submit" className="btn-primary w-full">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts
