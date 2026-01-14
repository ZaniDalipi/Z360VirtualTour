import { prisma } from '@/lib/prisma'

// City distance lookup (approximate from Skopje - base location)
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
  // International cities (approximate from Skopje)
  'Tirana': 200,
  'Pristina': 90,
  'Sofia': 250,
  'Thessaloniki': 240,
  'Belgrade': 430,
}

// City-to-city distance matrix for bundle eligibility
// Format: 'CityA-CityB': distance in km (cities are alphabetically sorted)
export const cityToCityDistances: Record<string, number> = {
  // Ohrid region
  'Ohrid-Struga': 15,
  'Ohrid-Resen': 35,
  'Bitola-Ohrid': 70,
  'Kicevo-Ohrid': 60,
  'Ohrid-Prilep': 100,
  // Bitola region
  'Bitola-Prilep': 45,
  'Bitola-Resen': 35,
  // Tetovo-Gostivar region
  'Gostivar-Tetovo': 25,
  'Debar-Gostivar': 65,
  'Kicevo-Tetovo': 65,
  // Skopje region
  'Kumanovo-Skopje': 40,
  'Skopje-Tetovo': 45,
  'Skopje-Veles': 55,
  // Strumica-Gevgelija region
  'Gevgelija-Strumica': 50,
  'Strumica-Shtip': 65,
  // Central/Eastern
  'Kavadarci-Veles': 50,
  'Kavadarci-Prilep': 40,
  'Shtip-Veles': 45,
  'Kochani-Shtip': 35,
  'Kratovo-Kumanovo': 60,
  // International
  'Pristina-Skopje': 90,
  'Skopje-Sofia': 250,
  'Skopje-Thessaloniki': 240,
  'Skopje-Tirana': 200,
  'Ohrid-Tirana': 130,
  'Struga-Tirana': 120,
  'Debar-Tirana': 100,
  'Bitola-Thessaloniki': 160,
  'Gevgelija-Thessaloniki': 90,
  'Kumanovo-Pristina': 60,
  'Tetovo-Pristina': 80,
  'Skopje-Belgrade': 430,
  'Kumanovo-Sofia': 230,
}

// Maximum distance (km) from bundle city to qualify for bundle discount
export const BUNDLE_MAX_DISTANCE_KM = 50

// Fallback values (used if database settings not found)
export const DEFAULT_SAME_CITY_DISCOUNT_PERCENT = 15
export const DEFAULT_SAME_CITY_MAX_DISTANCE_KM = 40

/**
 * Get distance from Skopje to a city
 */
export function getDistanceByCity(city: string): number | null {
  const normalizedCity = city.trim().toLowerCase()
  for (const [key, distance] of Object.entries(cityDistances)) {
    if (key.toLowerCase() === normalizedCity) {
      return distance
    }
  }
  return null
}

/**
 * Normalize city name for lookup
 */
function normalizeCity(city: string): string {
  return city.trim().charAt(0).toUpperCase() + city.trim().slice(1).toLowerCase()
}

/**
 * Get distance between two cities
 * Returns null if distance is not found
 */
export function getDistanceBetweenCities(cityA: string, cityB: string): number | null {
  const normA = normalizeCity(cityA)
  const normB = normalizeCity(cityB)

  // Same city = 0 distance
  if (normA.toLowerCase() === normB.toLowerCase()) {
    return 0
  }

  // Sort alphabetically for consistent key lookup
  const [first, second] = [normA, normB].sort()
  const key = `${first}-${second}`

  // Check direct lookup
  if (cityToCityDistances[key] !== undefined) {
    return cityToCityDistances[key]
  }

  // Fallback: Calculate approximate distance using distances from Skopje
  // This uses triangle approximation (may be less accurate)
  const distA = getDistanceByCity(cityA)
  const distB = getDistanceByCity(cityB)

  if (distA !== null && distB !== null) {
    // Rough approximation: absolute difference gives minimum, sum gives maximum
    // We use an average which is reasonable for most cases
    return Math.abs(distA - distB)
  }

  return null
}

/**
 * Check if a user's city is within range of a bundle's city
 * Returns true if eligible for bundle discount
 */
export function isCityWithinBundleRange(userCity: string, bundleCity: string, maxDistanceKm: number = BUNDLE_MAX_DISTANCE_KM): boolean {
  const distance = getDistanceBetweenCities(userCity, bundleCity)

  // If we can't determine distance, be conservative and don't allow bundle discount
  if (distance === null) {
    return false
  }

  return distance <= maxDistanceKm
}

export interface QuoteCalculation {
  basePrice: number
  urgencyTierName: string
  urgencySurchargePercent: number
  urgencySurchargeAmount: number
  travelZoneName: string | null
  travelFee: number
  bundleName: string | null
  bundleDiscount: number
  sameCityDiscount: number
  sameCityDiscountPercent: number
  matchedScheduledCity: string | null
  subtotal: number
  total: number
  depositAmount: number | null
  depositPercent: number | null
}

export async function calculateQuote(params: {
  pricingPlanPrice: number
  urgencyTierId?: string | null
  distanceKm?: number | null
  bundleId?: string | null
  userCity?: string | null  // User's property city for bundle eligibility check
  scheduledCities?: string[] | null  // Cities where photographer is already scheduled (for same-city discount)
}): Promise<QuoteCalculation> {
  // Get booking settings
  const settings = await prisma.bookingSettings.findUnique({
    where: { id: 'default' },
  })

  // Get urgency tier
  let urgencyTier = null
  if (params.urgencyTierId) {
    urgencyTier = await prisma.urgencyTier.findUnique({
      where: { id: params.urgencyTierId },
    })
  }

  // Calculate urgency surcharge
  const urgencySurchargePercent = urgencyTier?.surchargePercent || 0
  const urgencySurchargeAmount = params.pricingPlanPrice * (urgencySurchargePercent / 100)

  // Calculate travel fee
  let travelFee = 0
  let travelZoneName: string | null = null
  let bundleDiscount = 0
  let bundleName: string | null = null
  let sameCityDiscount = 0
  let sameCityDiscountPercent = 0
  let matchedScheduledCity: string | null = null
  let isSameCityMatch = false

  // Get same-city discount settings from database or use defaults
  const sameCityDiscountPercentSetting = settings?.sameCityDiscountPercent ?? DEFAULT_SAME_CITY_DISCOUNT_PERCENT
  const sameCityMaxDistanceKm = settings?.sameCityMaxDistanceKm ?? DEFAULT_SAME_CITY_MAX_DISTANCE_KM

  // Check for same-city match (when booking where photographer is already scheduled)
  if (params.userCity && params.scheduledCities && params.scheduledCities.length > 0) {
    for (const scheduledCity of params.scheduledCities) {
      const distance = getDistanceBetweenCities(params.userCity, scheduledCity)
      if (distance !== null && distance <= sameCityMaxDistanceKm) {
        // User's city is within range of a scheduled city
        // Apply service discount AND make travel FREE
        isSameCityMatch = true
        sameCityDiscountPercent = sameCityDiscountPercentSetting
        sameCityDiscount = params.pricingPlanPrice * (sameCityDiscountPercentSetting / 100)
        matchedScheduledCity = scheduledCity
        break // Found a match, no need to check other cities
      }
    }
  }

  if (params.bundleId) {
    // If joining a bundle, use bundle pricing
    const bundle = await prisma.travelBundle.findUnique({
      where: { id: params.bundleId },
    })
    if (bundle) {
      bundleName = bundle.name
      travelFee = bundle.perPersonTravelFee || 0

      // Only apply bundle discount if user's city is within the bundle's geographic range
      // If user's city is too far from bundle city, they don't qualify for the discount
      const userCity = params.userCity
      const bundleCity = bundle.city

      if (userCity && bundleCity) {
        const isEligible = isCityWithinBundleRange(userCity, bundleCity)
        if (isEligible) {
          bundleDiscount = params.pricingPlanPrice * (bundle.discountPercent / 100)
        }
        // If not eligible, bundleDiscount stays 0 - they still get shared travel but no discount
      } else {
        // If we don't have city info, apply discount as before (backwards compatibility)
        bundleDiscount = params.pricingPlanPrice * (bundle.discountPercent / 100)
      }
    }
  } else if (params.distanceKm !== null && params.distanceKm !== undefined) {
    // Calculate based on travel zone
    const zone = await prisma.travelZone.findFirst({
      where: {
        isActive: true,
        minDistanceKm: { lte: params.distanceKm },
        OR: [
          { maxDistanceKm: null },
          { maxDistanceKm: { gte: params.distanceKm } },
        ],
      },
      orderBy: { minDistanceKm: 'desc' },
    })

    if (zone) {
      travelZoneName = zone.name
      if (!zone.isIncluded) {
        travelFee = zone.flatFee || 0
        if (zone.perKmRate) {
          // Calculate from distance 0, not zone minimum
          travelFee += params.distanceKm * zone.perKmRate
        }
        // Double for return trip if configured
        if (settings?.includeReturnTrip) {
          travelFee *= 2
        }
      }
    }
  }

  // IMPORTANT: If same-city match, travel is FREE!
  if (isSameCityMatch) {
    travelFee = 0
    travelZoneName = 'Same City (Free)'
  }

  // Calculate totals - apply both bundle discount and same-city discount
  const totalDiscount = bundleDiscount + sameCityDiscount
  const subtotal = params.pricingPlanPrice + urgencySurchargeAmount - totalDiscount
  const total = subtotal + travelFee

  // Calculate deposit
  let depositAmount: number | null = null
  let depositPercent: number | null = null
  if (settings?.requireDeposit) {
    depositPercent = settings.depositPercent
    depositAmount = total * (settings.depositPercent / 100)
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
    sameCityDiscount,
    sameCityDiscountPercent,
    matchedScheduledCity,
    subtotal,
    total,
    depositAmount,
    depositPercent,
  }
}
