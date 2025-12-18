'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, DollarSign, Star, Check } from 'lucide-react'
import { Card, Button, Input } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'

interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  priceLabel: string | null
  features: string
  isPopular: boolean
  isActive: boolean
  order: number
}

export default function PricingAdminPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    priceLabel: '',
    features: [''],
    isPopular: false,
    isActive: true,
    order: 0,
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/admin/pricing')
      if (res.ok) {
        const data = await res.json()
        setPlans(data)
      }
    } catch (error) {
      console.error('Failed to fetch pricing plans:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingId
        ? `/api/admin/pricing/${editingId}`
        : '/api/admin/pricing'
      const method = editingId ? 'PUT' : 'POST'

      // Filter out empty features
      const filteredFeatures = formData.features.filter(f => f.trim() !== '')

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          features: filteredFeatures,
        }),
      })

      if (res.ok) {
        fetchPlans()
        resetForm()
      }
    } catch (error) {
      console.error('Failed to save pricing plan:', error)
    }
  }

  const handleEdit = (plan: PricingPlan) => {
    let features: string[] = []
    try {
      features = JSON.parse(plan.features || '[]')
    } catch {
      features = []
    }

    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      priceLabel: plan.priceLabel || '',
      features: features.length > 0 ? features : [''],
      isPopular: plan.isPopular,
      isActive: plan.isActive,
      order: plan.order,
    })
    setEditingId(plan.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing plan?')) return

    try {
      const res = await fetch(`/api/admin/pricing/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setPlans((prev) => prev.filter((p) => p.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete pricing plan:', error)
    }
  }

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] })
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData({ ...formData, features: newFeatures })
  }

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index)
    setFormData({ ...formData, features: newFeatures.length > 0 ? newFeatures : [''] })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      priceLabel: '',
      features: [''],
      isPopular: false,
      isActive: true,
      order: 0,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const parseFeatures = (featuresJson: string): string[] => {
    try {
      return JSON.parse(featuresJson || '[]')
    } catch {
      return []
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gold/10 rounded animate-pulse" />
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gold/10 rounded-xl animate-pulse" />
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
          <h1 className="text-h2 font-bold text-cream">Pricing Plans</h1>
          <p className="text-body text-cream-muted">
            Manage your service pricing displayed on the website
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Plan
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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto px-4"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-h3 font-semibold text-cream">
                    {editingId ? 'Edit Plan' : 'Add Plan'}
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
                      Plan Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Basic, Standard, Premium..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Perfect for small businesses..."
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-navy border border-gold/20 text-cream
                                 placeholder:text-cream-muted focus:outline-none focus:ring-2
                                 focus:ring-gold/50 focus:border-gold/50 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Price (€) *
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="199"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Price Label
                      </label>
                      <Input
                        value={formData.priceLabel}
                        onChange={(e) => setFormData({ ...formData, priceLabel: e.target.value })}
                        placeholder="Starting at, From..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      Features
                    </label>
                    <div className="space-y-2">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={feature}
                            onChange={(e) => updateFeature(index, e.target.value)}
                            placeholder="Feature description..."
                            className="flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="p-3 rounded-xl text-red-400 hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addFeature}
                      className="mt-2 text-sm text-gold hover:text-gold/80"
                    >
                      + Add Feature
                    </button>
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPopular}
                        onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                        className="w-4 h-4 rounded border-gold/20 bg-navy text-gold focus:ring-gold/50"
                      />
                      <span className="text-sm text-cream">Popular (highlighted)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 rounded border-gold/20 bg-navy text-gold focus:ring-gold/50"
                      />
                      <span className="text-sm text-cream">Active</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingId ? 'Update' : 'Add'} Plan
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

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <Card className="p-12 text-center">
          <DollarSign className="w-12 h-12 text-cream-muted mx-auto mb-4" />
          <p className="text-cream-muted mb-4">No pricing plans yet</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Plan
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const features = parseFeatures(plan.features)
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  className={`p-6 relative ${!plan.isActive ? 'opacity-50' : ''} ${
                    plan.isPopular ? 'border-gold/40 ring-2 ring-gold/20' : ''
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gold text-navy text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" fill="currentColor" />
                        Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-cream">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-sm text-cream-muted mt-1">{plan.description}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    {plan.priceLabel && (
                      <span className="text-sm text-cream-muted">{plan.priceLabel}</span>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gold">€{plan.price}</span>
                    </div>
                  </div>

                  {features.length > 0 && (
                    <ul className="space-y-2 mb-6">
                      {features.slice(0, 5).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-cream-muted">
                          <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                      {features.length > 5 && (
                        <li className="text-sm text-cream-muted">
                          +{features.length - 5} more features
                        </li>
                      )}
                    </ul>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gold/10">
                    <span className="text-xs text-cream-muted">
                      Order: {plan.order}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="p-2 rounded-lg text-cream-muted hover:text-cream hover:bg-gold/10"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="p-2 rounded-lg text-cream-muted hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
