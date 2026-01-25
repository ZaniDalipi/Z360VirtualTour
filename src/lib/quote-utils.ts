import connectDB from '@/lib/mongodb'
import { UrgencyTier, TravelZone, TravelBundle, BookingSettings } from '@/lib/models'

// City distance lookup (approximate from Skopje in km)
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

export async function calculateQuote(params: {
  pricingPlanPrice: number
  urgencyTierId?: string | null
  distanceKm?: number | null
  bundleId?: string | null
}): Promise<QuoteCalculation> {
  await connectDB()

  const settings = await BookingSettings.findOne()

  // Get urgency tier
  let urgencyTier = null
  if (params.urgencyTierId) {
    urgencyTier = await UrgencyTier.findById(params.urgencyTierId)
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
    // If joining a bundle, use bundle pricing
    const bundle = await TravelBundle.findById(params.bundleId)
    if (bundle) {
      bundleName = bundle.name
      travelFee = bundle.perPersonTravelFee || 0
      bundleDiscount = params.pricingPlanPrice * (bundle.discountPercent / 100)
    }
  } else if (params.distanceKm !== null && params.distanceKm !== undefined) {
    // Calculate based on travel zone
    const zone = await TravelZone.findOne({
      isActive: true,
      minDistanceKm: { $lte: params.distanceKm },
      $or: [
        { maxDistanceKm: null },
        { maxDistanceKm: { $gte: params.distanceKm } }
      ]
    }).sort({ minDistanceKm: -1 })

    if (zone) {
      travelZoneName = zone.name
      if (!zone.isIncluded) {
        travelFee = zone.flatFee || 0
        if (zone.perKmRate) {
          const chargeableKm = Math.max(0, params.distanceKm - zone.minDistanceKm)
          travelFee += chargeableKm * zone.perKmRate
        }
        // Double for return trip if configured
        if (settings?.includeReturnTrip) {
          travelFee *= 2
        }
      }
    }
  }

  // Calculate totals
  const subtotal = params.pricingPlanPrice + urgencySurchargeAmount - bundleDiscount
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
    subtotal,
    total,
    depositAmount,
    depositPercent,
  }
}
