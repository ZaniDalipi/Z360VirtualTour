'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Users, MapPin, Calendar, Percent } from 'lucide-react'
import { Card, Button, Input } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'

interface TravelBundle {
  id: string
  name: string
  city: string
  region: string | null
  startDate: string
  endDate: string
  scheduledDate: string
  maxParticipants: number
  currentCount: number
  distanceKm: number | null
  totalTravelCost: number | null
  perPersonTravelFee: number | null
  discountPercent: number
  description: string | null
  status: string
  isActive: boolean
  registrationDeadline: string | null
}

const statusColors: Record<string, string> = {
  open: 'bg-green-500/20 text-green-400',
  full: 'bg-yellow-500/20 text-yellow-400',
  scheduled: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-gray-500/20 text-gray-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

export default function BundlesAdminPage() {
  const [bundles, setBundles] = useState<TravelBundle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    region: '',
    startDate: '',
    endDate: '',
    maxParticipants: 10,
    distanceKm: '',
    totalTravelCost: '',
    perPersonTravelFee: '',
    discountPercent: 10,
    description: '',
    status: 'open',
    isActive: true,
    registrationDeadline: '',
  })

  useEffect(() => {
    fetchBundles()
  }, [])

  const fetchBundles = async () => {
    try {
      const res = await fetch('/api/admin/travel-bundles')
      if (res.ok) {
        setBundles(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch bundles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingId
        ? `/api/admin/travel-bundles/${editingId}`
        : '/api/admin/travel-bundles'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          distanceKm: formData.distanceKm ? parseFloat(formData.distanceKm) : null,
          totalTravelCost: formData.totalTravelCost ? parseFloat(formData.totalTravelCost) : null,
          perPersonTravelFee: formData.perPersonTravelFee ? parseFloat(formData.perPersonTravelFee) : null,
        }),
      })

      if (res.ok) {
        fetchBundles()
        resetForm()
      }
    } catch (error) {
      console.error('Failed to save bundle:', error)
    }
  }

  const handleEdit = (bundle: TravelBundle) => {
    setFormData({
      name: bundle.name,
      city: bundle.city,
      region: bundle.region || '',
      startDate: bundle.startDate?.split('T')[0] || '',
      endDate: bundle.endDate?.split('T')[0] || '',
      maxParticipants: bundle.maxParticipants,
      distanceKm: bundle.distanceKm?.toString() || '',
      totalTravelCost: bundle.totalTravelCost?.toString() || '',
      perPersonTravelFee: bundle.perPersonTravelFee?.toString() || '',
      discountPercent: bundle.discountPercent,
      description: bundle.description || '',
      status: bundle.status,
      isActive: bundle.isActive,
      registrationDeadline: bundle.registrationDeadline?.split('T')[0] || '',
    })
    setEditingId(bundle.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this travel bundle?')) return

    try {
      await fetch(`/api/admin/travel-bundles/${id}`, { method: 'DELETE' })
      fetchBundles()
    } catch (error) {
      console.error('Failed to delete bundle:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      city: '',
      region: '',
      startDate: '',
      endDate: '',
      maxParticipants: 10,
      distanceKm: '',
      totalTravelCost: '',
      perPersonTravelFee: '',
      discountPercent: 10,
      description: '',
      status: 'open',
      isActive: true,
      registrationDeadline: '',
    })
    setEditingId(null)
    setShowForm(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gold/10 rounded animate-pulse" />
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
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
          <h1 className="text-h2 font-bold text-cream">Travel Bundles</h1>
          <p className="text-body text-cream-muted">
            Group bookings for efficient travel - clients share costs
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Bundle
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
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-h3 font-semibold text-cream">
                    {editingId ? 'Edit Bundle' : 'Create Bundle'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 rounded-lg text-cream-muted hover:text-cream hover:bg-gold/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Bundle Name *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ohrid Trip - January 2025"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        City *
                      </label>
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Ohrid"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Region
                      </label>
                      <Input
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        placeholder="Southwest Macedonia"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Distance from Base (km)
                      </label>
                      <Input
                        type="number"
                        value={formData.distanceKm}
                        onChange={(e) => setFormData({ ...formData, distanceKm: e.target.value })}
                        placeholder="175"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Start Date *
                      </label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        End Date *
                      </label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      Registration Deadline
                    </label>
                    <Input
                      type="date"
                      value={formData.registrationDeadline}
                      onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Max Participants
                      </label>
                      <Input
                        type="number"
                        value={formData.maxParticipants}
                        onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 10 })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Total Travel Cost (€)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.totalTravelCost}
                        onChange={(e) => setFormData({ ...formData, totalTravelCost: e.target.value })}
                        placeholder="120"
                      />
                      <p className="text-xs text-cream-muted mt-1">Will be split among participants</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Per Person Fee (€)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.perPersonTravelFee}
                        onChange={(e) => setFormData({ ...formData, perPersonTravelFee: e.target.value })}
                        placeholder="Or set fixed per-person"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Bundle Discount (%)
                      </label>
                      <Input
                        type="number"
                        value={formData.discountPercent}
                        onChange={(e) => setFormData({ ...formData, discountPercent: parseFloat(e.target.value) || 0 })}
                      />
                      <p className="text-xs text-cream-muted mt-1">Discount on service for bundle participants</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-navy border border-gold/20 text-cream focus:outline-none focus:ring-2 focus:ring-gold/50"
                      >
                        <option value="open">Open</option>
                        <option value="full">Full</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Join our Ohrid photography trip! Share travel costs..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-navy border border-gold/20 text-cream placeholder:text-cream-muted focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-gold/20 bg-navy text-gold focus:ring-gold/50"
                    />
                    <span className="text-sm text-cream">Active (visible to clients)</span>
                  </label>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingId ? 'Update' : 'Create'} Bundle
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

      {/* Bundles Grid */}
      {bundles.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 text-cream-muted mx-auto mb-4" />
          <p className="text-cream-muted mb-4">No travel bundles yet</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Bundle
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {bundles.map((bundle) => (
            <motion.div
              key={bundle.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`p-6 ${!bundle.isActive ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-cream">{bundle.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-gold" />
                      <span className="text-cream-muted">{bundle.city}</span>
                      {bundle.region && (
                        <span className="text-cream-dim">• {bundle.region}</span>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${statusColors[bundle.status]}`}>
                    {bundle.status.charAt(0).toUpperCase() + bundle.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cream-muted" />
                    <span className="text-sm text-cream">
                      {bundle.startDate === bundle.endDate || !bundle.endDate
                        ? formatDate(bundle.startDate)
                        : `${formatDate(bundle.startDate)} - ${formatDate(bundle.endDate)}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-cream-muted" />
                    <span className="text-sm text-cream">
                      {bundle.currentCount} / {bundle.maxParticipants} spots
                    </span>
                  </div>
                  {bundle.distanceKm && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cream-muted" />
                      <span className="text-sm text-cream-muted">{bundle.distanceKm} km</span>
                    </div>
                  )}
                  {bundle.discountPercent > 0 && (
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">{bundle.discountPercent}% off</span>
                    </div>
                  )}
                </div>

                {(bundle.totalTravelCost || bundle.perPersonTravelFee) && (
                  <div className="bg-navy/50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-cream-muted mb-1">Travel Cost</p>
                    {bundle.perPersonTravelFee ? (
                      <p className="text-gold font-semibold">€{bundle.perPersonTravelFee} / person</p>
                    ) : bundle.totalTravelCost ? (
                      <p className="text-cream">
                        €{bundle.totalTravelCost} total
                        <span className="text-cream-muted text-sm ml-2">
                          (~€{(bundle.totalTravelCost / Math.max(bundle.currentCount, 1)).toFixed(2)} each)
                        </span>
                      </p>
                    ) : null}
                  </div>
                )}

                {bundle.description && (
                  <p className="text-sm text-cream-muted mb-4 line-clamp-2">
                    {bundle.description}
                  </p>
                )}

                {bundle.registrationDeadline && (
                  <p className="text-xs text-cream-muted mb-4">
                    Registration deadline: {formatDate(bundle.registrationDeadline)}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gold/10">
                  <div className="w-full bg-navy-medium rounded-full h-2">
                    <div
                      className="bg-gold h-2 rounded-full transition-all"
                      style={{ width: `${(bundle.currentCount / bundle.maxParticipants) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(bundle)}
                      className="p-2 rounded-lg text-cream-muted hover:text-cream hover:bg-gold/10"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(bundle.id)}
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
