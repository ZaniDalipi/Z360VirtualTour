'use client'

import { useState, useEffect } from 'react'
import { Save, MapPin, Clock, Percent, Calendar, Users } from 'lucide-react'
import { Card, Button, Input } from '@/components/ui'
import { motion } from 'framer-motion'

interface BookingSettings {
  id: string
  defaultMinLeadDays: number
  maxAdvanceBookingDays: number
  businessAddress: string | null
  businessCity: string
  businessLatitude: number | null
  businessLongitude: number | null
  includeReturnTrip: boolean
  freeDistanceKm: number
  workOnWeekends: boolean
  workOnSunday: boolean
  quoteValidDays: number
  requireDeposit: boolean
  depositPercent: number
  minBundleParticipants: number
  bundleDiscountPercent: number
}

interface UrgencyTier {
  id: string
  name: string
  displayName: string
  description: string | null
  minLeadDays: number
  maxLeadDays: number | null
  surchargePercent: number
  isActive: boolean
  order: number
}

interface TravelZone {
  id: string
  name: string
  description: string | null
  minDistanceKm: number
  maxDistanceKm: number | null
  flatFee: number | null
  perKmRate: number | null
  isIncluded: boolean
  isActive: boolean
  order: number
}

export default function BookingSettingsPage() {
  const [settings, setSettings] = useState<BookingSettings | null>(null)
  const [urgencyTiers, setUrgencyTiers] = useState<UrgencyTier[]>([])
  const [travelZones, setTravelZones] = useState<TravelZone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'urgency' | 'travel'>('general')

  // Form state for settings
  const [formData, setFormData] = useState({
    defaultMinLeadDays: 3,
    maxAdvanceBookingDays: 90,
    businessAddress: '',
    businessCity: 'Skopje',
    includeReturnTrip: true,
    freeDistanceKm: 15,
    workOnWeekends: false,
    workOnSunday: false,
    quoteValidDays: 14,
    requireDeposit: true,
    depositPercent: 30,
    minBundleParticipants: 3,
    bundleDiscountPercent: 10,
  })

  // Urgency tier form
  const [showTierForm, setShowTierForm] = useState(false)
  const [editingTier, setEditingTier] = useState<UrgencyTier | null>(null)
  const [tierFormData, setTierFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    minLeadDays: 1,
    maxLeadDays: '',
    surchargePercent: 0,
    isActive: true,
    order: 0,
  })

  // Travel zone form
  const [showZoneForm, setShowZoneForm] = useState(false)
  const [editingZone, setEditingZone] = useState<TravelZone | null>(null)
  const [zoneFormData, setZoneFormData] = useState({
    name: '',
    description: '',
    minDistanceKm: 0,
    maxDistanceKm: '',
    flatFee: '',
    perKmRate: '',
    isIncluded: false,
    isActive: true,
    order: 0,
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const [settingsRes, tiersRes, zonesRes] = await Promise.all([
        fetch('/api/admin/booking-settings'),
        fetch('/api/admin/urgency-tiers'),
        fetch('/api/admin/travel-zones'),
      ])

      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setSettings(data)
        if (data) {
          setFormData({
            defaultMinLeadDays: data.defaultMinLeadDays,
            maxAdvanceBookingDays: data.maxAdvanceBookingDays,
            businessAddress: data.businessAddress || '',
            businessCity: data.businessCity,
            includeReturnTrip: data.includeReturnTrip,
            freeDistanceKm: data.freeDistanceKm,
            workOnWeekends: data.workOnWeekends,
            workOnSunday: data.workOnSunday,
            quoteValidDays: data.quoteValidDays,
            requireDeposit: data.requireDeposit,
            depositPercent: data.depositPercent,
            minBundleParticipants: data.minBundleParticipants,
            bundleDiscountPercent: data.bundleDiscountPercent,
          })
        }
      }

      if (tiersRes.ok) {
        setUrgencyTiers(await tiersRes.json())
      }

      if (zonesRes.ok) {
        setTravelZones(await zonesRes.json())
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/booking-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Urgency tier handlers
  const handleSaveTier = async () => {
    try {
      const url = editingTier
        ? `/api/admin/urgency-tiers/${editingTier.id}`
        : '/api/admin/urgency-tiers'
      const method = editingTier ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tierFormData),
      })

      if (res.ok) {
        fetchAllData()
        resetTierForm()
      }
    } catch (error) {
      console.error('Failed to save tier:', error)
    }
  }

  const handleDeleteTier = async (id: string) => {
    if (!confirm('Delete this urgency tier?')) return
    try {
      await fetch(`/api/admin/urgency-tiers/${id}`, { method: 'DELETE' })
      fetchAllData()
    } catch (error) {
      console.error('Failed to delete tier:', error)
    }
  }

  const editTier = (tier: UrgencyTier) => {
    setEditingTier(tier)
    setTierFormData({
      name: tier.name,
      displayName: tier.displayName,
      description: tier.description || '',
      minLeadDays: tier.minLeadDays,
      maxLeadDays: tier.maxLeadDays?.toString() || '',
      surchargePercent: tier.surchargePercent,
      isActive: tier.isActive,
      order: tier.order,
    })
    setShowTierForm(true)
  }

  const resetTierForm = () => {
    setEditingTier(null)
    setShowTierForm(false)
    setTierFormData({
      name: '',
      displayName: '',
      description: '',
      minLeadDays: 1,
      maxLeadDays: '',
      surchargePercent: 0,
      isActive: true,
      order: 0,
    })
  }

  // Travel zone handlers
  const handleSaveZone = async () => {
    try {
      const url = editingZone
        ? `/api/admin/travel-zones/${editingZone.id}`
        : '/api/admin/travel-zones'
      const method = editingZone ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(zoneFormData),
      })

      if (res.ok) {
        fetchAllData()
        resetZoneForm()
      }
    } catch (error) {
      console.error('Failed to save zone:', error)
    }
  }

  const handleDeleteZone = async (id: string) => {
    if (!confirm('Delete this travel zone?')) return
    try {
      await fetch(`/api/admin/travel-zones/${id}`, { method: 'DELETE' })
      fetchAllData()
    } catch (error) {
      console.error('Failed to delete zone:', error)
    }
  }

  const editZone = (zone: TravelZone) => {
    setEditingZone(zone)
    setZoneFormData({
      name: zone.name,
      description: zone.description || '',
      minDistanceKm: zone.minDistanceKm,
      maxDistanceKm: zone.maxDistanceKm?.toString() || '',
      flatFee: zone.flatFee?.toString() || '',
      perKmRate: zone.perKmRate?.toString() || '',
      isIncluded: zone.isIncluded,
      isActive: zone.isActive,
      order: zone.order,
    })
    setShowZoneForm(true)
  }

  const resetZoneForm = () => {
    setEditingZone(null)
    setShowZoneForm(false)
    setZoneFormData({
      name: '',
      description: '',
      minDistanceKm: 0,
      maxDistanceKm: '',
      flatFee: '',
      perKmRate: '',
      isIncluded: false,
      isActive: true,
      order: 0,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gold/10 rounded animate-pulse" />
        <div className="h-64 bg-gold/10 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-h2 font-bold text-cream">Booking Settings</h1>
        <p className="text-body text-cream-muted">
          Configure scheduling, pricing, and travel options for bookings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gold/10">
        {[
          { id: 'general', label: 'General Settings', icon: Calendar },
          { id: 'urgency', label: 'Urgency Tiers', icon: Clock },
          { id: 'travel', label: 'Travel Zones', icon: MapPin },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-gold text-gold'
                  : 'border-transparent text-cream-muted hover:text-cream'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Lead Time Settings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-cream mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold" />
              Lead Time Settings
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cream mb-2">
                  Minimum Lead Days
                </label>
                <Input
                  type="number"
                  value={formData.defaultMinLeadDays}
                  onChange={(e) => setFormData({ ...formData, defaultMinLeadDays: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-cream-muted mt-1">Minimum days before a booking can be scheduled</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-cream mb-2">
                  Max Advance Booking (Days)
                </label>
                <Input
                  type="number"
                  value={formData.maxAdvanceBookingDays}
                  onChange={(e) => setFormData({ ...formData, maxAdvanceBookingDays: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-cream-muted mt-1">How far in advance clients can book</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-cream mb-2">
                  Quote Valid Days
                </label>
                <Input
                  type="number"
                  value={formData.quoteValidDays}
                  onChange={(e) => setFormData({ ...formData, quoteValidDays: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-cream-muted mt-1">Days until a quote expires</p>
              </div>
            </div>
          </Card>

          {/* Business Location */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-cream mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gold" />
              Business Location
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cream mb-2">
                  Business City
                </label>
                <Input
                  value={formData.businessCity}
                  onChange={(e) => setFormData({ ...formData, businessCity: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cream mb-2">
                  Business Address (optional)
                </label>
                <Input
                  value={formData.businessAddress}
                  onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                />
              </div>
            </div>
          </Card>

          {/* Travel Settings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-cream mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gold" />
              Travel Settings
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cream mb-2">
                  Free Distance (km)
                </label>
                <Input
                  type="number"
                  value={formData.freeDistanceKm}
                  onChange={(e) => setFormData({ ...formData, freeDistanceKm: parseFloat(e.target.value) || 0 })}
                />
                <p className="text-xs text-cream-muted mt-1">Travel included free of charge within this distance</p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeReturnTrip}
                    onChange={(e) => setFormData({ ...formData, includeReturnTrip: e.target.checked })}
                    className="w-4 h-4 rounded border-gold/20 bg-navy text-gold focus:ring-gold/50"
                  />
                  <span className="text-sm text-cream">Charge for return trip</span>
                </label>
              </div>
            </div>
          </Card>

          {/* Deposit Settings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-cream mb-4 flex items-center gap-2">
              <Percent className="w-5 h-5 text-gold" />
              Deposit Settings
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requireDeposit}
                    onChange={(e) => setFormData({ ...formData, requireDeposit: e.target.checked })}
                    className="w-4 h-4 rounded border-gold/20 bg-navy text-gold focus:ring-gold/50"
                  />
                  <span className="text-sm text-cream">Require deposit</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-cream mb-2">
                  Deposit Percentage (%)
                </label>
                <Input
                  type="number"
                  value={formData.depositPercent}
                  onChange={(e) => setFormData({ ...formData, depositPercent: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </Card>

          {/* Bundle Settings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-cream mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-gold" />
              Bundle Settings
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cream mb-2">
                  Min Bundle Participants
                </label>
                <Input
                  type="number"
                  value={formData.minBundleParticipants}
                  onChange={(e) => setFormData({ ...formData, minBundleParticipants: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-cream-muted mt-1">Minimum participants to activate bundle pricing</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-cream mb-2">
                  Default Bundle Discount (%)
                </label>
                <Input
                  type="number"
                  value={formData.bundleDiscountPercent}
                  onChange={(e) => setFormData({ ...formData, bundleDiscountPercent: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </Card>

          {/* Working Days */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-cream mb-4">Working Days</h3>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.workOnWeekends}
                  onChange={(e) => setFormData({ ...formData, workOnWeekends: e.target.checked })}
                  className="w-4 h-4 rounded border-gold/20 bg-navy text-gold focus:ring-gold/50"
                />
                <span className="text-sm text-cream">Work on Saturdays</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.workOnSunday}
                  onChange={(e) => setFormData({ ...formData, workOnSunday: e.target.checked })}
                  className="w-4 h-4 rounded border-gold/20 bg-navy text-gold focus:ring-gold/50"
                />
                <span className="text-sm text-cream">Work on Sundays</span>
              </label>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Urgency Tiers Tab */}
      {activeTab === 'urgency' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <p className="text-cream-muted">
              Configure urgency levels with different surcharges
            </p>
            <Button onClick={() => setShowTierForm(true)}>Add Tier</Button>
          </div>

          {showTierForm && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-cream mb-4">
                {editingTier ? 'Edit Tier' : 'Add Tier'}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">Name (key)</label>
                  <Input
                    value={tierFormData.name}
                    onChange={(e) => setTierFormData({ ...tierFormData, name: e.target.value })}
                    placeholder="express"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">Display Name</label>
                  <Input
                    value={tierFormData.displayName}
                    onChange={(e) => setTierFormData({ ...tierFormData, displayName: e.target.value })}
                    placeholder="Express Delivery"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-cream mb-2">Description</label>
                  <Input
                    value={tierFormData.description}
                    onChange={(e) => setTierFormData({ ...tierFormData, description: e.target.value })}
                    placeholder="3-5 business days turnaround"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">Min Lead Days</label>
                  <Input
                    type="number"
                    value={tierFormData.minLeadDays}
                    onChange={(e) => setTierFormData({ ...tierFormData, minLeadDays: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">Max Lead Days (optional)</label>
                  <Input
                    type="number"
                    value={tierFormData.maxLeadDays}
                    onChange={(e) => setTierFormData({ ...tierFormData, maxLeadDays: e.target.value })}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">Surcharge (%)</label>
                  <Input
                    type="number"
                    value={tierFormData.surchargePercent}
                    onChange={(e) => setTierFormData({ ...tierFormData, surchargePercent: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">Order</label>
                  <Input
                    type="number"
                    value={tierFormData.order}
                    onChange={(e) => setTierFormData({ ...tierFormData, order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tierFormData.isActive}
                      onChange={(e) => setTierFormData({ ...tierFormData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-gold/20 bg-navy text-gold focus:ring-gold/50"
                    />
                    <span className="text-sm text-cream">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSaveTier}>Save</Button>
                <Button variant="secondary" onClick={resetTierForm}>Cancel</Button>
              </div>
            </Card>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            {urgencyTiers.map((tier) => (
              <Card key={tier.id} className={`p-4 ${!tier.isActive ? 'opacity-50' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-cream">{tier.displayName}</h4>
                    <p className="text-xs text-cream-muted">{tier.name}</p>
                  </div>
                  <span className="text-gold font-bold">+{tier.surchargePercent}%</span>
                </div>
                <p className="text-sm text-cream-muted mb-2">{tier.description}</p>
                <p className="text-xs text-cream-muted">
                  Lead: {tier.minLeadDays}-{tier.maxLeadDays || '∞'} days
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => editTier(tier)}
                    className="text-xs text-gold hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTier(tier.id)}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Travel Zones Tab */}
      {activeTab === 'travel' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <p className="text-cream-muted">
              Configure distance-based travel pricing
            </p>
            <Button onClick={() => setShowZoneForm(true)}>Add Zone</Button>
          </div>

          {showZoneForm && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-cream mb-4">
                {editingZone ? 'Edit Zone' : 'Add Zone'}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">Name</label>
                  <Input
                    value={zoneFormData.name}
                    onChange={(e) => setZoneFormData({ ...zoneFormData, name: e.target.value })}
                    placeholder="Regional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">Description</label>
                  <Input
                    value={zoneFormData.description}
                    onChange={(e) => setZoneFormData({ ...zoneFormData, description: e.target.value })}
                    placeholder="30-60km from base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">Min Distance (km)</label>
                  <Input
                    type="number"
                    value={zoneFormData.minDistanceKm}
                    onChange={(e) => setZoneFormData({ ...zoneFormData, minDistanceKm: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">Max Distance (km)</label>
                  <Input
                    type="number"
                    value={zoneFormData.maxDistanceKm}
                    onChange={(e) => setZoneFormData({ ...zoneFormData, maxDistanceKm: e.target.value })}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">Flat Fee (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={zoneFormData.flatFee}
                    onChange={(e) => setZoneFormData({ ...zoneFormData, flatFee: e.target.value })}
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">Per km Rate (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={zoneFormData.perKmRate}
                    onChange={(e) => setZoneFormData({ ...zoneFormData, perKmRate: e.target.value })}
                    placeholder="0.50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">Order</label>
                  <Input
                    type="number"
                    value={zoneFormData.order}
                    onChange={(e) => setZoneFormData({ ...zoneFormData, order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={zoneFormData.isIncluded}
                      onChange={(e) => setZoneFormData({ ...zoneFormData, isIncluded: e.target.checked })}
                      className="w-4 h-4 rounded border-gold/20 bg-navy text-gold focus:ring-gold/50"
                    />
                    <span className="text-sm text-cream">Included (no extra charge)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={zoneFormData.isActive}
                      onChange={(e) => setZoneFormData({ ...zoneFormData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-gold/20 bg-navy text-gold focus:ring-gold/50"
                    />
                    <span className="text-sm text-cream">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSaveZone}>Save</Button>
                <Button variant="secondary" onClick={resetZoneForm}>Cancel</Button>
              </div>
            </Card>
          )}

          <div className="space-y-3">
            {travelZones.map((zone) => (
              <Card key={zone.id} className={`p-4 ${!zone.isActive ? 'opacity-50' : ''}`}>
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-cream">{zone.name}</h4>
                      {zone.isIncluded && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                          Included
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-cream-muted">{zone.description}</p>
                    <p className="text-xs text-cream-muted mt-1">
                      {zone.minDistanceKm}-{zone.maxDistanceKm || '∞'} km
                      {!zone.isIncluded && (
                        <span className="ml-2">
                          | €{zone.flatFee || 0} + €{zone.perKmRate || 0}/km
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editZone(zone)}
                      className="text-xs text-gold hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteZone(zone.id)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
