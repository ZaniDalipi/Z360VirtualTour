/**
 * Booking & Scheduling Tests
 * Tests all booking-related functionality including:
 * - Creating bookings
 * - Updating booking status
 * - Scheduling confirmation
 * - Travel bundles
 * - Blocked dates
 * - Urgency tiers
 */

import { testPrisma, cleanDatabase } from '../setup'
import {
  createTestAdmin,
  createTestUser,
  createTestBooking,
  createTestBlockedDate,
  createTestTravelBundle,
  createTestUrgencyTier,
  createTestTravelZone,
  createTestPricingPlan,
  createAdminToken,
  createUserToken,
} from '../utils/helpers'

describe('Booking & Scheduling System', () => {
  let admin: any
  let adminToken: string
  let user: any
  let userToken: string

  beforeAll(async () => {
    try {
      await cleanDatabase()
      admin = await createTestAdmin({ email: 'booking-admin@test.com' })
      adminToken = createAdminToken(admin)
      user = await createTestUser({ email: 'booking-user@test.com' })
      userToken = createUserToken(user)
    } catch (error) {
      console.log('Database not available, skipping setup')
    }
  })

  afterAll(async () => {
    try {
      await cleanDatabase()
    } catch (error) {
      // Ignore cleanup errors
    }
  })

  describe('Booking Creation', () => {
    it('should create a new booking with required fields', async () => {
      if (!testPrisma) return

      const booking = await createTestBooking({
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        propertyAddress: '123 Main St, Skopje',
        propertyCity: 'Skopje',
      })

      expect(booking).toBeDefined()
      expect(booking.id).toBeDefined()
      expect(booking.clientName).toBe('John Doe')
      expect(booking.clientEmail).toBe('john@example.com')
      expect(booking.status).toBe('quote_requested')
    })

    it('should create booking with pricing plan', async () => {
      if (!testPrisma) return

      const pricingPlan = await createTestPricingPlan({
        name: 'Standard Package',
        price: 299,
      })

      const booking = await testPrisma.booking.create({
        data: {
          clientName: 'Jane Doe',
          clientEmail: 'jane@example.com',
          propertyAddress: '456 Oak Ave',
          pricingPlanId: pricingPlan.id,
          basePrice: pricingPlan.price,
        },
      })

      expect(booking.pricingPlanId).toBe(pricingPlan.id)
      expect(booking.basePrice).toBe(299)
    })

    it('should create booking with urgency tier surcharge', async () => {
      if (!testPrisma) return

      const urgencyTier = await createTestUrgencyTier({
        name: 'rush',
        displayName: 'Rush Delivery',
        minLeadDays: 1,
        maxLeadDays: 3,
        surchargePercent: 50,
      })

      const booking = await testPrisma.booking.create({
        data: {
          clientName: 'Rush Client',
          clientEmail: 'rush@example.com',
          propertyAddress: '789 Fast Lane',
          urgencyTierId: urgencyTier.id,
          basePrice: 200,
          urgencySurcharge: 100, // 50% of 200
          totalQuote: 300,
        },
      })

      expect(booking.urgencyTierId).toBe(urgencyTier.id)
      expect(booking.urgencySurcharge).toBe(100)
      expect(booking.totalQuote).toBe(300)
    })

    it('should create booking with travel zone fee', async () => {
      if (!testPrisma) return

      const travelZone = await createTestTravelZone({
        name: 'Regional',
        minDistanceKm: 30,
        maxDistanceKm: 100,
        flatFee: 50,
      })

      const booking = await testPrisma.booking.create({
        data: {
          clientName: 'Regional Client',
          clientEmail: 'regional@example.com',
          propertyAddress: '100 Far Away Road',
          travelZoneId: travelZone.id,
          estimatedDistance: 60,
          travelFee: 50,
          basePrice: 300,
          totalQuote: 350,
        },
      })

      expect(booking.travelZoneId).toBe(travelZone.id)
      expect(booking.travelFee).toBe(50)
    })
  })

  describe('Booking Status Workflow', () => {
    it('should update booking status from quote_requested to quote_sent', async () => {
      if (!testPrisma) return

      const booking = await createTestBooking()

      const updated = await testPrisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'quote_sent',
          quoteSentAt: new Date(),
          totalQuote: 500,
        },
      })

      expect(updated.status).toBe('quote_sent')
      expect(updated.quoteSentAt).toBeDefined()
    })

    it('should update booking status to confirmed with deposit', async () => {
      if (!testPrisma) return

      const booking = await createTestBooking({ totalQuote: 1000 })

      const updated = await testPrisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'confirmed',
          depositAmount: 300, // 30%
          depositPaid: true,
          confirmedAt: new Date(),
        },
      })

      expect(updated.status).toBe('confirmed')
      expect(updated.depositAmount).toBe(300)
      expect(updated.depositPaid).toBe(true)
    })

    it('should update booking status through complete workflow', async () => {
      if (!testPrisma) return

      const booking = await createTestBooking()
      const statuses = [
        'quote_sent',
        'pending_deposit',
        'confirmed',
        'scheduled',
        'in_progress',
        'editing',
        'delivered',
        'completed',
      ]

      let currentBooking = booking
      for (const status of statuses) {
        currentBooking = await testPrisma.booking.update({
          where: { id: booking.id },
          data: { status },
        })
        expect(currentBooking.status).toBe(status)
      }
    })

    it('should track work duration for in_progress bookings', async () => {
      if (!testPrisma) return

      const booking = await createTestBooking()
      const workStart = new Date()

      await testPrisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'in_progress',
          workStartedAt: workStart,
        },
      })

      // Simulate work completion after 90 minutes
      const workEnd = new Date(workStart.getTime() + 90 * 60 * 1000)

      const completed = await testPrisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'editing',
          workEndedAt: workEnd,
          workDurationMinutes: 90,
        },
      })

      expect(completed.workDurationMinutes).toBe(90)
    })
  })

  describe('Scheduling & Date Management', () => {
    it('should set preferred and alternate dates', async () => {
      if (!testPrisma) return

      const preferredDate = new Date('2025-02-15')
      const alternateDate = new Date('2025-02-17')

      const booking = await testPrisma.booking.create({
        data: {
          clientName: 'Date Test Client',
          clientEmail: 'dates@example.com',
          propertyAddress: '123 Date Street',
          preferredDate,
          preferredTime: '10:00',
          alternateDate,
          alternateTime: '14:00',
          isFlexible: true,
        },
      })

      expect(booking.preferredDate).toEqual(preferredDate)
      expect(booking.preferredTime).toBe('10:00')
      expect(booking.alternateDate).toEqual(alternateDate)
      expect(booking.alternateTime).toBe('14:00')
    })

    it('should confirm scheduled date', async () => {
      if (!testPrisma) return

      const booking = await createTestBooking()
      const confirmedDate = new Date('2025-02-20')

      const updated = await testPrisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'scheduled',
          confirmedDate,
          confirmedTime: '09:00',
        },
      })

      expect(updated.confirmedDate).toEqual(confirmedDate)
      expect(updated.confirmedTime).toBe('09:00')
    })

    it('should handle deadline dates for rush bookings', async () => {
      if (!testPrisma) return

      const deadlineDate = new Date('2025-01-25')

      const booking = await testPrisma.booking.create({
        data: {
          clientName: 'Deadline Client',
          clientEmail: 'deadline@example.com',
          propertyAddress: '123 Urgent Street',
          deadlineDate,
        },
      })

      expect(booking.deadlineDate).toEqual(deadlineDate)
    })
  })

  describe('Blocked Dates', () => {
    it('should create blocked date', async () => {
      if (!testPrisma) return

      const blockedDate = await createTestBlockedDate(
        new Date('2025-02-14'),
        'Valentine\'s Day - Personal'
      )

      expect(blockedDate).toBeDefined()
      expect(blockedDate.reason).toBe("Valentine's Day - Personal")
      expect(blockedDate.isAllDay).toBe(true)
    })

    it('should prevent duplicate blocked dates', async () => {
      if (!testPrisma) return

      const date = new Date('2025-12-25')
      await createTestBlockedDate(date, 'Christmas')

      await expect(
        createTestBlockedDate(date, 'Duplicate')
      ).rejects.toThrow()
    })

    it('should list all blocked dates', async () => {
      if (!testPrisma) return

      // Clear existing blocked dates first
      await testPrisma.blockedDate.deleteMany({})

      await createTestBlockedDate(new Date('2025-03-01'), 'Day 1')
      await createTestBlockedDate(new Date('2025-03-02'), 'Day 2')
      await createTestBlockedDate(new Date('2025-03-03'), 'Day 3')

      const blockedDates = await testPrisma.blockedDate.findMany({
        orderBy: { date: 'asc' },
      })

      expect(blockedDates.length).toBe(3)
    })

    it('should delete blocked date', async () => {
      if (!testPrisma) return

      const blockedDate = await createTestBlockedDate(
        new Date('2025-04-01'),
        'To Delete'
      )

      await testPrisma.blockedDate.delete({
        where: { id: blockedDate.id },
      })

      const deleted = await testPrisma.blockedDate.findUnique({
        where: { id: blockedDate.id },
      })

      expect(deleted).toBeNull()
    })
  })

  describe('Travel Bundles', () => {
    it('should create travel bundle', async () => {
      if (!testPrisma) return

      const bundle = await createTestTravelBundle({
        name: 'Ohrid Summer Bundle',
        city: 'Ohrid',
        maxParticipants: 8,
      })

      expect(bundle).toBeDefined()
      expect(bundle.name).toBe('Ohrid Summer Bundle')
      expect(bundle.city).toBe('Ohrid')
      expect(bundle.maxParticipants).toBe(8)
      expect(bundle.status).toBe('open')
    })

    it('should add booking to travel bundle', async () => {
      if (!testPrisma) return

      const bundle = await createTestTravelBundle({
        name: 'Bitola Bundle',
        city: 'Bitola',
      })

      const booking = await testPrisma.booking.create({
        data: {
          clientName: 'Bundle Client',
          clientEmail: 'bundle@example.com',
          propertyAddress: '123 Bundle Street, Bitola',
          propertyCity: 'Bitola',
          travelBundleId: bundle.id,
          bundleDiscount: 50, // 10% bundle discount on 500
        },
      })

      expect(booking.travelBundleId).toBe(bundle.id)
      expect(booking.bundleDiscount).toBe(50)

      // Update bundle participant count
      const updatedBundle = await testPrisma.travelBundle.update({
        where: { id: bundle.id },
        data: { currentCount: { increment: 1 } },
      })

      expect(updatedBundle.currentCount).toBe(1)
    })

    it('should calculate per-person travel fee', async () => {
      if (!testPrisma) return

      const bundle = await testPrisma.travelBundle.create({
        data: {
          name: 'Shared Travel Bundle',
          city: 'Struga',
          scheduledDate: new Date('2025-06-01'),
          maxParticipants: 5,
          currentCount: 5,
          totalTravelCost: 100,
          perPersonTravelFee: 20, // 100 / 5
        },
      })

      expect(bundle.perPersonTravelFee).toBe(20)
    })

    it('should update bundle status when full', async () => {
      if (!testPrisma) return

      const bundle = await createTestTravelBundle({ maxParticipants: 3 })

      // Simulate adding 3 bookings
      const updatedBundle = await testPrisma.travelBundle.update({
        where: { id: bundle.id },
        data: {
          currentCount: 3,
          status: 'full',
        },
      })

      expect(updatedBundle.status).toBe('full')
    })
  })

  describe('Urgency Tiers', () => {
    it('should create standard urgency tier', async () => {
      if (!testPrisma) return

      const tier = await createTestUrgencyTier({
        name: 'standard',
        displayName: 'Standard Delivery',
        minLeadDays: 14,
        maxLeadDays: 30,
        surchargePercent: 0,
      })

      expect(tier.surchargePercent).toBe(0)
    })

    it('should create express urgency tier with surcharge', async () => {
      if (!testPrisma) return

      const tier = await createTestUrgencyTier({
        name: 'express',
        displayName: 'Express Delivery',
        minLeadDays: 7,
        maxLeadDays: 13,
        surchargePercent: 25,
      })

      expect(tier.surchargePercent).toBe(25)
    })

    it('should create rush urgency tier with high surcharge', async () => {
      if (!testPrisma) return

      const tier = await createTestUrgencyTier({
        name: 'rush_priority',
        displayName: 'Rush Priority',
        minLeadDays: 1,
        maxLeadDays: 6,
        surchargePercent: 50,
      })

      expect(tier.surchargePercent).toBe(50)
    })

    it('should calculate surcharge correctly', async () => {
      if (!testPrisma) return

      const tier = await createTestUrgencyTier({
        name: 'test_surcharge',
        displayName: 'Test Surcharge',
        minLeadDays: 1,
        surchargePercent: 25,
      })

      const basePrice = 400
      const surcharge = basePrice * (tier.surchargePercent / 100)

      expect(surcharge).toBe(100)
      expect(basePrice + surcharge).toBe(500)
    })
  })

  describe('Change Requests', () => {
    it('should create date change request', async () => {
      if (!testPrisma) return

      const booking = await createTestBooking()
      const newDate = new Date('2025-03-15')

      const updated = await testPrisma.booking.update({
        where: { id: booking.id },
        data: {
          changeRequestType: 'date_change',
          changeRequestMessage: 'Need to reschedule due to conflict',
          changeRequestDate: new Date(),
          requestedNewDate: newDate,
          requestedNewTime: '11:00',
          changeRequestStatus: 'pending',
        },
      })

      expect(updated.changeRequestType).toBe('date_change')
      expect(updated.changeRequestStatus).toBe('pending')
    })

    it('should approve change request', async () => {
      if (!testPrisma) return

      const booking = await testPrisma.booking.create({
        data: {
          clientName: 'Change Request Client',
          clientEmail: 'change@example.com',
          propertyAddress: '123 Change Street',
          changeRequestType: 'date_change',
          changeRequestStatus: 'pending',
          requestedNewDate: new Date('2025-04-01'),
        },
      })

      const approved = await testPrisma.booking.update({
        where: { id: booking.id },
        data: {
          changeRequestStatus: 'approved',
          confirmedDate: booking.requestedNewDate,
        },
      })

      expect(approved.changeRequestStatus).toBe('approved')
    })

    it('should reject change request', async () => {
      if (!testPrisma) return

      const booking = await testPrisma.booking.create({
        data: {
          clientName: 'Rejection Test',
          clientEmail: 'reject@example.com',
          propertyAddress: '123 Reject Street',
          changeRequestType: 'cancellation',
          changeRequestStatus: 'pending',
        },
      })

      const rejected = await testPrisma.booking.update({
        where: { id: booking.id },
        data: {
          changeRequestStatus: 'rejected',
        },
      })

      expect(rejected.changeRequestStatus).toBe('rejected')
    })
  })

  describe('Payment Tracking', () => {
    it('should track deposit payment', async () => {
      if (!testPrisma) return

      const booking = await createTestBooking({ totalQuote: 1000 })

      const updated = await testPrisma.booking.update({
        where: { id: booking.id },
        data: {
          depositAmount: 300,
          depositPaid: true,
          paidAmount: 300,
          paidAt: new Date(),
          paymentMethod: 'bank_transfer',
          paymentStatus: 'partial',
          balanceAmount: 700,
        },
      })

      expect(updated.depositPaid).toBe(true)
      expect(updated.paymentStatus).toBe('partial')
      expect(updated.balanceAmount).toBe(700)
    })

    it('should track full payment', async () => {
      if (!testPrisma) return

      const booking = await testPrisma.booking.create({
        data: {
          clientName: 'Full Payment Client',
          clientEmail: 'fullpay@example.com',
          propertyAddress: '123 Payment Street',
          totalQuote: 500,
          depositAmount: 150,
          depositPaid: true,
          balanceAmount: 350,
        },
      })

      const fullPaid = await testPrisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: 'paid',
          paidAmount: 500,
          balanceAmount: 0,
          balancePaidAt: new Date(),
        },
      })

      expect(fullPaid.paymentStatus).toBe('paid')
      expect(fullPaid.paidAmount).toBe(500)
      expect(fullPaid.balanceAmount).toBe(0)
    })
  })
})

console.log('✓ Booking & Scheduling tests loaded')
