import { getTestPrisma, isDatabaseConnected } from '../setup'
import {
  createTestBooking,
  createTestBlockedDate,
  createTestTravelBundle,
  createTestPricingPlan,
  createTestUrgencyTier,
  createTestTravelZone,
  createTestChangeRequest,
  cleanupAllTestData,
  calculateSurcharge,
  calculatePerPersonTravelFee,
} from '../utils/helpers'

describe('Booking & Scheduling System', () => {
  // Clean up before all tests
  beforeAll(async () => {
    if (isDatabaseConnected()) {
      await cleanupAllTestData()
    } else {
      console.log('    Database not available, skipping setup')
    }
  })

  // Clean up after all tests
  afterAll(async () => {
    if (isDatabaseConnected()) {
      await cleanupAllTestData()
    }
  })

  describe('Booking Creation', () => {
    it('should create a new booking with required fields', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const booking = await createTestBooking({
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        propertyAddress: '456 Main Street, Skopje',
      })

      expect(booking).toBeDefined()
      expect(booking.id).toBeDefined()
      expect(booking.clientName).toBe('John Doe')
      expect(booking.clientEmail).toBe('john@example.com')
      expect(booking.status).toBe('quote_requested')

      // Cleanup
      const prisma = getTestPrisma()
      if (prisma) await prisma.booking.delete({ where: { id: booking.id } })
    })

    it('should create booking with pricing plan', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const plan = await createTestPricingPlan({
        name: 'Premium Tour',
        price: 499,
        features: ['360° Photos', 'Video Tour', 'Drone Footage'],
      })

      const booking = await createTestBooking({
        clientName: 'Jane Doe',
        clientEmail: 'jane@example.com',
        propertyAddress: '789 Oak Avenue',
        pricingPlanId: plan.id,
        basePrice: plan.price,
      })

      expect(booking.pricingPlanId).toBe(plan.id)
      expect(booking.basePrice).toBe(499)

      // Cleanup
      const prisma = getTestPrisma()
      if (prisma) {
        await prisma.booking.delete({ where: { id: booking.id } })
        await prisma.pricingPlan.delete({ where: { id: plan.id } })
      }
    })

    it('should create booking with urgency tier surcharge', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const tier = await createTestUrgencyTier({
        name: 'express-test',
        displayName: 'Express',
        minLeadDays: 3,
        maxLeadDays: 7,
        surchargePercent: 25,
      })

      const basePrice = 400
      const surcharge = calculateSurcharge(basePrice, tier.surchargePercent)

      const booking = await createTestBooking({
        clientName: 'Express Client',
        clientEmail: 'express@example.com',
        propertyAddress: '321 Express Lane',
        urgencyTierId: tier.id,
        basePrice: basePrice,
        urgencySurcharge: surcharge,
        totalQuote: basePrice + surcharge,
      })

      expect(booking.urgencyTierId).toBe(tier.id)
      expect(booking.urgencySurcharge).toBe(100) // 25% of 400
      expect(booking.totalQuote).toBe(500)

      // Cleanup
      const prisma = getTestPrisma()
      if (prisma) {
        await prisma.booking.delete({ where: { id: booking.id } })
        await prisma.urgencyTier.delete({ where: { id: tier.id } })
      }
    })

    it('should create booking with travel zone fee', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const zone = await createTestTravelZone({
        name: 'Regional Zone',
        minDistanceKm: 15,
        maxDistanceKm: 50,
        flatFee: 30,
      })

      const booking = await createTestBooking({
        clientName: 'Regional Client',
        clientEmail: 'regional@example.com',
        propertyAddress: '100 Regional Road',
        travelZoneId: zone.id,
        travelFee: zone.flatFee,
      })

      expect(booking.travelZoneId).toBe(zone.id)
      expect(booking.travelFee).toBe(30)

      // Cleanup
      const prisma = getTestPrisma()
      if (prisma) {
        await prisma.booking.delete({ where: { id: booking.id } })
        await prisma.travelZone.delete({ where: { id: zone.id } })
      }
    })
  })

  describe('Booking Status Workflow', () => {
    it('should update booking status from quote_requested to quote_sent', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!
      const booking = await createTestBooking()

      const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'quote_sent',
          totalQuote: 350,
          quoteSentAt: new Date(),
        },
      })

      expect(updated.status).toBe('quote_sent')
      expect(updated.totalQuote).toBe(350)
      expect(updated.quoteSentAt).toBeDefined()

      // Cleanup
      await prisma.booking.delete({ where: { id: booking.id } })
    })

    it('should update booking status to confirmed with deposit', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!
      const booking = await createTestBooking({
        totalQuote: 500,
      })

      const depositAmount = 500 * 0.3 // 30% deposit

      const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'confirmed',
          depositAmount: depositAmount,
          depositPaid: true,
          confirmedAt: new Date(),
        },
      })

      expect(updated.status).toBe('confirmed')
      expect(updated.depositAmount).toBe(150)
      expect(updated.depositPaid).toBe(true)
      expect(updated.confirmedAt).toBeDefined()

      // Cleanup
      await prisma.booking.delete({ where: { id: booking.id } })
    })

    it('should update booking status through complete workflow', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!
      const booking = await createTestBooking()

      // Status progression: quote_requested -> quote_sent -> confirmed -> scheduled -> in_progress -> completed
      const statuses = ['quote_sent', 'confirmed', 'scheduled', 'in_progress', 'completed']

      let currentBooking = booking
      for (const status of statuses) {
        currentBooking = await prisma.booking.update({
          where: { id: currentBooking.id },
          data: { status },
        })
        expect(currentBooking.status).toBe(status)
      }

      // Cleanup
      await prisma.booking.delete({ where: { id: booking.id } })
    })

    it('should track work duration for in_progress bookings', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!
      const booking = await createTestBooking({
        status: 'in_progress',
      })

      // Simulate work completion
      const completedBooking = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      })

      expect(completedBooking.status).toBe('completed')
      expect(completedBooking.completedAt).toBeDefined()

      // Cleanup
      await prisma.booking.delete({ where: { id: booking.id } })
    })
  })

  describe('Scheduling & Date Management', () => {
    it('should set preferred and alternate dates', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!
      const preferredDate = new Date('2025-02-15')
      const alternateDate = new Date('2025-02-17')

      const booking = await createTestBooking({
        preferredDate,
        alternateDate,
      })

      expect(booking.preferredDate).toEqual(preferredDate)
      expect(booking.alternateDate).toEqual(alternateDate)

      // Cleanup
      await prisma.booking.delete({ where: { id: booking.id } })
    })

    it('should confirm scheduled date', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!
      const booking = await createTestBooking({
        preferredDate: new Date('2025-02-15'),
      })

      const confirmedDate = new Date('2025-02-15')
      const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          confirmedDate,
          status: 'scheduled',
        },
      })

      expect(updated.confirmedDate).toEqual(confirmedDate)
      expect(updated.status).toBe('scheduled')

      // Cleanup
      await prisma.booking.delete({ where: { id: booking.id } })
    })

    it('should handle deadline dates for rush bookings', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!
      const deadlineDate = new Date('2025-01-25')

      const booking = await createTestBooking({
        deadlineDate,
        status: 'quote_requested',
      })

      expect(booking.deadlineDate).toEqual(deadlineDate)

      // Cleanup
      await prisma.booking.delete({ where: { id: booking.id } })
    })
  })

  describe('Blocked Dates', () => {
    it('should create blocked date', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!
      const blockedDate = await createTestBlockedDate(
        new Date('2025-03-01'),
        'Holiday'
      )

      expect(blockedDate).toBeDefined()
      expect(blockedDate.reason).toBe('Holiday')
      expect(blockedDate.isAllDay).toBe(true)

      // Cleanup
      await prisma.blockedDate.delete({ where: { id: blockedDate.id } })
    })

    it('should prevent duplicate blocked dates', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!
      const date = new Date('2025-03-02')
      const blockedDate = await createTestBlockedDate(date, 'First block')

      // Attempt to create duplicate should fail
      await expect(createTestBlockedDate(date, 'Duplicate'))
        .rejects.toThrow()

      // Cleanup
      await prisma.blockedDate.delete({ where: { id: blockedDate.id } })
    })

    it('should list all blocked dates', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!

      // Clear existing blocked dates first
      await prisma.blockedDate.deleteMany({})

      const dates = [
        new Date('2025-04-01'),
        new Date('2025-04-02'),
        new Date('2025-04-03'),
      ]

      const created = await Promise.all(
        dates.map((date, i) => createTestBlockedDate(date, `Block ${i + 1}`))
      )

      const allBlocked = await prisma.blockedDate.findMany({
        orderBy: { date: 'asc' },
      })

      expect(allBlocked.length).toBe(3)

      // Cleanup
      await prisma.blockedDate.deleteMany({})
    })

    it('should delete blocked date', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!
      const blockedDate = await createTestBlockedDate(
        new Date('2025-03-05'),
        'To be deleted'
      )

      await prisma.blockedDate.delete({ where: { id: blockedDate.id } })

      const found = await prisma.blockedDate.findUnique({
        where: { id: blockedDate.id },
      })

      expect(found).toBeNull()
    })
  })

  describe('Travel Bundles', () => {
    it('should create travel bundle', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!
      const bundle = await createTestTravelBundle({
        name: 'Ohrid Bundle - Feb 2025',
        city: 'Ohrid',
        region: 'Southwest',
        scheduledDate: new Date('2025-02-15'),
        maxParticipants: 5,
        totalTravelCost: 100,
      })

      expect(bundle).toBeDefined()
      expect(bundle.city).toBe('Ohrid')
      expect(bundle.maxParticipants).toBe(5)
      expect(bundle.status).toBe('open')

      // Cleanup
      await prisma.travelBundle.delete({ where: { id: bundle.id } })
    })

    it('should add booking to travel bundle', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!
      const bundle = await createTestTravelBundle({
        totalTravelCost: 100,
        maxParticipants: 5,
      })

      const booking = await createTestBooking({
        travelBundleId: bundle.id,
        propertyCity: 'Ohrid',
      })

      // Update bundle count
      const updatedBundle = await prisma.travelBundle.update({
        where: { id: bundle.id },
        data: {
          currentCount: { increment: 1 },
        },
      })

      expect(booking.travelBundleId).toBe(bundle.id)
      expect(updatedBundle.currentCount).toBe(1)

      // Cleanup
      await prisma.booking.delete({ where: { id: booking.id } })
      await prisma.travelBundle.delete({ where: { id: bundle.id } })
    })

    it('should calculate per-person travel fee', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!
      const totalCost = 100
      const participants = 4

      const bundle = await createTestTravelBundle({
        totalTravelCost: totalCost,
        maxParticipants: 5,
        currentCount: participants,
      })

      const perPersonFee = calculatePerPersonTravelFee(totalCost, participants)
      expect(perPersonFee).toBe(25)

      const updatedBundle = await prisma.travelBundle.update({
        where: { id: bundle.id },
        data: { perPersonTravelFee: perPersonFee },
      })

      expect(updatedBundle.perPersonTravelFee).toBe(25)

      // Cleanup
      await prisma.travelBundle.delete({ where: { id: bundle.id } })
    })

    it('should update bundle status when full', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!
      const bundle = await createTestTravelBundle({
        maxParticipants: 2,
        currentCount: 1,
      })

      // Add one more to fill
      const updatedBundle = await prisma.travelBundle.update({
        where: { id: bundle.id },
        data: {
          currentCount: 2,
          status: 'full',
        },
      })

      expect(updatedBundle.currentCount).toBe(2)
      expect(updatedBundle.status).toBe('full')

      // Cleanup
      await prisma.travelBundle.delete({ where: { id: bundle.id } })
    })
  })

  describe('Urgency Tiers', () => {
    it('should create standard urgency tier', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!
      const tier = await createTestUrgencyTier({
        name: 'standard-test',
        displayName: 'Standard Delivery',
        description: '7-14 day turnaround',
        minLeadDays: 7,
        maxLeadDays: 14,
        surchargePercent: 0,
      })

      expect(tier.name).toBe('standard-test')
      expect(tier.surchargePercent).toBe(0)

      // Cleanup
      await prisma.urgencyTier.delete({ where: { id: tier.id } })
    })

    it('should create express urgency tier with surcharge', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!
      const tier = await createTestUrgencyTier({
        name: 'express-surcharge-test',
        displayName: 'Express',
        description: '3-5 day turnaround',
        minLeadDays: 3,
        maxLeadDays: 5,
        surchargePercent: 25,
      })

      expect(tier.surchargePercent).toBe(25)

      // Cleanup
      await prisma.urgencyTier.delete({ where: { id: tier.id } })
    })

    it('should create rush urgency tier with high surcharge', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!
      const tier = await createTestUrgencyTier({
        name: 'rush-test',
        displayName: 'Rush/Urgent',
        description: '24-48 hours',
        minLeadDays: 1,
        maxLeadDays: 2,
        surchargePercent: 50,
      })

      expect(tier.surchargePercent).toBe(50)

      // Cleanup
      await prisma.urgencyTier.delete({ where: { id: tier.id } })
    })

    it('should calculate surcharge correctly', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!
      const tier = await createTestUrgencyTier({
        name: 'calc-test',
        displayName: 'Test Tier',
        surchargePercent: 30,
      })

      const basePrice = 200
      const surcharge = calculateSurcharge(basePrice, tier.surchargePercent)

      expect(surcharge).toBe(60) // 30% of 200

      // Cleanup
      await prisma.urgencyTier.delete({ where: { id: tier.id } })
    })
  })

  describe('Change Requests', () => {
    it('should create date change request', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!
      const booking = await createTestBooking({
        confirmedDate: new Date('2025-02-10'),
      })

      const changeRequest = await createTestChangeRequest(booking.id, {
        requestType: 'date_change',
        originalValue: JSON.stringify({ date: '2025-02-10' }),
        requestedValue: JSON.stringify({ date: '2025-02-15' }),
        reason: 'Schedule conflict',
      })

      expect(changeRequest.bookingId).toBe(booking.id)
      expect(changeRequest.requestType).toBe('date_change')
      expect(changeRequest.status).toBe('pending')

      // Cleanup
      await prisma.changeRequest.delete({ where: { id: changeRequest.id } })
      await prisma.booking.delete({ where: { id: booking.id } })
    })

    it('should approve change request', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!
      const booking = await createTestBooking()
      const changeRequest = await createTestChangeRequest(booking.id, {
        requestType: 'date_change',
      })

      const approved = await prisma.changeRequest.update({
        where: { id: changeRequest.id },
        data: {
          status: 'approved',
          adminNotes: 'Approved - new date confirmed',
          resolvedAt: new Date(),
        },
      })

      expect(approved.status).toBe('approved')
      expect(approved.resolvedAt).toBeDefined()

      // Cleanup
      await prisma.changeRequest.delete({ where: { id: changeRequest.id } })
      await prisma.booking.delete({ where: { id: booking.id } })
    })

    it('should reject change request', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!
      const booking = await createTestBooking()
      const changeRequest = await createTestChangeRequest(booking.id, {
        requestType: 'date_change',
      })

      const rejected = await prisma.changeRequest.update({
        where: { id: changeRequest.id },
        data: {
          status: 'rejected',
          adminNotes: 'Cannot accommodate - date fully booked',
          resolvedAt: new Date(),
        },
      })

      expect(rejected.status).toBe('rejected')

      // Cleanup
      await prisma.changeRequest.delete({ where: { id: changeRequest.id } })
      await prisma.booking.delete({ where: { id: booking.id } })
    })
  })

  describe('Payment Tracking', () => {
    it('should track deposit payment', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!
      const booking = await createTestBooking({
        totalQuote: 400,
      })

      const depositAmount = 400 * 0.3 // 30%

      const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          depositAmount,
          depositPaid: true,
          status: 'confirmed',
        },
      })

      expect(updated.depositAmount).toBe(120)
      expect(updated.depositPaid).toBe(true)

      // Cleanup
      await prisma.booking.delete({ where: { id: booking.id } })
    })

    it('should track full payment', async () => {
      if (!isDatabaseConnected()) {
        console.log('    Skipping: Database not available')
        return
      }

      const prisma = getTestPrisma()!
      const booking = await createTestBooking({
        totalQuote: 500,
        status: 'completed',
      })

      // In a real app, you'd have a payments table
      // Here we just verify the booking can track completion
      const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          depositPaid: true,
          depositAmount: 500, // Full amount
          completedAt: new Date(),
        },
      })

      expect(updated.depositAmount).toBe(500)
      expect(updated.completedAt).toBeDefined()

      // Cleanup
      await prisma.booking.delete({ where: { id: booking.id } })
    })
  })
})

console.log('✓ Booking & Scheduling tests loaded')
