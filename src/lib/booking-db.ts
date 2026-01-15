import Database from 'better-sqlite3'
import path from 'path'

// Initialize database connection
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const db = new Database(dbPath)

// Helper to convert SQLite boolean (0/1) to JS boolean
function toBool(val: number | null): boolean {
  return val === 1
}

// Helper to convert JS boolean to SQLite (0/1)
function toInt(val: boolean | undefined | null): number {
  return val ? 1 : 0
}

// Types
export interface UrgencyTier {
  id: string
  name: string
  displayName: string
  description: string | null
  minLeadDays: number
  maxLeadDays: number | null
  surchargePercent: number
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface TravelZone {
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
  createdAt: string
  updatedAt: string
}

export interface TravelBundle {
  id: string
  name: string
  city: string
  region: string | null
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
  createdAt: string
  updatedAt: string
}

export interface BlockedDate {
  id: string
  date: string
  reason: string | null
  isAllDay: boolean
  createdAt: string
}

export interface Booking {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string | null
  companyName: string | null
  propertyAddress: string
  propertyCity: string | null
  estimatedDistance: number | null
  serviceType: string | null
  projectDescription: string | null
  specialRequests: string | null
  pricingPlanId: string | null
  urgencyTierId: string | null
  preferredDate: string | null
  alternateDate: string | null
  deadlineDate: string | null
  confirmedDate: string | null
  isFlexible: boolean
  travelZoneId: string | null
  travelBundleId: string | null
  basePrice: number | null
  urgencySurcharge: number | null
  travelFee: number | null
  bundleDiscount: number | null
  totalQuote: number | null
  depositAmount: number | null
  depositPaid: boolean
  internalNotes: string | null
  status: string
  isRead: boolean
  createdAt: string
  updatedAt: string
  quoteSentAt: string | null
  confirmedAt: string | null
  completedAt: string | null
}

export interface BookingSettings {
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
  updatedAt: string
}

// Generate CUID-like ID
export function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = 'c'
  for (let i = 0; i < 24; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return id
}

// ==========================================
// URGENCY TIERS
// ==========================================
export const urgencyTiers = {
  findMany: (options?: { where?: { isActive?: boolean }; orderBy?: string }): UrgencyTier[] => {
    let sql = 'SELECT * FROM UrgencyTier'
    const params: unknown[] = []

    if (options?.where?.isActive !== undefined) {
      sql += ' WHERE isActive = ?'
      params.push(toInt(options.where.isActive))
    }

    sql += ' ORDER BY "order" ASC'

    const rows = db.prepare(sql).all(...params) as Record<string, unknown>[]
    return rows.map(row => ({
      ...row,
      isActive: toBool(row.isActive as number),
    })) as UrgencyTier[]
  },

  findUnique: (id: string): UrgencyTier | null => {
    const row = db.prepare('SELECT * FROM UrgencyTier WHERE id = ?').get(id) as Record<string, unknown> | undefined
    if (!row) return null
    return { ...row, isActive: toBool(row.isActive as number) } as UrgencyTier
  },

  create: (data: Partial<UrgencyTier>): UrgencyTier => {
    const id = generateId()
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO UrgencyTier (id, name, displayName, description, minLeadDays, maxLeadDays, surchargePercent, isActive, "order", createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.name, data.displayName, data.description || null,
      data.minLeadDays, data.maxLeadDays || null, data.surchargePercent || 0,
      toInt(data.isActive ?? true), data.order || 0, now, now
    )

    return urgencyTiers.findUnique(id)!
  },

  update: (id: string, data: Partial<UrgencyTier>): UrgencyTier => {
    const now = new Date().toISOString()
    const fields: string[] = []
    const values: unknown[] = []

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name) }
    if (data.displayName !== undefined) { fields.push('displayName = ?'); values.push(data.displayName) }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description) }
    if (data.minLeadDays !== undefined) { fields.push('minLeadDays = ?'); values.push(data.minLeadDays) }
    if (data.maxLeadDays !== undefined) { fields.push('maxLeadDays = ?'); values.push(data.maxLeadDays) }
    if (data.surchargePercent !== undefined) { fields.push('surchargePercent = ?'); values.push(data.surchargePercent) }
    if (data.isActive !== undefined) { fields.push('isActive = ?'); values.push(toInt(data.isActive)) }
    if (data.order !== undefined) { fields.push('"order" = ?'); values.push(data.order) }

    fields.push('updatedAt = ?')
    values.push(now)
    values.push(id)

    db.prepare(`UPDATE UrgencyTier SET ${fields.join(', ')} WHERE id = ?`).run(...values)
    return urgencyTiers.findUnique(id)!
  },

  delete: (id: string): void => {
    db.prepare('DELETE FROM UrgencyTier WHERE id = ?').run(id)
  },
}

// ==========================================
// TRAVEL ZONES
// ==========================================
export const travelZones = {
  findMany: (options?: { where?: { isActive?: boolean }; orderBy?: string }): TravelZone[] => {
    let sql = 'SELECT * FROM TravelZone'
    const params: unknown[] = []

    if (options?.where?.isActive !== undefined) {
      sql += ' WHERE isActive = ?'
      params.push(toInt(options.where.isActive))
    }

    sql += ' ORDER BY "order" ASC'

    const rows = db.prepare(sql).all(...params) as Record<string, unknown>[]
    return rows.map(row => ({
      ...row,
      isActive: toBool(row.isActive as number),
      isIncluded: toBool(row.isIncluded as number),
    })) as TravelZone[]
  },

  findUnique: (id: string): TravelZone | null => {
    const row = db.prepare('SELECT * FROM TravelZone WHERE id = ?').get(id) as Record<string, unknown> | undefined
    if (!row) return null
    return {
      ...row,
      isActive: toBool(row.isActive as number),
      isIncluded: toBool(row.isIncluded as number),
    } as TravelZone
  },

  findByDistance: (distanceKm: number): TravelZone | null => {
    const row = db.prepare(`
      SELECT * FROM TravelZone
      WHERE isActive = 1
        AND minDistanceKm <= ?
        AND (maxDistanceKm IS NULL OR maxDistanceKm >= ?)
      ORDER BY minDistanceKm DESC
      LIMIT 1
    `).get(distanceKm, distanceKm) as Record<string, unknown> | undefined

    if (!row) return null
    return {
      ...row,
      isActive: toBool(row.isActive as number),
      isIncluded: toBool(row.isIncluded as number),
    } as TravelZone
  },

  create: (data: Partial<TravelZone>): TravelZone => {
    const id = generateId()
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO TravelZone (id, name, description, minDistanceKm, maxDistanceKm, flatFee, perKmRate, isIncluded, isActive, "order", createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.name, data.description || null, data.minDistanceKm || 0,
      data.maxDistanceKm || null, data.flatFee || null, data.perKmRate || null,
      toInt(data.isIncluded), toInt(data.isActive ?? true), data.order || 0, now, now
    )

    return travelZones.findUnique(id)!
  },

  update: (id: string, data: Partial<TravelZone>): TravelZone => {
    const now = new Date().toISOString()
    const fields: string[] = []
    const values: unknown[] = []

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name) }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description) }
    if (data.minDistanceKm !== undefined) { fields.push('minDistanceKm = ?'); values.push(data.minDistanceKm) }
    if (data.maxDistanceKm !== undefined) { fields.push('maxDistanceKm = ?'); values.push(data.maxDistanceKm) }
    if (data.flatFee !== undefined) { fields.push('flatFee = ?'); values.push(data.flatFee) }
    if (data.perKmRate !== undefined) { fields.push('perKmRate = ?'); values.push(data.perKmRate) }
    if (data.isIncluded !== undefined) { fields.push('isIncluded = ?'); values.push(toInt(data.isIncluded)) }
    if (data.isActive !== undefined) { fields.push('isActive = ?'); values.push(toInt(data.isActive)) }
    if (data.order !== undefined) { fields.push('"order" = ?'); values.push(data.order) }

    fields.push('updatedAt = ?')
    values.push(now)
    values.push(id)

    db.prepare(`UPDATE TravelZone SET ${fields.join(', ')} WHERE id = ?`).run(...values)
    return travelZones.findUnique(id)!
  },

  delete: (id: string): void => {
    db.prepare('DELETE FROM TravelZone WHERE id = ?').run(id)
  },
}

// ==========================================
// TRAVEL BUNDLES
// ==========================================
export const travelBundles = {
  findMany: (options?: { where?: { isActive?: boolean; status?: string } }): TravelBundle[] => {
    let sql = 'SELECT * FROM TravelBundle WHERE 1=1'
    const params: unknown[] = []

    if (options?.where?.isActive !== undefined) {
      sql += ' AND isActive = ?'
      params.push(toInt(options.where.isActive))
    }
    if (options?.where?.status) {
      sql += ' AND status = ?'
      params.push(options.where.status)
    }

    sql += ' ORDER BY scheduledDate ASC'

    const rows = db.prepare(sql).all(...params) as Record<string, unknown>[]
    return rows.map(row => ({
      ...row,
      isActive: toBool(row.isActive as number),
    })) as TravelBundle[]
  },

  findUnique: (id: string): TravelBundle | null => {
    const row = db.prepare('SELECT * FROM TravelBundle WHERE id = ?').get(id) as Record<string, unknown> | undefined
    if (!row) return null
    return { ...row, isActive: toBool(row.isActive as number) } as TravelBundle
  },

  findOpenByCity: (city: string): TravelBundle[] => {
    const rows = db.prepare(`
      SELECT * FROM TravelBundle
      WHERE city = ? AND status = 'open' AND isActive = 1
        AND (registrationDeadline IS NULL OR registrationDeadline > datetime('now'))
      ORDER BY scheduledDate ASC
    `).all(city) as Record<string, unknown>[]

    return rows.map(row => ({
      ...row,
      isActive: toBool(row.isActive as number),
    })) as TravelBundle[]
  },

  create: (data: Partial<TravelBundle>): TravelBundle => {
    const id = generateId()
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO TravelBundle (id, name, city, region, scheduledDate, maxParticipants, currentCount, distanceKm, totalTravelCost, perPersonTravelFee, discountPercent, description, status, isActive, registrationDeadline, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.name, data.city, data.region || null, data.scheduledDate,
      data.maxParticipants || 10, data.currentCount || 0, data.distanceKm || null,
      data.totalTravelCost || null, data.perPersonTravelFee || null,
      data.discountPercent || 0, data.description || null, data.status || 'open',
      toInt(data.isActive ?? true), data.registrationDeadline || null, now, now
    )

    return travelBundles.findUnique(id)!
  },

  update: (id: string, data: Partial<TravelBundle>): TravelBundle => {
    const now = new Date().toISOString()
    const fields: string[] = []
    const values: unknown[] = []

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name) }
    if (data.city !== undefined) { fields.push('city = ?'); values.push(data.city) }
    if (data.region !== undefined) { fields.push('region = ?'); values.push(data.region) }
    if (data.scheduledDate !== undefined) { fields.push('scheduledDate = ?'); values.push(data.scheduledDate) }
    if (data.maxParticipants !== undefined) { fields.push('maxParticipants = ?'); values.push(data.maxParticipants) }
    if (data.currentCount !== undefined) { fields.push('currentCount = ?'); values.push(data.currentCount) }
    if (data.distanceKm !== undefined) { fields.push('distanceKm = ?'); values.push(data.distanceKm) }
    if (data.totalTravelCost !== undefined) { fields.push('totalTravelCost = ?'); values.push(data.totalTravelCost) }
    if (data.perPersonTravelFee !== undefined) { fields.push('perPersonTravelFee = ?'); values.push(data.perPersonTravelFee) }
    if (data.discountPercent !== undefined) { fields.push('discountPercent = ?'); values.push(data.discountPercent) }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description) }
    if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status) }
    if (data.isActive !== undefined) { fields.push('isActive = ?'); values.push(toInt(data.isActive)) }
    if (data.registrationDeadline !== undefined) { fields.push('registrationDeadline = ?'); values.push(data.registrationDeadline) }

    fields.push('updatedAt = ?')
    values.push(now)
    values.push(id)

    db.prepare(`UPDATE TravelBundle SET ${fields.join(', ')} WHERE id = ?`).run(...values)
    return travelBundles.findUnique(id)!
  },

  delete: (id: string): void => {
    db.prepare('DELETE FROM TravelBundle WHERE id = ?').run(id)
  },

  incrementCount: (id: string): void => {
    db.prepare('UPDATE TravelBundle SET currentCount = currentCount + 1, updatedAt = ? WHERE id = ?')
      .run(new Date().toISOString(), id)
  },
}

// ==========================================
// BLOCKED DATES
// ==========================================
export const blockedDates = {
  findMany: (options?: { startDate?: string; endDate?: string }): BlockedDate[] => {
    let sql = 'SELECT * FROM BlockedDate WHERE 1=1'
    const params: unknown[] = []

    if (options?.startDate) {
      sql += ' AND date >= ?'
      params.push(options.startDate)
    }
    if (options?.endDate) {
      sql += ' AND date <= ?'
      params.push(options.endDate)
    }

    sql += ' ORDER BY date ASC'

    const rows = db.prepare(sql).all(...params) as Record<string, unknown>[]
    return rows.map(row => ({
      ...row,
      isAllDay: toBool(row.isAllDay as number),
    })) as BlockedDate[]
  },

  create: (data: Partial<BlockedDate>): BlockedDate => {
    const id = generateId()
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO BlockedDate (id, date, reason, isAllDay, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, data.date, data.reason || null, toInt(data.isAllDay ?? true), now)

    return blockedDates.findUnique(id)!
  },

  findUnique: (id: string): BlockedDate | null => {
    const row = db.prepare('SELECT * FROM BlockedDate WHERE id = ?').get(id) as Record<string, unknown> | undefined
    if (!row) return null
    return { ...row, isAllDay: toBool(row.isAllDay as number) } as BlockedDate
  },

  delete: (id: string): void => {
    db.prepare('DELETE FROM BlockedDate WHERE id = ?').run(id)
  },

  deleteByDate: (date: string): void => {
    db.prepare('DELETE FROM BlockedDate WHERE date = ?').run(date)
  },
}

// ==========================================
// BOOKINGS
// ==========================================
export const bookings = {
  findMany: (options?: { where?: { status?: string; isRead?: boolean }; limit?: number; offset?: number }): Booking[] => {
    let sql = 'SELECT * FROM Booking WHERE 1=1'
    const params: unknown[] = []

    if (options?.where?.status) {
      sql += ' AND status = ?'
      params.push(options.where.status)
    }
    if (options?.where?.isRead !== undefined) {
      sql += ' AND isRead = ?'
      params.push(toInt(options.where.isRead))
    }

    sql += ' ORDER BY createdAt DESC'

    if (options?.limit) {
      sql += ' LIMIT ?'
      params.push(options.limit)
    }
    if (options?.offset) {
      sql += ' OFFSET ?'
      params.push(options.offset)
    }

    const rows = db.prepare(sql).all(...params) as Record<string, unknown>[]
    return rows.map(row => ({
      ...row,
      isFlexible: toBool(row.isFlexible as number),
      depositPaid: toBool(row.depositPaid as number),
      isRead: toBool(row.isRead as number),
    })) as Booking[]
  },

  findUnique: (id: string): Booking | null => {
    const row = db.prepare('SELECT * FROM Booking WHERE id = ?').get(id) as Record<string, unknown> | undefined
    if (!row) return null
    return {
      ...row,
      isFlexible: toBool(row.isFlexible as number),
      depositPaid: toBool(row.depositPaid as number),
      isRead: toBool(row.isRead as number),
    } as Booking
  },

  count: (options?: { where?: { status?: string; isRead?: boolean } }): number => {
    let sql = 'SELECT COUNT(*) as count FROM Booking WHERE 1=1'
    const params: unknown[] = []

    if (options?.where?.status) {
      sql += ' AND status = ?'
      params.push(options.where.status)
    }
    if (options?.where?.isRead !== undefined) {
      sql += ' AND isRead = ?'
      params.push(toInt(options.where.isRead))
    }

    const result = db.prepare(sql).get(...params) as { count: number }
    return result.count
  },

  create: (data: Partial<Booking>): Booking => {
    const id = generateId()
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO Booking (
        id, clientName, clientEmail, clientPhone, companyName,
        propertyAddress, propertyCity, estimatedDistance, serviceType,
        projectDescription, specialRequests, pricingPlanId, urgencyTierId,
        preferredDate, alternateDate, deadlineDate, confirmedDate, isFlexible,
        travelZoneId, travelBundleId, basePrice, urgencySurcharge, travelFee,
        bundleDiscount, totalQuote, depositAmount, depositPaid, internalNotes,
        status, isRead, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.clientName, data.clientEmail, data.clientPhone || null,
      data.companyName || null, data.propertyAddress, data.propertyCity || null,
      data.estimatedDistance || null, data.serviceType || null,
      data.projectDescription || null, data.specialRequests || null,
      data.pricingPlanId || null, data.urgencyTierId || null,
      data.preferredDate || null, data.alternateDate || null,
      data.deadlineDate || null, data.confirmedDate || null,
      toInt(data.isFlexible ?? true), data.travelZoneId || null,
      data.travelBundleId || null, data.basePrice || null,
      data.urgencySurcharge || null, data.travelFee || null,
      data.bundleDiscount || null, data.totalQuote || null,
      data.depositAmount || null, toInt(data.depositPaid),
      data.internalNotes || null, data.status || 'quote_requested',
      toInt(data.isRead), now, now
    )

    return bookings.findUnique(id)!
  },

  update: (id: string, data: Partial<Booking>): Booking => {
    const now = new Date().toISOString()
    const fields: string[] = []
    const values: unknown[] = []

    // Add all possible fields
    const stringFields = ['clientName', 'clientEmail', 'clientPhone', 'companyName', 'propertyAddress', 'propertyCity', 'serviceType', 'projectDescription', 'specialRequests', 'pricingPlanId', 'urgencyTierId', 'preferredDate', 'alternateDate', 'deadlineDate', 'confirmedDate', 'travelZoneId', 'travelBundleId', 'internalNotes', 'status', 'quoteSentAt', 'confirmedAt', 'completedAt']
    const numberFields = ['estimatedDistance', 'basePrice', 'urgencySurcharge', 'travelFee', 'bundleDiscount', 'totalQuote', 'depositAmount']
    const boolFields = ['isFlexible', 'depositPaid', 'isRead']

    for (const field of stringFields) {
      if ((data as Record<string, unknown>)[field] !== undefined) {
        fields.push(`${field} = ?`)
        values.push((data as Record<string, unknown>)[field])
      }
    }

    for (const field of numberFields) {
      if ((data as Record<string, unknown>)[field] !== undefined) {
        fields.push(`${field} = ?`)
        values.push((data as Record<string, unknown>)[field])
      }
    }

    for (const field of boolFields) {
      if ((data as Record<string, unknown>)[field] !== undefined) {
        fields.push(`${field} = ?`)
        values.push(toInt((data as Record<string, unknown>)[field] as boolean))
      }
    }

    fields.push('updatedAt = ?')
    values.push(now)
    values.push(id)

    db.prepare(`UPDATE Booking SET ${fields.join(', ')} WHERE id = ?`).run(...values)
    return bookings.findUnique(id)!
  },

  delete: (id: string): void => {
    db.prepare('DELETE FROM Booking WHERE id = ?').run(id)
  },
}

// ==========================================
// BOOKING SETTINGS (Singleton)
// ==========================================
export const bookingSettings = {
  get: (): BookingSettings | null => {
    const row = db.prepare('SELECT * FROM BookingSettings WHERE id = ?').get('default') as Record<string, unknown> | undefined
    if (!row) return null
    return {
      ...row,
      includeReturnTrip: toBool(row.includeReturnTrip as number),
      workOnWeekends: toBool(row.workOnWeekends as number),
      workOnSunday: toBool(row.workOnSunday as number),
      requireDeposit: toBool(row.requireDeposit as number),
    } as BookingSettings
  },

  update: (data: Partial<BookingSettings>): BookingSettings => {
    const now = new Date().toISOString()
    const fields: string[] = []
    const values: unknown[] = []

    if (data.defaultMinLeadDays !== undefined) { fields.push('defaultMinLeadDays = ?'); values.push(data.defaultMinLeadDays) }
    if (data.maxAdvanceBookingDays !== undefined) { fields.push('maxAdvanceBookingDays = ?'); values.push(data.maxAdvanceBookingDays) }
    if (data.businessAddress !== undefined) { fields.push('businessAddress = ?'); values.push(data.businessAddress) }
    if (data.businessCity !== undefined) { fields.push('businessCity = ?'); values.push(data.businessCity) }
    if (data.businessLatitude !== undefined) { fields.push('businessLatitude = ?'); values.push(data.businessLatitude) }
    if (data.businessLongitude !== undefined) { fields.push('businessLongitude = ?'); values.push(data.businessLongitude) }
    if (data.includeReturnTrip !== undefined) { fields.push('includeReturnTrip = ?'); values.push(toInt(data.includeReturnTrip)) }
    if (data.freeDistanceKm !== undefined) { fields.push('freeDistanceKm = ?'); values.push(data.freeDistanceKm) }
    if (data.workOnWeekends !== undefined) { fields.push('workOnWeekends = ?'); values.push(toInt(data.workOnWeekends)) }
    if (data.workOnSunday !== undefined) { fields.push('workOnSunday = ?'); values.push(toInt(data.workOnSunday)) }
    if (data.quoteValidDays !== undefined) { fields.push('quoteValidDays = ?'); values.push(data.quoteValidDays) }
    if (data.requireDeposit !== undefined) { fields.push('requireDeposit = ?'); values.push(toInt(data.requireDeposit)) }
    if (data.depositPercent !== undefined) { fields.push('depositPercent = ?'); values.push(data.depositPercent) }
    if (data.minBundleParticipants !== undefined) { fields.push('minBundleParticipants = ?'); values.push(data.minBundleParticipants) }
    if (data.bundleDiscountPercent !== undefined) { fields.push('bundleDiscountPercent = ?'); values.push(data.bundleDiscountPercent) }

    fields.push('updatedAt = ?')
    values.push(now)

    db.prepare(`UPDATE BookingSettings SET ${fields.join(', ')} WHERE id = 'default'`).run(...values)
    return bookingSettings.get()!
  },

  upsert: (data: Partial<BookingSettings>): BookingSettings => {
    const existing = bookingSettings.get()
    if (existing) {
      return bookingSettings.update(data)
    }

    // Create default settings
    const now = new Date().toISOString()
    db.prepare(`
      INSERT INTO BookingSettings (id, defaultMinLeadDays, maxAdvanceBookingDays, businessCity, includeReturnTrip, freeDistanceKm, workOnWeekends, workOnSunday, quoteValidDays, requireDeposit, depositPercent, minBundleParticipants, bundleDiscountPercent, updatedAt)
      VALUES ('default', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.defaultMinLeadDays || 3,
      data.maxAdvanceBookingDays || 90,
      data.businessCity || 'Skopje',
      toInt(data.includeReturnTrip ?? true),
      data.freeDistanceKm || 15,
      toInt(data.workOnWeekends),
      toInt(data.workOnSunday),
      data.quoteValidDays || 14,
      toInt(data.requireDeposit ?? true),
      data.depositPercent || 30,
      data.minBundleParticipants || 3,
      data.bundleDiscountPercent || 10,
      now
    )

    return bookingSettings.get()!
  },
}

// ==========================================
// QUOTE CALCULATOR
// ==========================================
export interface QuoteCalculation {
  basePrice: number
  urgencyTierName: string
  urgencySurchargePercent: number
  urgencySurchargeAmount: number
  travelZoneName: string | null
  travelFee: number
  bundleName: string | null
  bundleDiscount: number
  subtotal: number
  total: number
  depositAmount: number | null
  depositPercent: number | null
}

export function calculateQuote(params: {
  pricingPlanPrice: number
  urgencyTierId?: string | null
  distanceKm?: number | null
  bundleId?: string | null
}): QuoteCalculation {
  const settings = bookingSettings.get()

  // Get urgency tier
  let urgencyTier: UrgencyTier | null = null
  if (params.urgencyTierId) {
    urgencyTier = urgencyTiers.findUnique(params.urgencyTierId)
  }

  // Calculate urgency surcharge
  const urgencySurchargePercent = urgencyTier?.surchargePercent || 0
  const urgencySurchargeAmount = params.pricingPlanPrice * (urgencySurchargePercent / 100)

  // Calculate travel fee
  let travelFee = 0
  let travelZoneName: string | null = null
  let bundleDiscount = 0
  let bundleName: string | null = null

  if (params.bundleId) {
    // If joining a bundle, use bundle pricing - significantly lower travel costs
    const bundle = travelBundles.findUnique(params.bundleId)
    if (bundle) {
      bundleName = bundle.name
      // Calculate per-person travel fee based on total cost split among participants
      if (bundle.perPersonTravelFee) {
        travelFee = bundle.perPersonTravelFee
      } else if (bundle.totalTravelCost && bundle.maxParticipants > 0) {
        // Split total travel cost among expected participants (use max for lower estimate)
        travelFee = bundle.totalTravelCost / bundle.maxParticipants
      } else if (bundle.distanceKm) {
        // Fallback: Calculate minimal travel fee for bundles (much lower than individual)
        // Bundle rate: 0.15€/km (vs individual 0.50€/km) - shared cost benefit
        const bundleKmRate = 0.15
        travelFee = bundle.distanceKm * bundleKmRate
      }
      // Apply bundle discount on service price
      bundleDiscount = params.pricingPlanPrice * (bundle.discountPercent / 100)
    }
  } else if (params.distanceKm !== null && params.distanceKm !== undefined) {
    // Calculate based on travel zone for individual bookings
    const zone = travelZones.findByDistance(params.distanceKm)
    if (zone) {
      travelZoneName = zone.name
      if (!zone.isIncluded) {
        travelFee = zone.flatFee || 0
        if (zone.perKmRate) {
          // Apply free distance from settings
          const freeKm = settings?.freeDistanceKm || 15
          const chargeableKm = Math.max(0, params.distanceKm - freeKm)
          travelFee += chargeableKm * zone.perKmRate
        }
        // Double for return trip if configured
        if (settings?.includeReturnTrip) {
          travelFee *= 2
        }
      }
    } else {
      // Fallback calculation if no zone matches
      const freeKm = settings?.freeDistanceKm || 15
      if (params.distanceKm > freeKm) {
        const chargeableKm = params.distanceKm - freeKm
        const defaultKmRate = 0.40 // Reduced default rate
        travelFee = chargeableKm * defaultKmRate
        if (settings?.includeReturnTrip) {
          travelFee *= 2
        }
      }
    }
  }

  // Round travel fee to 2 decimal places
  travelFee = Math.round(travelFee * 100) / 100

  // Calculate totals
  const subtotal = params.pricingPlanPrice + urgencySurchargeAmount - bundleDiscount
  const total = subtotal + travelFee

  // Calculate deposit
  let depositAmount: number | null = null
  let depositPercent: number | null = null
  if (settings?.requireDeposit) {
    depositPercent = settings.depositPercent
    depositAmount = Math.round(total * (settings.depositPercent / 100) * 100) / 100
  }

  return {
    basePrice: params.pricingPlanPrice,
    urgencyTierName: urgencyTier?.displayName || 'Standard',
    urgencySurchargePercent,
    urgencySurchargeAmount,
    travelZoneName,
    travelFee,
    bundleName,
    bundleDiscount,
    subtotal,
    total,
    depositAmount,
    depositPercent,
  }
}

// City distance lookup (approximate from Skopje)
export const cityDistances: Record<string, number> = {
  'Skopje': 0,
  'Tetovo': 45,
  'Gostivar': 70,
  'Kumanovo': 40,
  'Veles': 55,
  'Shtip': 90,
  'Strumica': 150,
  'Prilep': 130,
  'Bitola': 170,
  'Ohrid': 175,
  'Struga': 180,
  'Kochani': 120,
  'Kavadarci': 100,
  'Gevgelija': 175,
  'Debar': 130,
  'Kicevo': 110,
  'Kratovo': 100,
  'Resen': 160,
}

export function getDistanceByCity(city: string): number | null {
  const normalizedCity = city.trim().toLowerCase()
  for (const [key, distance] of Object.entries(cityDistances)) {
    if (key.toLowerCase() === normalizedCity) {
      return distance
    }
  }
  return null
}
