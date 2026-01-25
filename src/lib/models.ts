import mongoose, { Schema, Model, Document } from 'mongoose'

// ============================================
// ADMIN MODEL
// ============================================
export interface IAdmin extends Document {
  email: string
  password: string
  name: string
  phone?: string
  isEmailVerified: boolean
  emailVerifyToken?: string
  emailVerifyExpires?: Date
  passwordResetToken?: string
  passwordResetExpires?: Date
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String },
    emailVerifyExpires: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
)

// ============================================
// CLIENT MODEL
// ============================================
export interface IClient extends Document {
  email: string
  password?: string
  name: string
  phone?: string
  company?: string
  isEmailVerified: boolean
  emailVerifyToken?: string
  emailVerifyExpires?: Date
  passwordResetToken?: string
  passwordResetExpires?: Date
  lastLoginAt?: Date
  notificationPrefs?: string
  createdAt: Date
  updatedAt: Date
}

const ClientSchema = new Schema<IClient>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    name: { type: String, required: true },
    phone: { type: String },
    company: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String },
    emailVerifyExpires: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    lastLoginAt: { type: Date },
    notificationPrefs: { type: String },
  },
  { timestamps: true }
)

// ============================================
// CATEGORY MODEL
// ============================================
export interface ICategory extends Document {
  name: string
  slug: string
  description?: string
  icon?: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    icon: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

// ============================================
// TOUR MODEL
// ============================================
export interface ITour extends Document {
  title: string
  slug: string
  description: string
  shortDesc?: string
  clientName?: string
  location?: string
  coverImage: string
  images?: string[]
  tourUrl?: string
  tourEmbed?: string
  categoryId: mongoose.Types.ObjectId
  featured: boolean
  isActive: boolean
  views: number
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const TourSchema = new Schema<ITour>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDesc: { type: String },
    clientName: { type: String },
    location: { type: String },
    coverImage: { type: String, required: true },
    images: [{ type: String }],
    tourUrl: { type: String },
    tourEmbed: { type: String },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    completedAt: { type: Date },
  },
  { timestamps: true }
)

// ============================================
// TESTIMONIAL MODEL
// ============================================
export interface ITestimonial extends Document {
  clientName: string
  clientTitle?: string
  clientImage?: string
  content: string
  rating: number
  tourId?: mongoose.Types.ObjectId
  featured: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    clientName: { type: String, required: true },
    clientTitle: { type: String },
    clientImage: { type: String },
    content: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    tourId: { type: Schema.Types.ObjectId, ref: 'Tour' },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

// ============================================
// PRICING PLAN MODEL
// ============================================
export interface IPricingPlan extends Document {
  name: string
  description: string
  price: number
  priceLabel?: string
  features: string[]
  isPopular: boolean
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

const PricingPlanSchema = new Schema<IPricingPlan>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    priceLabel: { type: String },
    features: [{ type: String }],
    isPopular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// ============================================
// CONTACT SUBMISSION MODEL
// ============================================
export interface IContactSubmission extends Document {
  name: string
  email: string
  phone?: string
  company?: string
  service?: string
  message: string
  isRead: boolean
  createdAt: Date
}

const ContactSubmissionSchema = new Schema<IContactSubmission>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    company: { type: String },
    service: { type: String },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// ============================================
// SITE SETTING MODEL
// ============================================
export interface ISiteSetting extends Document {
  key: string
  value: string
  updatedAt: Date
}

const SiteSettingSchema = new Schema<ISiteSetting>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
  },
  { timestamps: true }
)

// ============================================
// URGENCY TIER MODEL
// ============================================
export interface IUrgencyTier extends Document {
  name: string
  displayName: string
  description?: string
  minLeadDays: number
  maxLeadDays?: number
  surchargePercent: number
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

const UrgencyTierSchema = new Schema<IUrgencyTier>(
  {
    name: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    description: { type: String },
    minLeadDays: { type: Number, required: true },
    maxLeadDays: { type: Number },
    surchargePercent: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// ============================================
// TRAVEL ZONE MODEL
// ============================================
export interface ITravelZone extends Document {
  name: string
  description?: string
  minDistanceKm: number
  maxDistanceKm?: number
  flatFee?: number
  perKmRate?: number
  isIncluded: boolean
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

const TravelZoneSchema = new Schema<ITravelZone>(
  {
    name: { type: String, required: true },
    description: { type: String },
    minDistanceKm: { type: Number, default: 0 },
    maxDistanceKm: { type: Number },
    flatFee: { type: Number },
    perKmRate: { type: Number },
    isIncluded: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// ============================================
// TRAVEL BUNDLE MODEL
// ============================================
export interface ITravelBundle extends Document {
  name: string
  city: string
  region?: string
  scheduledDate: Date
  maxParticipants: number
  currentCount: number
  distanceKm?: number
  totalTravelCost?: number
  perPersonTravelFee?: number
  discountPercent: number
  description?: string
  status: string
  isActive: boolean
  registrationDeadline?: Date
  createdAt: Date
  updatedAt: Date
}

const TravelBundleSchema = new Schema<ITravelBundle>(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    region: { type: String },
    scheduledDate: { type: Date, required: true },
    maxParticipants: { type: Number, default: 10 },
    currentCount: { type: Number, default: 0 },
    distanceKm: { type: Number },
    totalTravelCost: { type: Number },
    perPersonTravelFee: { type: Number },
    discountPercent: { type: Number, default: 0 },
    description: { type: String },
    status: { type: String, default: 'open' },
    isActive: { type: Boolean, default: true },
    registrationDeadline: { type: Date },
  },
  { timestamps: true }
)

// ============================================
// BLOCKED DATE MODEL
// ============================================
export interface IBlockedDate extends Document {
  date: Date
  reason?: string
  isAllDay: boolean
  createdAt: Date
}

const BlockedDateSchema = new Schema<IBlockedDate>(
  {
    date: { type: Date, required: true, unique: true },
    reason: { type: String },
    isAllDay: { type: Boolean, default: true },
  },
  { timestamps: true }
)

// ============================================
// BOOKING MODEL
// ============================================
export interface IBooking extends Document {
  clientName: string
  clientEmail: string
  clientPhone?: string
  companyName?: string
  propertyAddress: string
  propertyCity?: string
  estimatedDistance?: number
  serviceType?: string
  projectDescription?: string
  specialRequests?: string
  pricingPlanId?: mongoose.Types.ObjectId
  urgencyTierId?: mongoose.Types.ObjectId
  preferredDate?: Date
  preferredTime?: string
  alternateDate?: Date
  alternateTime?: string
  deadlineDate?: Date
  confirmedDate?: Date
  confirmedTime?: string
  isFlexible: boolean
  travelZoneId?: mongoose.Types.ObjectId
  travelBundleId?: mongoose.Types.ObjectId
  basePrice?: number
  urgencySurcharge?: number
  travelFee?: number
  bundleDiscount?: number
  totalQuote?: number
  depositAmount?: number
  depositPaid: boolean
  internalNotes?: string
  workNotes?: string
  status: string
  isRead: boolean
  quoteSentAt?: Date
  confirmedAt?: Date
  completedAt?: Date
  workStartedAt?: Date
  workEndedAt?: Date
  workDurationMinutes?: number
  createdAt: Date
  updatedAt: Date
}

const BookingSchema = new Schema<IBooking>(
  {
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    clientPhone: { type: String },
    companyName: { type: String },
    propertyAddress: { type: String, required: true },
    propertyCity: { type: String },
    estimatedDistance: { type: Number },
    serviceType: { type: String },
    projectDescription: { type: String },
    specialRequests: { type: String },
    pricingPlanId: { type: Schema.Types.ObjectId, ref: 'PricingPlan' },
    urgencyTierId: { type: Schema.Types.ObjectId, ref: 'UrgencyTier' },
    preferredDate: { type: Date },
    preferredTime: { type: String },
    alternateDate: { type: Date },
    alternateTime: { type: String },
    deadlineDate: { type: Date },
    confirmedDate: { type: Date },
    confirmedTime: { type: String },
    isFlexible: { type: Boolean, default: true },
    travelZoneId: { type: Schema.Types.ObjectId, ref: 'TravelZone' },
    travelBundleId: { type: Schema.Types.ObjectId, ref: 'TravelBundle' },
    basePrice: { type: Number },
    urgencySurcharge: { type: Number },
    travelFee: { type: Number },
    bundleDiscount: { type: Number },
    totalQuote: { type: Number },
    depositAmount: { type: Number },
    depositPaid: { type: Boolean, default: false },
    internalNotes: { type: String },
    workNotes: { type: String },
    status: { type: String, default: 'quote_requested' },
    isRead: { type: Boolean, default: false },
    quoteSentAt: { type: Date },
    confirmedAt: { type: Date },
    completedAt: { type: Date },
    workStartedAt: { type: Date },
    workEndedAt: { type: Date },
    workDurationMinutes: { type: Number },
  },
  { timestamps: true }
)

// ============================================
// BOOKING SETTINGS MODEL (Singleton)
// ============================================
export interface IBookingSettings extends Document {
  defaultMinLeadDays: number
  maxAdvanceBookingDays: number
  businessAddress?: string
  businessCity: string
  businessLatitude?: number
  businessLongitude?: number
  includeReturnTrip: boolean
  freeDistanceKm: number
  workOnWeekends: boolean
  workOnSunday: boolean
  quoteValidDays: number
  requireDeposit: boolean
  depositPercent: number
  minBundleParticipants: number
  bundleDiscountPercent: number
  updatedAt: Date
}

const BookingSettingsSchema = new Schema<IBookingSettings>(
  {
    defaultMinLeadDays: { type: Number, default: 3 },
    maxAdvanceBookingDays: { type: Number, default: 90 },
    businessAddress: { type: String },
    businessCity: { type: String, default: 'Skopje' },
    businessLatitude: { type: Number },
    businessLongitude: { type: Number },
    includeReturnTrip: { type: Boolean, default: true },
    freeDistanceKm: { type: Number, default: 15 },
    workOnWeekends: { type: Boolean, default: false },
    workOnSunday: { type: Boolean, default: false },
    quoteValidDays: { type: Number, default: 14 },
    requireDeposit: { type: Boolean, default: true },
    depositPercent: { type: Number, default: 30 },
    minBundleParticipants: { type: Number, default: 3 },
    bundleDiscountPercent: { type: Number, default: 10 },
  },
  { timestamps: true }
)

// ============================================
// QUOTE MODEL
// ============================================
export interface IQuote extends Document {
  quoteNumber: string
  clientId?: mongoose.Types.ObjectId
  guestName?: string
  guestEmail?: string
  guestPhone: string
  guestCompany?: string
  propertyAddress: string
  propertyCity?: string
  propertyType?: string
  propertySize?: string
  projectDescription?: string
  specialRequests?: string
  pricingPlanId?: mongoose.Types.ObjectId
  estimatedPrice?: number
  finalPrice?: number
  preferredCallTime?: string
  preferredCallDate?: Date
  callbackScheduled?: Date
  callbackCompleted?: Date
  callNotes?: string
  status: string
  quotedAt?: Date
  quoteValidUntil?: Date
  quoteDocument?: string
  assignedTo?: string
  internalNotes?: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

const QuoteSchema = new Schema<IQuote>(
  {
    quoteNumber: { type: String, required: true, unique: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
    guestName: { type: String },
    guestEmail: { type: String },
    guestPhone: { type: String, required: true },
    guestCompany: { type: String },
    propertyAddress: { type: String, required: true },
    propertyCity: { type: String },
    propertyType: { type: String },
    propertySize: { type: String },
    projectDescription: { type: String },
    specialRequests: { type: String },
    pricingPlanId: { type: Schema.Types.ObjectId, ref: 'PricingPlan' },
    estimatedPrice: { type: Number },
    finalPrice: { type: Number },
    preferredCallTime: { type: String },
    preferredCallDate: { type: Date },
    callbackScheduled: { type: Date },
    callbackCompleted: { type: Date },
    callNotes: { type: String },
    status: { type: String, default: 'pending' },
    quotedAt: { type: Date },
    quoteValidUntil: { type: Date },
    quoteDocument: { type: String },
    assignedTo: { type: String },
    internalNotes: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// ============================================
// QUOTE STATUS HISTORY MODEL
// ============================================
export interface IQuoteStatusHistory extends Document {
  quoteId: mongoose.Types.ObjectId
  status: string
  note?: string
  changedBy?: string
  createdAt: Date
}

const QuoteStatusHistorySchema = new Schema<IQuoteStatusHistory>(
  {
    quoteId: { type: Schema.Types.ObjectId, ref: 'Quote', required: true },
    status: { type: String, required: true },
    note: { type: String },
    changedBy: { type: String },
  },
  { timestamps: true }
)

// ============================================
// CLIENT NOTIFICATION MODEL
// ============================================
export interface IClientNotification extends Document {
  clientId?: mongoose.Types.ObjectId
  email: string
  type: string
  subject: string
  message: string
  isRead: boolean
  sentAt: Date
  readAt?: Date
}

const ClientNotificationSchema = new Schema<IClientNotification>({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  email: { type: String, required: true },
  type: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  sentAt: { type: Date, default: Date.now },
  readAt: { type: Date },
})

// ============================================
// EXPORT MODELS
// ============================================

// Helper function to get or create model
function getModel<T>(name: string, schema: Schema): Model<T> {
  return mongoose.models[name] || mongoose.model<T>(name, schema)
}

export const Admin = getModel<IAdmin>('Admin', AdminSchema)
export const Client = getModel<IClient>('Client', ClientSchema)
export const Category = getModel<ICategory>('Category', CategorySchema)
export const Tour = getModel<ITour>('Tour', TourSchema)
export const Testimonial = getModel<ITestimonial>('Testimonial', TestimonialSchema)
export const PricingPlan = getModel<IPricingPlan>('PricingPlan', PricingPlanSchema)
export const ContactSubmission = getModel<IContactSubmission>('ContactSubmission', ContactSubmissionSchema)
export const SiteSetting = getModel<ISiteSetting>('SiteSetting', SiteSettingSchema)
export const UrgencyTier = getModel<IUrgencyTier>('UrgencyTier', UrgencyTierSchema)
export const TravelZone = getModel<ITravelZone>('TravelZone', TravelZoneSchema)
export const TravelBundle = getModel<ITravelBundle>('TravelBundle', TravelBundleSchema)
export const BlockedDate = getModel<IBlockedDate>('BlockedDate', BlockedDateSchema)
export const Booking = getModel<IBooking>('Booking', BookingSchema)
export const BookingSettings = getModel<IBookingSettings>('BookingSettings', BookingSettingsSchema)
export const Quote = getModel<IQuote>('Quote', QuoteSchema)
export const QuoteStatusHistory = getModel<IQuoteStatusHistory>('QuoteStatusHistory', QuoteStatusHistorySchema)
export const ClientNotification = getModel<IClientNotification>('ClientNotification', ClientNotificationSchema)
