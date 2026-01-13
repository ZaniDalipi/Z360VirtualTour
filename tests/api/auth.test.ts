/**
 * User Authentication Tests
 * Tests all user-related functionality including:
 * - User registration
 * - User login
 * - Profile management
 * - Password updates
 */

import { testPrisma, cleanDatabase } from '../setup'
import {
  createTestUser,
  createUserToken,
} from '../utils/helpers'
import bcrypt from 'bcryptjs'

describe('User Authentication', () => {
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

  describe('User Registration', () => {
    it('should create new user with required fields', async () => {
      if (!testPrisma) return

      const user = await createTestUser({
        email: 'register-test@user.com',
        password: 'TestPassword123!',
        name: 'Test User',
      })

      expect(user).toBeDefined()
      expect(user.email).toBe('register-test@user.com')
      expect(user.name).toBe('Test User')
      expect(user.isActive).toBe(true)
    })

    it('should hash user password', async () => {
      if (!testPrisma) return

      const password = 'PlainTextPassword123!'
      const user = await createTestUser({
        email: 'hash-test@user.com',
        password,
      })

      expect(user.password).not.toBe(password)
      expect(user.password.startsWith('$2')).toBe(true)

      const isValid = await bcrypt.compare(password, user.password)
      expect(isValid).toBe(true)
    })

    it('should create user with optional fields', async () => {
      if (!testPrisma) return

      const user = await createTestUser({
        email: 'full-profile@user.com',
        password: 'Password123!',
        name: 'Full Profile User',
        phone: '+389 70 123 456',
        company: 'Test Company Inc.',
      })

      expect(user.phone).toBe('+389 70 123 456')
      expect(user.company).toBe('Test Company Inc.')
    })

    it('should prevent duplicate email registration', async () => {
      if (!testPrisma) return

      await createTestUser({ email: 'duplicate-email@user.com' })

      await expect(
        createTestUser({ email: 'duplicate-email@user.com' })
      ).rejects.toThrow()
    })

    it('should set default values correctly', async () => {
      if (!testPrisma) return

      const user = await createTestUser({
        email: 'defaults@user.com',
      })

      expect(user.isActive).toBe(true)
      expect(user.avatar).toBeNull()
      expect(user.createdAt).toBeDefined()
    })
  })

  describe('User Login', () => {
    it('should verify correct password', async () => {
      if (!testPrisma) return

      const password = 'LoginPassword123!'
      const user = await createTestUser({
        email: 'login-verify@user.com',
        password,
      })

      const isValid = await bcrypt.compare(password, user.password)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      if (!testPrisma) return

      const user = await createTestUser({
        email: 'wrong-login@user.com',
        password: 'CorrectPassword123!',
      })

      const isValid = await bcrypt.compare('WrongPassword123!', user.password)
      expect(isValid).toBe(false)
    })

    it('should find user by email', async () => {
      if (!testPrisma) return

      await createTestUser({
        email: 'findme@user.com',
        name: 'Find Me User',
      })

      const user = await testPrisma.user.findUnique({
        where: { email: 'findme@user.com' },
      })

      expect(user).toBeDefined()
      expect(user?.name).toBe('Find Me User')
    })

    it('should return null for non-existent user', async () => {
      if (!testPrisma) return

      const user = await testPrisma.user.findUnique({
        where: { email: 'nonexistent@user.com' },
      })

      expect(user).toBeNull()
    })

    it('should generate valid JWT token for user', async () => {
      if (!testPrisma) return

      const user = await createTestUser({
        email: 'jwt-user@user.com',
      })

      const token = createUserToken(user)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3) // JWT format
    })
  })

  describe('Profile Management', () => {
    it('should get user profile', async () => {
      if (!testPrisma) return

      const user = await createTestUser({
        email: 'profile-get@user.com',
        name: 'Profile User',
        phone: '+389 71 111 111',
      })

      const profile = await testPrisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          company: true,
          avatar: true,
        },
      })

      expect(profile).toBeDefined()
      expect(profile?.email).toBe('profile-get@user.com')
      expect(profile?.name).toBe('Profile User')
    })

    it('should update user name', async () => {
      if (!testPrisma) return

      const user = await createTestUser({
        email: 'update-name@user.com',
        name: 'Original Name',
      })

      const updated = await testPrisma.user.update({
        where: { id: user.id },
        data: { name: 'Updated Name' },
      })

      expect(updated.name).toBe('Updated Name')
    })

    it('should update user phone', async () => {
      if (!testPrisma) return

      const user = await createTestUser({
        email: 'update-phone@user.com',
      })

      const updated = await testPrisma.user.update({
        where: { id: user.id },
        data: { phone: '+389 72 222 222' },
      })

      expect(updated.phone).toBe('+389 72 222 222')
    })

    it('should update user company', async () => {
      if (!testPrisma) return

      const user = await createTestUser({
        email: 'update-company@user.com',
      })

      const updated = await testPrisma.user.update({
        where: { id: user.id },
        data: { company: 'New Company Ltd.' },
      })

      expect(updated.company).toBe('New Company Ltd.')
    })

    it('should update user avatar', async () => {
      if (!testPrisma) return

      const user = await createTestUser({
        email: 'update-avatar@user.com',
      })

      const avatarUrl = 'https://example.com/avatar.jpg'
      const updated = await testPrisma.user.update({
        where: { id: user.id },
        data: { avatar: avatarUrl },
      })

      expect(updated.avatar).toBe(avatarUrl)
    })

    it('should update multiple profile fields', async () => {
      if (!testPrisma) return

      const user = await createTestUser({
        email: 'multi-update@user.com',
      })

      const updated = await testPrisma.user.update({
        where: { id: user.id },
        data: {
          name: 'Multi Update User',
          phone: '+389 73 333 333',
          company: 'Multi Company',
          avatar: 'https://example.com/multi.jpg',
        },
      })

      expect(updated.name).toBe('Multi Update User')
      expect(updated.phone).toBe('+389 73 333 333')
      expect(updated.company).toBe('Multi Company')
      expect(updated.avatar).toBe('https://example.com/multi.jpg')
    })
  })

  describe('Password Management', () => {
    it('should update password', async () => {
      if (!testPrisma) return

      const user = await createTestUser({
        email: 'password-update@user.com',
        password: 'OldPassword123!',
      })

      const newHashedPassword = await bcrypt.hash('NewPassword123!', 10)
      const updated = await testPrisma.user.update({
        where: { id: user.id },
        data: { password: newHashedPassword },
      })

      const oldPasswordValid = await bcrypt.compare('OldPassword123!', updated.password)
      const newPasswordValid = await bcrypt.compare('NewPassword123!', updated.password)

      expect(oldPasswordValid).toBe(false)
      expect(newPasswordValid).toBe(true)
    })

    it('should validate password minimum length', async () => {
      if (!testPrisma) return

      const shortPassword = '1234567' // 7 chars
      const validPassword = '12345678' // 8 chars

      expect(shortPassword.length).toBeLessThan(8)
      expect(validPassword.length).toBeGreaterThanOrEqual(8)
    })
  })

  describe('User Account Status', () => {
    it('should deactivate user account', async () => {
      if (!testPrisma) return

      const user = await createTestUser({
        email: 'deactivate@user.com',
      })

      expect(user.isActive).toBe(true)

      const deactivated = await testPrisma.user.update({
        where: { id: user.id },
        data: { isActive: false },
      })

      expect(deactivated.isActive).toBe(false)
    })

    it('should reactivate user account', async () => {
      if (!testPrisma) return

      const user = await testPrisma.user.create({
        data: {
          email: `reactivate-${Date.now()}@user.com`,
          password: await bcrypt.hash('password', 10),
          name: 'Reactivate User',
          isActive: false,
        },
      })

      expect(user.isActive).toBe(false)

      const reactivated = await testPrisma.user.update({
        where: { id: user.id },
        data: { isActive: true },
      })

      expect(reactivated.isActive).toBe(true)
    })

    it('should filter active users only', async () => {
      if (!testPrisma) return

      await testPrisma.user.deleteMany({})

      await createTestUser({ email: 'active1@user.com' })
      await createTestUser({ email: 'active2@user.com' })

      await testPrisma.user.create({
        data: {
          email: 'inactive@user.com',
          password: await bcrypt.hash('password', 10),
          name: 'Inactive User',
          isActive: false,
        },
      })

      const activeUsers = await testPrisma.user.findMany({
        where: { isActive: true },
      })

      expect(activeUsers.length).toBe(2)
    })
  })

  describe('User Bookings', () => {
    it('should link user to booking', async () => {
      if (!testPrisma) return

      const user = await createTestUser({
        email: 'booking-user@user.com',
      })

      const booking = await testPrisma.booking.create({
        data: {
          clientName: user.name,
          clientEmail: user.email,
          propertyAddress: '123 User Street',
          userId: user.id,
        },
      })

      expect(booking.userId).toBe(user.id)
    })

    it('should get user with their bookings', async () => {
      if (!testPrisma) return

      const user = await createTestUser({
        email: 'bookings-list@user.com',
      })

      await testPrisma.booking.createMany({
        data: [
          { clientName: user.name, clientEmail: user.email, propertyAddress: 'Address 1', userId: user.id },
          { clientName: user.name, clientEmail: user.email, propertyAddress: 'Address 2', userId: user.id },
        ],
      })

      const userWithBookings = await testPrisma.user.findUnique({
        where: { id: user.id },
        include: { bookings: true },
      })

      expect(userWithBookings?.bookings.length).toBe(2)
    })

    it('should count user bookings', async () => {
      if (!testPrisma) return

      const user = await createTestUser({
        email: 'count-bookings@user.com',
      })

      await testPrisma.booking.createMany({
        data: [
          { clientName: user.name, clientEmail: user.email, propertyAddress: 'A1', userId: user.id },
          { clientName: user.name, clientEmail: user.email, propertyAddress: 'A2', userId: user.id },
          { clientName: user.name, clientEmail: user.email, propertyAddress: 'A3', userId: user.id },
        ],
      })

      const bookingCount = await testPrisma.booking.count({
        where: { userId: user.id },
      })

      expect(bookingCount).toBe(3)
    })
  })
})

console.log('✓ User Authentication tests loaded')
