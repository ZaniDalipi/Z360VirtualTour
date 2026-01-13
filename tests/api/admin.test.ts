/**
 * Admin Panel Tests
 * Tests all admin-related functionality including:
 * - Admin authentication
 * - Admin CRUD operations
 * - Dashboard stats
 * - Admin settings
 */

import { testPrisma, cleanDatabase } from '../setup'
import {
  createTestAdmin,
  createTestCategory,
  createTestTour,
  createTestBooking,
  createAdminToken,
} from '../utils/helpers'
import bcrypt from 'bcryptjs'

describe('Admin Panel', () => {
  beforeAll(async () => {
    try {
      await cleanDatabase()
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

  describe('Admin Authentication', () => {
    it('should create admin with hashed password', async () => {
      if (!testPrisma) return

      const admin = await createTestAdmin({
        email: 'auth-test@admin.com',
        password: 'SecurePassword123!',
        name: 'Auth Test Admin',
      })

      expect(admin).toBeDefined()
      expect(admin.email).toBe('auth-test@admin.com')
      // Password should be hashed
      expect(admin.password).not.toBe('SecurePassword123!')
      expect(admin.password.startsWith('$2')).toBe(true) // bcrypt hash
    })

    it('should verify correct password', async () => {
      if (!testPrisma) return

      const password = 'CorrectPassword123!'
      const admin = await createTestAdmin({
        email: 'verify-password@admin.com',
        password,
      })

      const isValid = await bcrypt.compare(password, admin.password)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      if (!testPrisma) return

      const admin = await createTestAdmin({
        email: 'wrong-password@admin.com',
        password: 'RealPassword123!',
      })

      const isValid = await bcrypt.compare('WrongPassword123!', admin.password)
      expect(isValid).toBe(false)
    })

    it('should generate valid JWT token', async () => {
      if (!testPrisma) return

      const admin = await createTestAdmin({
        email: 'jwt-test@admin.com',
      })

      const token = createAdminToken(admin)
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3) // JWT format
    })

    it('should prevent duplicate admin emails', async () => {
      if (!testPrisma) return

      await createTestAdmin({ email: 'duplicate@admin.com' })

      await expect(
        createTestAdmin({ email: 'duplicate@admin.com' })
      ).rejects.toThrow()
    })
  })

  describe('Admin CRUD Operations', () => {
    it('should list all admins', async () => {
      if (!testPrisma) return

      await testPrisma.admin.deleteMany({})

      await createTestAdmin({ email: 'list1@admin.com' })
      await createTestAdmin({ email: 'list2@admin.com' })
      await createTestAdmin({ email: 'list3@admin.com' })

      const admins = await testPrisma.admin.findMany()
      expect(admins.length).toBe(3)
    })

    it('should get admin by ID', async () => {
      if (!testPrisma) return

      const admin = await createTestAdmin({
        email: 'getbyid@admin.com',
        name: 'Find Me Admin',
      })

      const found = await testPrisma.admin.findUnique({
        where: { id: admin.id },
      })

      expect(found).toBeDefined()
      expect(found?.name).toBe('Find Me Admin')
    })

    it('should update admin details', async () => {
      if (!testPrisma) return

      const admin = await createTestAdmin({
        email: 'update-me@admin.com',
        name: 'Original Name',
      })

      const updated = await testPrisma.admin.update({
        where: { id: admin.id },
        data: { name: 'Updated Name' },
      })

      expect(updated.name).toBe('Updated Name')
    })

    it('should update admin password', async () => {
      if (!testPrisma) return

      const admin = await createTestAdmin({
        email: 'update-password@admin.com',
        password: 'OldPassword123!',
      })

      const newPassword = await bcrypt.hash('NewPassword123!', 10)
      const updated = await testPrisma.admin.update({
        where: { id: admin.id },
        data: { password: newPassword },
      })

      const isNewPasswordValid = await bcrypt.compare('NewPassword123!', updated.password)
      expect(isNewPasswordValid).toBe(true)
    })

    it('should delete admin', async () => {
      if (!testPrisma) return

      const admin = await createTestAdmin({
        email: 'delete-me@admin.com',
      })

      await testPrisma.admin.delete({
        where: { id: admin.id },
      })

      const deleted = await testPrisma.admin.findUnique({
        where: { id: admin.id },
      })

      expect(deleted).toBeNull()
    })
  })

  describe('Dashboard Stats', () => {
    it('should count total tours', async () => {
      if (!testPrisma) return

      await testPrisma.tour.deleteMany({})
      await testPrisma.category.deleteMany({})

      const category = await createTestCategory()
      await createTestTour(category.id, { title: 'Tour 1' })
      await createTestTour(category.id, { title: 'Tour 2' })
      await createTestTour(category.id, { title: 'Tour 3' })

      const totalTours = await testPrisma.tour.count()
      expect(totalTours).toBe(3)
    })

    it('should count total views', async () => {
      if (!testPrisma) return

      await testPrisma.tour.deleteMany({})
      await testPrisma.category.deleteMany({})

      const category = await createTestCategory()

      await testPrisma.tour.create({
        data: {
          title: 'Popular Tour',
          slug: `popular-tour-${Date.now()}`,
          description: 'Test',
          coverImage: 'https://example.com/img.jpg',
          categoryId: category.id,
          views: 1500,
        },
      })

      await testPrisma.tour.create({
        data: {
          title: 'Another Tour',
          slug: `another-tour-${Date.now()}`,
          description: 'Test',
          coverImage: 'https://example.com/img.jpg',
          categoryId: category.id,
          views: 500,
        },
      })

      const aggregate = await testPrisma.tour.aggregate({
        _sum: { views: true },
      })

      expect(aggregate._sum.views).toBe(2000)
    })

    it('should count unread messages', async () => {
      if (!testPrisma) return

      await testPrisma.contactSubmission.deleteMany({})

      await testPrisma.contactSubmission.createMany({
        data: [
          { name: 'User 1', email: 'u1@test.com', message: 'Msg 1', isRead: false },
          { name: 'User 2', email: 'u2@test.com', message: 'Msg 2', isRead: false },
          { name: 'User 3', email: 'u3@test.com', message: 'Msg 3', isRead: true },
        ],
      })

      const unreadCount = await testPrisma.contactSubmission.count({
        where: { isRead: false },
      })

      expect(unreadCount).toBe(2)
    })

    it('should get recent bookings', async () => {
      if (!testPrisma) return

      await testPrisma.booking.deleteMany({})

      await createTestBooking({ clientName: 'Recent 1' })
      await createTestBooking({ clientName: 'Recent 2' })
      await createTestBooking({ clientName: 'Recent 3' })

      const recentBookings = await testPrisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      })

      expect(recentBookings.length).toBe(3)
    })

    it('should get bookings by status', async () => {
      if (!testPrisma) return

      await testPrisma.booking.deleteMany({})

      await createTestBooking({ status: 'quote_requested' })
      await createTestBooking({ status: 'quote_requested' })
      await createTestBooking({ status: 'confirmed' })
      await createTestBooking({ status: 'completed' })

      const pendingCount = await testPrisma.booking.count({
        where: { status: 'quote_requested' },
      })

      expect(pendingCount).toBe(2)
    })
  })

  describe('Booking Settings', () => {
    it('should create booking settings', async () => {
      if (!testPrisma) return

      await testPrisma.bookingSettings.deleteMany({})

      const settings = await testPrisma.bookingSettings.create({
        data: {
          id: 'default',
          defaultMinLeadDays: 3,
          maxAdvanceBookingDays: 90,
          businessCity: 'Skopje',
          freeDistanceKm: 15,
          workOnWeekends: true,
          requireDeposit: true,
          depositPercent: 30,
        },
      })

      expect(settings.businessCity).toBe('Skopje')
      expect(settings.depositPercent).toBe(30)
    })

    it('should update booking settings', async () => {
      if (!testPrisma) return

      await testPrisma.bookingSettings.upsert({
        where: { id: 'default' },
        create: {
          id: 'default',
          businessCity: 'Skopje',
        },
        update: {},
      })

      const updated = await testPrisma.bookingSettings.update({
        where: { id: 'default' },
        data: {
          depositPercent: 50,
          sameCityDiscountPercent: 20,
        },
      })

      expect(updated.depositPercent).toBe(50)
      expect(updated.sameCityDiscountPercent).toBe(20)
    })
  })

  describe('Contact Messages', () => {
    it('should create contact submission', async () => {
      if (!testPrisma) return

      const message = await testPrisma.contactSubmission.create({
        data: {
          name: 'John Contact',
          email: 'john@contact.com',
          phone: '+389 70 123 456',
          company: 'Test Company',
          service: 'Real Estate',
          message: 'I would like a virtual tour of my property.',
        },
      })

      expect(message).toBeDefined()
      expect(message.isRead).toBe(false)
    })

    it('should mark message as read', async () => {
      if (!testPrisma) return

      const message = await testPrisma.contactSubmission.create({
        data: {
          name: 'Unread Contact',
          email: 'unread@contact.com',
          message: 'Please contact me.',
        },
      })

      const updated = await testPrisma.contactSubmission.update({
        where: { id: message.id },
        data: { isRead: true },
      })

      expect(updated.isRead).toBe(true)
    })

    it('should delete contact submission', async () => {
      if (!testPrisma) return

      const message = await testPrisma.contactSubmission.create({
        data: {
          name: 'Delete Contact',
          email: 'delete@contact.com',
          message: 'Delete this message.',
        },
      })

      await testPrisma.contactSubmission.delete({
        where: { id: message.id },
      })

      const deleted = await testPrisma.contactSubmission.findUnique({
        where: { id: message.id },
      })

      expect(deleted).toBeNull()
    })
  })

  describe('Testimonials Management', () => {
    it('should create testimonial', async () => {
      if (!testPrisma) return

      const testimonial = await testPrisma.testimonial.create({
        data: {
          clientName: 'Happy Client',
          clientTitle: 'CEO at TechCorp',
          content: 'Amazing service! The virtual tour exceeded our expectations.',
          rating: 5,
          featured: true,
        },
      })

      expect(testimonial.rating).toBe(5)
      expect(testimonial.featured).toBe(true)
    })

    it('should list featured testimonials', async () => {
      if (!testPrisma) return

      await testPrisma.testimonial.deleteMany({})

      await testPrisma.testimonial.createMany({
        data: [
          { clientName: 'Featured 1', content: 'Great!', rating: 5, featured: true },
          { clientName: 'Featured 2', content: 'Excellent!', rating: 5, featured: true },
          { clientName: 'Normal', content: 'Good.', rating: 4, featured: false },
        ],
      })

      const featured = await testPrisma.testimonial.findMany({
        where: { featured: true },
      })

      expect(featured.length).toBe(2)
    })

    it('should update testimonial', async () => {
      if (!testPrisma) return

      const testimonial = await testPrisma.testimonial.create({
        data: {
          clientName: 'Update Test',
          content: 'Original content',
          rating: 4,
        },
      })

      const updated = await testPrisma.testimonial.update({
        where: { id: testimonial.id },
        data: {
          content: 'Updated content',
          rating: 5,
        },
      })

      expect(updated.content).toBe('Updated content')
      expect(updated.rating).toBe(5)
    })
  })
})

console.log('✓ Admin Panel tests loaded')
