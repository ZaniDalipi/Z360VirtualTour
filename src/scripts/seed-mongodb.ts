import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/z360tours'

// Define schemas inline for the seed script
const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'admin' },
  lastLoginAt: Date,
}, { timestamps: true })

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  icon: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

const PricingPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  price: { type: Number, required: true },
  features: [String],
  isPopular: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true })

const UrgencyTierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  displayName: { type: String, required: true },
  description: String,
  minLeadDays: { type: Number, required: true },
  maxLeadDays: Number,
  surchargePercent: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true })

const TravelZoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  minDistanceKm: { type: Number, default: 0 },
  maxDistanceKm: Number,
  flatFee: Number,
  perKmRate: Number,
  isIncluded: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true })

const BookingSettingsSchema = new mongoose.Schema({
  defaultMinLeadDays: { type: Number, default: 3 },
  maxAdvanceBookingDays: { type: Number, default: 90 },
  businessAddress: String,
  businessCity: { type: String, default: 'Skopje' },
  businessLatitude: Number,
  businessLongitude: Number,
  includeReturnTrip: { type: Boolean, default: true },
  freeDistanceKm: { type: Number, default: 15 },
  workOnWeekends: { type: Boolean, default: false },
  workOnSunday: { type: Boolean, default: false },
  quoteValidDays: { type: Number, default: 14 },
  requireDeposit: { type: Boolean, default: true },
  depositPercent: { type: Number, default: 30 },
  minBundleParticipants: { type: Number, default: 3 },
  bundleDiscountPercent: { type: Number, default: 10 },
}, { timestamps: true })

async function seed() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Get or create models
    const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema)
    const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema)
    const PricingPlan = mongoose.models.PricingPlan || mongoose.model('PricingPlan', PricingPlanSchema)
    const UrgencyTier = mongoose.models.UrgencyTier || mongoose.model('UrgencyTier', UrgencyTierSchema)
    const TravelZone = mongoose.models.TravelZone || mongoose.model('TravelZone', TravelZoneSchema)
    const BookingSettings = mongoose.models.BookingSettings || mongoose.model('BookingSettings', BookingSettingsSchema)

    // Create admin user
    console.log('Creating admin user...')
    const existingAdmin = await Admin.findOne({ email: 'admin@z360.com' })
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12)
      await Admin.create({
        email: 'admin@z360.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'admin',
      })
      console.log('Admin user created: admin@z360.com / admin123')
    } else {
      console.log('Admin user already exists')
    }

    // Create default categories (empty, for structure)
    console.log('Creating default categories...')
    const categories = [
      { name: 'Real Estate', slug: 'real-estate', description: 'Virtual tours for properties', icon: 'Home', order: 1 },
      { name: 'Hotels', slug: 'hotels', description: 'Virtual tours for hotels', icon: 'Building', order: 2 },
      { name: 'Restaurants', slug: 'restaurants', description: 'Virtual tours for restaurants', icon: 'Utensils', order: 3 },
    ]

    for (const cat of categories) {
      const existing = await Category.findOne({ slug: cat.slug })
      if (!existing) {
        await Category.create(cat)
      }
    }
    console.log('Categories created')

    // Create pricing plans
    console.log('Creating pricing plans...')
    const pricingPlans = [
      {
        name: 'Basic',
        slug: 'basic',
        description: 'For small spaces',
        price: 150,
        features: ['Up to 5 panoramas', 'Basic editing', '1 year hosting'],
        isPopular: false,
        order: 1,
      },
      {
        name: 'Professional',
        slug: 'professional',
        description: 'For apartments and businesses',
        price: 300,
        features: ['Up to 15 panoramas', 'Professional editing', '2 years hosting', 'Custom branding'],
        isPopular: true,
        order: 2,
      },
      {
        name: 'Premium',
        slug: 'premium',
        description: 'For large properties',
        price: 500,
        features: ['Unlimited panoramas', 'Premium editing', 'Lifetime hosting', 'Full branding', 'Priority support'],
        isPopular: false,
        order: 3,
      },
    ]

    for (const plan of pricingPlans) {
      const existing = await PricingPlan.findOne({ slug: plan.slug })
      if (!existing) {
        await PricingPlan.create(plan)
      }
    }
    console.log('Pricing plans created')

    // Create urgency tiers
    console.log('Creating urgency tiers...')
    const urgencyTiers = [
      { name: 'standard', displayName: 'Standard', description: 'Regular turnaround', minLeadDays: 7, surchargePercent: 0, order: 1 },
      { name: 'priority', displayName: 'Priority', description: '3-7 days', minLeadDays: 3, maxLeadDays: 6, surchargePercent: 25, order: 2 },
      { name: 'rush', displayName: 'Rush', description: '1-2 days', minLeadDays: 1, maxLeadDays: 2, surchargePercent: 50, order: 3 },
    ]

    for (const tier of urgencyTiers) {
      const existing = await UrgencyTier.findOne({ name: tier.name })
      if (!existing) {
        await UrgencyTier.create(tier)
      }
    }
    console.log('Urgency tiers created')

    // Create travel zones
    console.log('Creating travel zones...')
    const travelZones = [
      { name: 'Local', description: 'Within city', minDistanceKm: 0, maxDistanceKm: 15, isIncluded: true, order: 1 },
      { name: 'Nearby', description: '15-50km', minDistanceKm: 15, maxDistanceKm: 50, flatFee: 20, perKmRate: 0.5, order: 2 },
      { name: 'Regional', description: '50-100km', minDistanceKm: 50, maxDistanceKm: 100, flatFee: 40, perKmRate: 0.4, order: 3 },
      { name: 'Distant', description: 'Over 100km', minDistanceKm: 100, flatFee: 60, perKmRate: 0.3, order: 4 },
    ]

    for (const zone of travelZones) {
      const existing = await TravelZone.findOne({ name: zone.name })
      if (!existing) {
        await TravelZone.create(zone)
      }
    }
    console.log('Travel zones created')

    // Create booking settings
    console.log('Creating booking settings...')
    const existingSettings = await BookingSettings.findOne()
    if (!existingSettings) {
      await BookingSettings.create({
        defaultMinLeadDays: 3,
        maxAdvanceBookingDays: 90,
        businessCity: 'Skopje',
        includeReturnTrip: true,
        freeDistanceKm: 15,
        quoteValidDays: 14,
        requireDeposit: true,
        depositPercent: 30,
      })
    }
    console.log('Booking settings created')

    console.log('\n✅ Database seeded successfully!')
    console.log('\nAdmin credentials:')
    console.log('  Email: admin@z360.com')
    console.log('  Password: admin123')

  } catch (error) {
    console.error('Seed error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

seed()
