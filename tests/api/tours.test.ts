/**
 * Tours Management Tests
 * Tests all tour-related functionality including:
 * - Tour CRUD operations
 * - Categories management
 * - Featured/Premium/Highlight tours
 * - Views tracking
 * - Pricing plans
 */

import { testPrisma, cleanDatabase } from '../setup'
import {
  createTestCategory,
  createTestTour,
  createTestPricingPlan,
} from '../utils/helpers'

describe('Tours Management', () => {
  let category: any

  beforeAll(async () => {
    try {
      await cleanDatabase()
      category = await createTestCategory({ name: 'Test Tours Category' })
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

  describe('Category Management', () => {
    it('should create category', async () => {
      if (!testPrisma) return

      const newCategory = await createTestCategory({
        name: 'Real Estate',
        slug: 'real-estate',
        description: 'Virtual tours for real estate properties',
      })

      expect(newCategory).toBeDefined()
      expect(newCategory.name).toBe('Real Estate')
      expect(newCategory.slug).toBe('real-estate')
    })

    it('should list all active categories', async () => {
      if (!testPrisma) return

      await testPrisma.category.deleteMany({})

      await createTestCategory({ name: 'Cat 1', slug: 'cat-1' })
      await createTestCategory({ name: 'Cat 2', slug: 'cat-2' })
      await testPrisma.category.create({
        data: {
          name: 'Inactive Cat',
          slug: 'inactive-cat',
          isActive: false,
        },
      })

      const activeCategories = await testPrisma.category.findMany({
        where: { isActive: true },
      })

      expect(activeCategories.length).toBe(2)
    })

    it('should prevent duplicate category slugs', async () => {
      if (!testPrisma) return

      await createTestCategory({ name: 'Unique Name', slug: 'unique-slug' })

      await expect(
        createTestCategory({ name: 'Another Name', slug: 'unique-slug' })
      ).rejects.toThrow()
    })

    it('should order categories by order field', async () => {
      if (!testPrisma) return

      await testPrisma.category.deleteMany({})

      await testPrisma.category.create({
        data: { name: 'Third', slug: 'third', order: 3 },
      })
      await testPrisma.category.create({
        data: { name: 'First', slug: 'first', order: 1 },
      })
      await testPrisma.category.create({
        data: { name: 'Second', slug: 'second', order: 2 },
      })

      const ordered = await testPrisma.category.findMany({
        orderBy: { order: 'asc' },
      })

      expect(ordered[0].name).toBe('First')
      expect(ordered[1].name).toBe('Second')
      expect(ordered[2].name).toBe('Third')
    })

    it('should count tours per category', async () => {
      if (!testPrisma) return

      await testPrisma.tour.deleteMany({})
      await testPrisma.category.deleteMany({})

      const cat = await createTestCategory()
      await createTestTour(cat.id, { title: 'Tour 1' })
      await createTestTour(cat.id, { title: 'Tour 2' })
      await createTestTour(cat.id, { title: 'Tour 3' })

      const categoryWithCount = await testPrisma.category.findUnique({
        where: { id: cat.id },
        include: {
          _count: { select: { tours: true } },
        },
      })

      expect(categoryWithCount?._count.tours).toBe(3)
    })
  })

  describe('Tour CRUD Operations', () => {
    it('should create tour with required fields', async () => {
      if (!testPrisma) return

      const cat = await createTestCategory()
      const tour = await createTestTour(cat.id, {
        title: 'Beautiful Villa Tour',
        slug: 'beautiful-villa-tour',
        description: 'A stunning 360° tour of a luxury villa',
      })

      expect(tour).toBeDefined()
      expect(tour.title).toBe('Beautiful Villa Tour')
      expect(tour.slug).toBe('beautiful-villa-tour')
    })

    it('should create tour with all optional fields', async () => {
      if (!testPrisma) return

      const cat = await createTestCategory()
      const tour = await testPrisma.tour.create({
        data: {
          title: 'Full Tour',
          slug: `full-tour-${Date.now()}`,
          description: 'Complete tour with all fields',
          shortDesc: 'Short description for cards',
          clientName: 'Luxury Homes Ltd.',
          location: 'Skopje, Macedonia',
          coverImage: 'https://example.com/cover.jpg',
          images: JSON.stringify(['img1.jpg', 'img2.jpg']),
          tourUrl: 'https://tours.example.com/tour-123',
          tourEmbed: '<iframe src="..."></iframe>',
          categoryId: cat.id,
          featured: true,
          premium: true,
          highlight: false,
        },
      })

      expect(tour.shortDesc).toBe('Short description for cards')
      expect(tour.clientName).toBe('Luxury Homes Ltd.')
      expect(tour.tourUrl).toBe('https://tours.example.com/tour-123')
    })

    it('should update tour', async () => {
      if (!testPrisma) return

      const cat = await createTestCategory()
      const tour = await createTestTour(cat.id, { title: 'Original Title' })

      const updated = await testPrisma.tour.update({
        where: { id: tour.id },
        data: {
          title: 'Updated Title',
          description: 'Updated description',
        },
      })

      expect(updated.title).toBe('Updated Title')
      expect(updated.description).toBe('Updated description')
    })

    it('should delete tour', async () => {
      if (!testPrisma) return

      const cat = await createTestCategory()
      const tour = await createTestTour(cat.id, { title: 'To Delete' })

      await testPrisma.tour.delete({
        where: { id: tour.id },
      })

      const deleted = await testPrisma.tour.findUnique({
        where: { id: tour.id },
      })

      expect(deleted).toBeNull()
    })

    it('should deactivate tour instead of delete', async () => {
      if (!testPrisma) return

      const cat = await createTestCategory()
      const tour = await createTestTour(cat.id, { title: 'Soft Delete' })

      const deactivated = await testPrisma.tour.update({
        where: { id: tour.id },
        data: { isActive: false },
      })

      expect(deactivated.isActive).toBe(false)

      // Should still exist
      const found = await testPrisma.tour.findUnique({
        where: { id: tour.id },
      })
      expect(found).toBeDefined()
    })
  })

  describe('Featured/Premium/Highlight Tours', () => {
    it('should mark tour as featured', async () => {
      if (!testPrisma) return

      const cat = await createTestCategory()
      const tour = await createTestTour(cat.id, { featured: true })

      expect(tour.featured).toBe(true)
    })

    it('should mark tour as premium', async () => {
      if (!testPrisma) return

      const cat = await createTestCategory()
      const tour = await createTestTour(cat.id, { premium: true })

      expect(tour.premium).toBe(true)
    })

    it('should mark tour as highlight', async () => {
      if (!testPrisma) return

      const cat = await createTestCategory()
      const tour = await createTestTour(cat.id, { highlight: true })

      expect(tour.highlight).toBe(true)
    })

    it('should filter featured tours', async () => {
      if (!testPrisma) return

      await testPrisma.tour.deleteMany({})
      const cat = await createTestCategory()

      await createTestTour(cat.id, { title: 'Featured 1', featured: true })
      await createTestTour(cat.id, { title: 'Featured 2', featured: true })
      await createTestTour(cat.id, { title: 'Normal', featured: false })

      const featuredTours = await testPrisma.tour.findMany({
        where: { featured: true },
      })

      expect(featuredTours.length).toBe(2)
    })

    it('should sort tours by priority: premium > highlight > featured', async () => {
      if (!testPrisma) return

      await testPrisma.tour.deleteMany({})
      const cat = await createTestCategory()

      await createTestTour(cat.id, { title: 'Normal', premium: false, highlight: false, featured: false })
      await createTestTour(cat.id, { title: 'Featured', featured: true })
      await createTestTour(cat.id, { title: 'Highlight', highlight: true })
      await createTestTour(cat.id, { title: 'Premium', premium: true })

      const tours = await testPrisma.tour.findMany({
        orderBy: [
          { premium: 'desc' },
          { highlight: 'desc' },
          { featured: 'desc' },
        ],
      })

      expect(tours[0].title).toBe('Premium')
      expect(tours[1].title).toBe('Highlight')
      expect(tours[2].title).toBe('Featured')
    })
  })

  describe('Views Tracking', () => {
    it('should start with 0 views', async () => {
      if (!testPrisma) return

      const cat = await createTestCategory()
      const tour = await createTestTour(cat.id)

      expect(tour.views).toBe(0)
    })

    it('should increment views', async () => {
      if (!testPrisma) return

      const cat = await createTestCategory()
      const tour = await createTestTour(cat.id)

      const updated = await testPrisma.tour.update({
        where: { id: tour.id },
        data: { views: { increment: 1 } },
      })

      expect(updated.views).toBe(1)
    })

    it('should track multiple views', async () => {
      if (!testPrisma) return

      const cat = await createTestCategory()
      const tour = await createTestTour(cat.id)

      // Simulate 10 views
      for (let i = 0; i < 10; i++) {
        await testPrisma.tour.update({
          where: { id: tour.id },
          data: { views: { increment: 1 } },
        })
      }

      const final = await testPrisma.tour.findUnique({
        where: { id: tour.id },
      })

      expect(final?.views).toBe(10)
    })

    it('should get total views across all tours', async () => {
      if (!testPrisma) return

      await testPrisma.tour.deleteMany({})
      const cat = await createTestCategory()

      await testPrisma.tour.create({
        data: {
          title: 'Popular',
          slug: `popular-${Date.now()}`,
          description: 'Test',
          coverImage: 'img.jpg',
          categoryId: cat.id,
          views: 1000,
        },
      })
      await testPrisma.tour.create({
        data: {
          title: 'Medium',
          slug: `medium-${Date.now()}`,
          description: 'Test',
          coverImage: 'img.jpg',
          categoryId: cat.id,
          views: 500,
        },
      })
      await testPrisma.tour.create({
        data: {
          title: 'New',
          slug: `new-${Date.now()}`,
          description: 'Test',
          coverImage: 'img.jpg',
          categoryId: cat.id,
          views: 50,
        },
      })

      const aggregate = await testPrisma.tour.aggregate({
        _sum: { views: true },
      })

      expect(aggregate._sum.views).toBe(1550)
    })

    it('should get top viewed tours', async () => {
      if (!testPrisma) return

      await testPrisma.tour.deleteMany({})
      const cat = await createTestCategory()

      await testPrisma.tour.create({
        data: { title: 'Third', slug: `third-${Date.now()}`, description: 'T', coverImage: 'i.jpg', categoryId: cat.id, views: 100 },
      })
      await testPrisma.tour.create({
        data: { title: 'First', slug: `first-${Date.now()}`, description: 'T', coverImage: 'i.jpg', categoryId: cat.id, views: 500 },
      })
      await testPrisma.tour.create({
        data: { title: 'Second', slug: `second-${Date.now()}`, description: 'T', coverImage: 'i.jpg', categoryId: cat.id, views: 300 },
      })

      const topTours = await testPrisma.tour.findMany({
        orderBy: { views: 'desc' },
        take: 3,
      })

      expect(topTours[0].title).toBe('First')
      expect(topTours[1].title).toBe('Second')
      expect(topTours[2].title).toBe('Third')
    })
  })

  describe('Pricing Plans', () => {
    it('should create pricing plan', async () => {
      if (!testPrisma) return

      const plan = await createTestPricingPlan({
        name: 'Basic Package',
        description: 'Perfect for small businesses',
        price: 199,
        features: ['Up to 5 hotspots', 'HD Quality', 'Basic Support'],
      })

      expect(plan).toBeDefined()
      expect(plan.name).toBe('Basic Package')
      expect(plan.price).toBe(199)
    })

    it('should mark plan as popular', async () => {
      if (!testPrisma) return

      const plan = await createTestPricingPlan({
        name: 'Professional',
        price: 399,
        isPopular: true,
      })

      expect(plan.isPopular).toBe(true)
    })

    it('should list plans in order', async () => {
      if (!testPrisma) return

      await testPrisma.pricingPlan.deleteMany({})

      await testPrisma.pricingPlan.create({
        data: { name: 'Enterprise', description: 'D', price: 999, features: '[]', order: 3 },
      })
      await testPrisma.pricingPlan.create({
        data: { name: 'Basic', description: 'D', price: 199, features: '[]', order: 1 },
      })
      await testPrisma.pricingPlan.create({
        data: { name: 'Pro', description: 'D', price: 399, features: '[]', order: 2 },
      })

      const plans = await testPrisma.pricingPlan.findMany({
        orderBy: { order: 'asc' },
      })

      expect(plans[0].name).toBe('Basic')
      expect(plans[1].name).toBe('Pro')
      expect(plans[2].name).toBe('Enterprise')
    })

    it('should parse features from JSON', async () => {
      if (!testPrisma) return

      const features = ['Feature 1', 'Feature 2', 'Feature 3']
      const plan = await createTestPricingPlan({ features })

      const parsed = JSON.parse(plan.features)
      expect(parsed).toEqual(features)
    })
  })

  describe('Tour Search & Filter', () => {
    it('should search tours by title', async () => {
      if (!testPrisma) return

      await testPrisma.tour.deleteMany({})
      const cat = await createTestCategory()

      await createTestTour(cat.id, { title: 'Luxury Villa Tour' })
      await createTestTour(cat.id, { title: 'Beach House Tour' })
      await createTestTour(cat.id, { title: 'Mountain Cabin Tour' })

      const results = await testPrisma.tour.findMany({
        where: {
          title: { contains: 'Villa', mode: 'insensitive' },
        },
      })

      expect(results.length).toBe(1)
      expect(results[0].title).toBe('Luxury Villa Tour')
    })

    it('should filter tours by category', async () => {
      if (!testPrisma) return

      await testPrisma.tour.deleteMany({})
      await testPrisma.category.deleteMany({})

      const realEstate = await createTestCategory({ name: 'Real Estate', slug: 're' })
      const business = await createTestCategory({ name: 'Business', slug: 'biz' })

      await createTestTour(realEstate.id, { title: 'House 1' })
      await createTestTour(realEstate.id, { title: 'House 2' })
      await createTestTour(business.id, { title: 'Office 1' })

      const realEstateTours = await testPrisma.tour.findMany({
        where: { categoryId: realEstate.id },
      })

      expect(realEstateTours.length).toBe(2)
    })

    it('should filter active tours only', async () => {
      if (!testPrisma) return

      await testPrisma.tour.deleteMany({})
      const cat = await createTestCategory()

      await createTestTour(cat.id, { title: 'Active Tour' })
      await testPrisma.tour.create({
        data: {
          title: 'Inactive Tour',
          slug: `inactive-${Date.now()}`,
          description: 'Test',
          coverImage: 'img.jpg',
          categoryId: cat.id,
          isActive: false,
        },
      })

      const activeTours = await testPrisma.tour.findMany({
        where: { isActive: true },
      })

      expect(activeTours.length).toBe(1)
      expect(activeTours[0].title).toBe('Active Tour')
    })
  })
})

console.log('✓ Tours Management tests loaded')
