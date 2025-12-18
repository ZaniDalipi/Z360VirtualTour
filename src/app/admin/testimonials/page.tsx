'use client'

import { useState, useEffect } from 'react'
import { Plus, Star, Edit2, Trash2, X, Check } from 'lucide-react'
import { Card, Button, Input } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'

interface Testimonial {
  id: string
  clientName: string
  clientTitle: string | null
  clientImage: string | null
  content: string
  rating: number
  featured: boolean
  isActive: boolean
  createdAt: string
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    clientName: '',
    clientTitle: '',
    content: '',
    rating: 5,
    featured: false,
    isActive: true,
  })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/admin/testimonials')
      if (res.ok) {
        const data = await res.json()
        setTestimonials(data)
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingId
        ? `/api/admin/testimonials/${editingId}`
        : '/api/admin/testimonials'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        fetchTestimonials()
        resetForm()
      }
    } catch (error) {
      console.error('Failed to save testimonial:', error)
    }
  }

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      clientName: testimonial.clientName,
      clientTitle: testimonial.clientTitle || '',
      content: testimonial.content,
      rating: testimonial.rating,
      featured: testimonial.featured,
      isActive: testimonial.isActive,
    })
    setEditingId(testimonial.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return

    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setTestimonials((prev) => prev.filter((t) => t.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete testimonial:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientTitle: '',
      content: '',
      rating: 5,
      featured: false,
      isActive: true,
    })
    setEditingId(null)
    setShowForm(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gold/10 rounded animate-pulse" />
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-gold/10 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-bold text-cream">Testimonials</h1>
          <p className="text-body text-cream-muted">
            Manage client testimonials shown on the website
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={resetForm}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg px-4"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-h3 font-semibold text-cream">
                    {editingId ? 'Edit Testimonial' : 'Add Testimonial'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 rounded-lg text-cream-muted hover:text-cream hover:bg-gold/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      Client Name *
                    </label>
                    <Input
                      value={formData.clientName}
                      onChange={(e) =>
                        setFormData({ ...formData, clientName: e.target.value })
                      }
                      placeholder="Marko Petrovski"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      Client Title
                    </label>
                    <Input
                      value={formData.clientTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, clientTitle: e.target.value })
                      }
                      placeholder="CEO at Company"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      Testimonial *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      placeholder="What did the client say about your service?"
                      rows={4}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-navy border border-gold/20 text-cream
                                 placeholder:text-cream-muted focus:outline-none focus:ring-2
                                 focus:ring-gold/50 focus:border-gold/50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      Rating
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className="p-1"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= formData.rating
                                ? 'text-gold fill-gold'
                                : 'text-cream-muted'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) =>
                          setFormData({ ...formData, featured: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-gold/20 bg-navy text-gold focus:ring-gold/50"
                      />
                      <span className="text-sm text-cream">Featured</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({ ...formData, isActive: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-gold/20 bg-navy text-gold focus:ring-gold/50"
                      />
                      <span className="text-sm text-cream">Active</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingId ? 'Update' : 'Add'} Testimonial
                    </Button>
                    <Button type="button" variant="secondary" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Testimonials Grid */}
      {testimonials.length === 0 ? (
        <Card className="p-12 text-center">
          <Star className="w-12 h-12 text-cream-muted mx-auto mb-4" />
          <p className="text-cream-muted mb-4">No testimonials yet</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Testimonial
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                className={`p-6 h-full ${
                  !testimonial.isActive ? 'opacity-50' : ''
                } ${testimonial.featured ? 'border-gold/40' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-cream">
                        {testimonial.clientName}
                      </h3>
                      {testimonial.featured && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gold/20 text-gold">
                          Featured
                        </span>
                      )}
                      {!testimonial.isActive && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                          Inactive
                        </span>
                      )}
                    </div>
                    {testimonial.clientTitle && (
                      <p className="text-sm text-cream-muted">
                        {testimonial.clientTitle}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-gold fill-gold" />
                    ))}
                  </div>
                </div>

                <p className="text-cream-soft mb-4 line-clamp-3">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gold/10">
                  <span className="text-xs text-cream-muted">
                    {new Date(testimonial.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(testimonial)}
                      className="p-2 rounded-lg text-cream-muted hover:text-cream hover:bg-gold/10"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(testimonial.id)}
                      className="p-2 rounded-lg text-cream-muted hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
