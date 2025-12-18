import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomBytes } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '..', 'prisma', 'dev.db');

const db = new Database(dbPath);

// Generate CUID-like IDs
function generateId() {
  return 'c' + randomBytes(12).toString('hex').slice(0, 24);
}

const now = new Date().toISOString();

// Default Urgency Tiers
const urgencyTiers = [
  {
    id: generateId(),
    name: 'standard',
    displayName: 'Standard',
    description: '7-14 business days turnaround - perfect for planned projects',
    minLeadDays: 7,
    maxLeadDays: null,
    surchargePercent: 0,
    isActive: 1,
    order: 0,
  },
  {
    id: generateId(),
    name: 'express',
    displayName: 'Express',
    description: '3-5 business days turnaround - faster delivery',
    minLeadDays: 3,
    maxLeadDays: 6,
    surchargePercent: 25,
    isActive: 1,
    order: 1,
  },
  {
    id: generateId(),
    name: 'rush',
    displayName: 'Rush / Urgent',
    description: '1-2 business days - subject to availability',
    minLeadDays: 1,
    maxLeadDays: 2,
    surchargePercent: 50,
    isActive: 1,
    order: 2,
  },
];

// Default Travel Zones
const travelZones = [
  {
    id: generateId(),
    name: 'Local',
    description: 'Within Skopje city (0-15km)',
    minDistanceKm: 0,
    maxDistanceKm: 15,
    flatFee: null,
    perKmRate: null,
    isIncluded: 1,
    isActive: 1,
    order: 0,
  },
  {
    id: generateId(),
    name: 'Nearby',
    description: 'Skopje region (15-30km)',
    minDistanceKm: 15,
    maxDistanceKm: 30,
    flatFee: 15,
    perKmRate: 0.40,
    isIncluded: 0,
    isActive: 1,
    order: 1,
  },
  {
    id: generateId(),
    name: 'Regional',
    description: 'Within 30-60km (Tetovo, Kumanovo, Veles area)',
    minDistanceKm: 30,
    maxDistanceKm: 60,
    flatFee: 25,
    perKmRate: 0.35,
    isIncluded: 0,
    isActive: 1,
    order: 2,
  },
  {
    id: generateId(),
    name: 'Extended',
    description: 'Within 60-120km (Shtip, Prilep, Gostivar area)',
    minDistanceKm: 60,
    maxDistanceKm: 120,
    flatFee: 40,
    perKmRate: 0.30,
    isIncluded: 0,
    isActive: 1,
    order: 3,
  },
  {
    id: generateId(),
    name: 'Distant',
    description: 'Over 120km (Bitola, Ohrid, Struga, Strumica)',
    minDistanceKm: 120,
    maxDistanceKm: null,
    flatFee: 60,
    perKmRate: 0.25,
    isIncluded: 0,
    isActive: 1,
    order: 4,
  },
];

// Default Booking Settings
const bookingSettings = {
  id: 'default',
  defaultMinLeadDays: 3,
  maxAdvanceBookingDays: 90,
  businessAddress: null,
  businessCity: 'Skopje',
  businessLatitude: 41.9981,
  businessLongitude: 21.4254,
  includeReturnTrip: 1,
  freeDistanceKm: 15,
  workOnWeekends: 0,
  workOnSunday: 0,
  quoteValidDays: 14,
  requireDeposit: 1,
  depositPercent: 30,
  minBundleParticipants: 3,
  bundleDiscountPercent: 10,
  updatedAt: now,
};

try {
  // Insert Urgency Tiers
  const insertTier = db.prepare(`
    INSERT OR REPLACE INTO UrgencyTier (id, name, displayName, description, minLeadDays, maxLeadDays, surchargePercent, isActive, "order", createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const tier of urgencyTiers) {
    insertTier.run(
      tier.id, tier.name, tier.displayName, tier.description,
      tier.minLeadDays, tier.maxLeadDays, tier.surchargePercent,
      tier.isActive, tier.order, now, now
    );
  }
  console.log(`✅ Created ${urgencyTiers.length} urgency tiers`);

  // Insert Travel Zones
  const insertZone = db.prepare(`
    INSERT OR REPLACE INTO TravelZone (id, name, description, minDistanceKm, maxDistanceKm, flatFee, perKmRate, isIncluded, isActive, "order", createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const zone of travelZones) {
    insertZone.run(
      zone.id, zone.name, zone.description, zone.minDistanceKm,
      zone.maxDistanceKm, zone.flatFee, zone.perKmRate, zone.isIncluded,
      zone.isActive, zone.order, now, now
    );
  }
  console.log(`✅ Created ${travelZones.length} travel zones`);

  // Insert Booking Settings
  const insertSettings = db.prepare(`
    INSERT OR REPLACE INTO BookingSettings (id, defaultMinLeadDays, maxAdvanceBookingDays, businessAddress, businessCity, businessLatitude, businessLongitude, includeReturnTrip, freeDistanceKm, workOnWeekends, workOnSunday, quoteValidDays, requireDeposit, depositPercent, minBundleParticipants, bundleDiscountPercent, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertSettings.run(
    bookingSettings.id, bookingSettings.defaultMinLeadDays, bookingSettings.maxAdvanceBookingDays,
    bookingSettings.businessAddress, bookingSettings.businessCity, bookingSettings.businessLatitude,
    bookingSettings.businessLongitude, bookingSettings.includeReturnTrip, bookingSettings.freeDistanceKm,
    bookingSettings.workOnWeekends, bookingSettings.workOnSunday, bookingSettings.quoteValidDays,
    bookingSettings.requireDeposit, bookingSettings.depositPercent, bookingSettings.minBundleParticipants,
    bookingSettings.bundleDiscountPercent, bookingSettings.updatedAt
  );
  console.log('✅ Created booking settings');

  // Create a sample bundle for Ohrid
  const bundleId = generateId();
  const bundleDate = new Date();
  bundleDate.setDate(bundleDate.getDate() + 30); // 30 days from now
  const deadline = new Date(bundleDate);
  deadline.setDate(deadline.getDate() - 7); // 7 days before

  const insertBundle = db.prepare(`
    INSERT OR REPLACE INTO TravelBundle (id, name, city, region, scheduledDate, maxParticipants, currentCount, distanceKm, totalTravelCost, perPersonTravelFee, discountPercent, description, status, isActive, registrationDeadline, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertBundle.run(
    bundleId,
    'Ohrid Trip - ' + bundleDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    'Ohrid',
    'Southwest Macedonia',
    bundleDate.toISOString(),
    10,
    0,
    175,
    120, // Total travel cost
    null, // Will be calculated based on participants
    15, // 15% bundle discount
    'Join our Ohrid photography trip! Share travel costs with other clients and get a 15% discount on your virtual tour package.',
    'open',
    1,
    deadline.toISOString(),
    now,
    now
  );
  console.log('✅ Created sample Ohrid bundle');

  console.log('\n🎉 Booking system seeded successfully!');

} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  db.close();
}
