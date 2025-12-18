import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '..', 'prisma', 'dev.db');

const db = new Database(dbPath);

const migrations = `
-- Urgency Tiers
CREATE TABLE IF NOT EXISTS UrgencyTier (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  displayName TEXT NOT NULL,
  description TEXT,
  minLeadDays INTEGER NOT NULL,
  maxLeadDays INTEGER,
  surchargePercent REAL DEFAULT 0,
  isActive INTEGER DEFAULT 1,
  "order" INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- Travel Zones
CREATE TABLE IF NOT EXISTS TravelZone (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  minDistanceKm REAL DEFAULT 0,
  maxDistanceKm REAL,
  flatFee REAL,
  perKmRate REAL,
  isIncluded INTEGER DEFAULT 0,
  isActive INTEGER DEFAULT 1,
  "order" INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- Travel Bundles
CREATE TABLE IF NOT EXISTS TravelBundle (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT,
  scheduledDate TEXT NOT NULL,
  maxParticipants INTEGER DEFAULT 10,
  currentCount INTEGER DEFAULT 0,
  distanceKm REAL,
  totalTravelCost REAL,
  perPersonTravelFee REAL,
  discountPercent REAL DEFAULT 0,
  description TEXT,
  status TEXT DEFAULT 'open',
  isActive INTEGER DEFAULT 1,
  registrationDeadline TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- Blocked Dates
CREATE TABLE IF NOT EXISTS BlockedDate (
  id TEXT PRIMARY KEY,
  date TEXT UNIQUE NOT NULL,
  reason TEXT,
  isAllDay INTEGER DEFAULT 1,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- Bookings
CREATE TABLE IF NOT EXISTS Booking (
  id TEXT PRIMARY KEY,
  clientName TEXT NOT NULL,
  clientEmail TEXT NOT NULL,
  clientPhone TEXT,
  companyName TEXT,
  propertyAddress TEXT NOT NULL,
  propertyCity TEXT,
  estimatedDistance REAL,
  serviceType TEXT,
  projectDescription TEXT,
  specialRequests TEXT,
  pricingPlanId TEXT REFERENCES PricingPlan(id),
  urgencyTierId TEXT REFERENCES UrgencyTier(id),
  preferredDate TEXT,
  alternateDate TEXT,
  deadlineDate TEXT,
  confirmedDate TEXT,
  isFlexible INTEGER DEFAULT 1,
  travelZoneId TEXT REFERENCES TravelZone(id),
  travelBundleId TEXT REFERENCES TravelBundle(id),
  basePrice REAL,
  urgencySurcharge REAL,
  travelFee REAL,
  bundleDiscount REAL,
  totalQuote REAL,
  depositAmount REAL,
  depositPaid INTEGER DEFAULT 0,
  internalNotes TEXT,
  status TEXT DEFAULT 'quote_requested',
  isRead INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  quoteSentAt TEXT,
  confirmedAt TEXT,
  completedAt TEXT
);

-- Booking Settings
CREATE TABLE IF NOT EXISTS BookingSettings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  defaultMinLeadDays INTEGER DEFAULT 3,
  maxAdvanceBookingDays INTEGER DEFAULT 90,
  businessAddress TEXT,
  businessCity TEXT DEFAULT 'Skopje',
  businessLatitude REAL,
  businessLongitude REAL,
  includeReturnTrip INTEGER DEFAULT 1,
  freeDistanceKm REAL DEFAULT 15,
  workOnWeekends INTEGER DEFAULT 0,
  workOnSunday INTEGER DEFAULT 0,
  quoteValidDays INTEGER DEFAULT 14,
  requireDeposit INTEGER DEFAULT 1,
  depositPercent REAL DEFAULT 30,
  minBundleParticipants INTEGER DEFAULT 3,
  bundleDiscountPercent REAL DEFAULT 10,
  updatedAt TEXT DEFAULT (datetime('now'))
);
`;

// Execute migrations
try {
  db.exec(migrations);
  console.log('✅ Booking tables created successfully!');

  // Show tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  console.log('\n📋 Current tables:');
  tables.forEach(t => console.log(`  - ${t.name}`));
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  db.close();
}
