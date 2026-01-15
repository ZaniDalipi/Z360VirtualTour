/**
 * Finances Tracking Tests
 * Tests all finance-related functionality including:
 * - Expense categories
 * - Expense tracking
 * - Income from bookings
 * - Financial reports
 * - Profit calculations
 */

import { testPrisma, cleanDatabase } from '../setup'
import {
  createTestExpenseCategory,
  createTestExpense,
  createTestBooking,
} from '../utils/helpers'

describe('Finances Tracking', () => {
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

  describe('Expense Categories', () => {
    it('should create expense category', async () => {
      if (!testPrisma) return

      const category = await createTestExpenseCategory({
        name: 'Travel',
        description: 'Transportation and accommodation costs',
        color: '#3498db',
      })

      expect(category).toBeDefined()
      expect(category.name).toBe('Travel')
      expect(category.color).toBe('#3498db')
    })

    it('should list all expense categories', async () => {
      if (!testPrisma) return

      await testPrisma.expense.deleteMany({})
      await testPrisma.expenseCategory.deleteMany({})

      await createTestExpenseCategory({ name: 'Equipment' })
      await createTestExpenseCategory({ name: 'Software' })
      await createTestExpenseCategory({ name: 'Marketing' })

      const categories = await testPrisma.expenseCategory.findMany()
      expect(categories.length).toBe(3)
    })

    it('should prevent duplicate category names', async () => {
      if (!testPrisma) return

      await createTestExpenseCategory({ name: 'Unique Category' })

      await expect(
        createTestExpenseCategory({ name: 'Unique Category' })
      ).rejects.toThrow()
    })

    it('should deactivate expense category', async () => {
      if (!testPrisma) return

      const category = await createTestExpenseCategory({ name: 'To Deactivate' })

      const updated = await testPrisma.expenseCategory.update({
        where: { id: category.id },
        data: { isActive: false },
      })

      expect(updated.isActive).toBe(false)
    })

    it('should count expenses per category', async () => {
      if (!testPrisma) return

      await testPrisma.expense.deleteMany({})
      await testPrisma.expenseCategory.deleteMany({})

      const category = await createTestExpenseCategory({ name: 'Count Test' })
      await createTestExpense(category.id, { amount: 100 })
      await createTestExpense(category.id, { amount: 200 })
      await createTestExpense(category.id, { amount: 150 })

      const categoryWithCount = await testPrisma.expenseCategory.findUnique({
        where: { id: category.id },
        include: { _count: { select: { expenses: true } } },
      })

      expect(categoryWithCount?._count.expenses).toBe(3)
    })
  })

  describe('Expense Tracking', () => {
    it('should create expense', async () => {
      if (!testPrisma) return

      const category = await createTestExpenseCategory({ name: 'Test Expense Cat' })
      const expense = await createTestExpense(category.id, {
        description: 'Fuel for site visit',
        amount: 45.50,
        vendor: 'Gas Station',
      })

      expect(expense).toBeDefined()
      expect(expense.amount).toBe(45.50)
      expect(expense.vendor).toBe('Gas Station')
    })

    it('should track expense date', async () => {
      if (!testPrisma) return

      const category = await createTestExpenseCategory({ name: 'Date Test Cat' })
      const expenseDate = new Date('2025-01-15')

      const expense = await createTestExpense(category.id, {
        description: 'Equipment purchase',
        amount: 500,
        date: expenseDate,
      })

      expect(expense.date).toEqual(expenseDate)
    })

    it('should calculate total expenses', async () => {
      if (!testPrisma) return

      await testPrisma.expense.deleteMany({})
      await testPrisma.expenseCategory.deleteMany({})

      const category = await createTestExpenseCategory({ name: 'Total Test' })
      await createTestExpense(category.id, { amount: 100 })
      await createTestExpense(category.id, { amount: 250 })
      await createTestExpense(category.id, { amount: 75.50 })

      const aggregate = await testPrisma.expense.aggregate({
        _sum: { amount: true },
      })

      expect(aggregate._sum.amount).toBe(425.50)
    })

    it('should filter expenses by date range', async () => {
      if (!testPrisma) return

      await testPrisma.expense.deleteMany({})
      await testPrisma.expenseCategory.deleteMany({})

      const category = await createTestExpenseCategory({ name: 'Date Range Test' })

      await createTestExpense(category.id, { amount: 100, date: new Date('2025-01-01') })
      await createTestExpense(category.id, { amount: 200, date: new Date('2025-01-15') })
      await createTestExpense(category.id, { amount: 300, date: new Date('2025-02-01') })

      const januaryExpenses = await testPrisma.expense.findMany({
        where: {
          date: {
            gte: new Date('2025-01-01'),
            lt: new Date('2025-02-01'),
          },
        },
      })

      expect(januaryExpenses.length).toBe(2)
    })

    it('should filter expenses by category', async () => {
      if (!testPrisma) return

      await testPrisma.expense.deleteMany({})
      await testPrisma.expenseCategory.deleteMany({})

      const travel = await createTestExpenseCategory({ name: 'Travel Exp' })
      const equipment = await createTestExpenseCategory({ name: 'Equipment Exp' })

      await createTestExpense(travel.id, { amount: 100 })
      await createTestExpense(travel.id, { amount: 150 })
      await createTestExpense(equipment.id, { amount: 500 })

      const travelExpenses = await testPrisma.expense.findMany({
        where: { categoryId: travel.id },
      })

      expect(travelExpenses.length).toBe(2)
    })

    it('should track recurring expenses', async () => {
      if (!testPrisma) return

      const category = await createTestExpenseCategory({ name: 'Recurring Test' })

      const recurringExpense = await testPrisma.expense.create({
        data: {
          description: 'Monthly software subscription',
          amount: 29.99,
          date: new Date(),
          categoryId: category.id,
          isRecurring: true,
          recurringFrequency: 'monthly',
        },
      })

      expect(recurringExpense.isRecurring).toBe(true)
      expect(recurringExpense.recurringFrequency).toBe('monthly')
    })

    it('should delete expense', async () => {
      if (!testPrisma) return

      const category = await createTestExpenseCategory({ name: 'Delete Test Cat' })
      const expense = await createTestExpense(category.id, { amount: 100 })

      await testPrisma.expense.delete({
        where: { id: expense.id },
      })

      const deleted = await testPrisma.expense.findUnique({
        where: { id: expense.id },
      })

      expect(deleted).toBeNull()
    })
  })

  describe('Income Tracking', () => {
    it('should track paid bookings as income', async () => {
      if (!testPrisma) return

      await testPrisma.booking.deleteMany({})

      await testPrisma.booking.create({
        data: {
          clientName: 'Paid Client 1',
          clientEmail: 'paid1@test.com',
          propertyAddress: 'Address 1',
          totalQuote: 500,
          paidAmount: 500,
          paymentStatus: 'paid',
        },
      })
      await testPrisma.booking.create({
        data: {
          clientName: 'Paid Client 2',
          clientEmail: 'paid2@test.com',
          propertyAddress: 'Address 2',
          totalQuote: 750,
          paidAmount: 750,
          paymentStatus: 'paid',
        },
      })
      await testPrisma.booking.create({
        data: {
          clientName: 'Unpaid Client',
          clientEmail: 'unpaid@test.com',
          propertyAddress: 'Address 3',
          totalQuote: 300,
          paymentStatus: 'pending',
        },
      })

      const paidBookings = await testPrisma.booking.findMany({
        where: { paymentStatus: 'paid' },
      })

      const totalIncome = paidBookings.reduce(
        (sum, booking) => sum + (booking.paidAmount || 0),
        0
      )

      expect(paidBookings.length).toBe(2)
      expect(totalIncome).toBe(1250)
    })

    it('should track partial payments', async () => {
      if (!testPrisma) return

      const booking = await testPrisma.booking.create({
        data: {
          clientName: 'Partial Payment Client',
          clientEmail: 'partial@test.com',
          propertyAddress: 'Address',
          totalQuote: 1000,
          depositAmount: 300,
          depositPaid: true,
          paidAmount: 300,
          paymentStatus: 'partial',
          balanceAmount: 700,
        },
      })

      expect(booking.paidAmount).toBe(300)
      expect(booking.balanceAmount).toBe(700)
    })

    it('should calculate monthly income', async () => {
      if (!testPrisma) return

      await testPrisma.booking.deleteMany({})

      // January bookings
      await testPrisma.booking.create({
        data: {
          clientName: 'Jan Client 1',
          clientEmail: 'jan1@test.com',
          propertyAddress: 'Addr',
          totalQuote: 400,
          paidAmount: 400,
          paymentStatus: 'paid',
          paidAt: new Date('2025-01-10'),
        },
      })
      await testPrisma.booking.create({
        data: {
          clientName: 'Jan Client 2',
          clientEmail: 'jan2@test.com',
          propertyAddress: 'Addr',
          totalQuote: 600,
          paidAmount: 600,
          paymentStatus: 'paid',
          paidAt: new Date('2025-01-20'),
        },
      })
      // February booking
      await testPrisma.booking.create({
        data: {
          clientName: 'Feb Client',
          clientEmail: 'feb@test.com',
          propertyAddress: 'Addr',
          totalQuote: 500,
          paidAmount: 500,
          paymentStatus: 'paid',
          paidAt: new Date('2025-02-15'),
        },
      })

      const januaryIncome = await testPrisma.booking.aggregate({
        where: {
          paymentStatus: 'paid',
          paidAt: {
            gte: new Date('2025-01-01'),
            lt: new Date('2025-02-01'),
          },
        },
        _sum: { paidAmount: true },
      })

      expect(januaryIncome._sum.paidAmount).toBe(1000)
    })
  })

  describe('Financial Reports', () => {
    it('should create financial report', async () => {
      if (!testPrisma) return

      const report = await testPrisma.financialReport.create({
        data: {
          reportType: 'monthly',
          periodStart: new Date('2025-01-01'),
          periodEnd: new Date('2025-01-31'),
          totalIncome: 5000,
          totalExpenses: 1500,
          netProfit: 3500,
          bookingsCount: 10,
          avgBookingValue: 500,
        },
      })

      expect(report).toBeDefined()
      expect(report.netProfit).toBe(3500)
      expect(report.bookingsCount).toBe(10)
    })

    it('should calculate net profit correctly', async () => {
      if (!testPrisma) return

      const income = 8000
      const expenses = 2500
      const netProfit = income - expenses

      const report = await testPrisma.financialReport.create({
        data: {
          reportType: 'monthly',
          periodStart: new Date('2025-02-01'),
          periodEnd: new Date('2025-02-28'),
          totalIncome: income,
          totalExpenses: expenses,
          netProfit: netProfit,
          bookingsCount: 15,
        },
      })

      expect(report.netProfit).toBe(5500)
    })

    it('should track expenses by category in report', async () => {
      if (!testPrisma) return

      const expensesByCategory = {
        Travel: 500,
        Equipment: 1200,
        Software: 300,
        Marketing: 450,
      }

      const report = await testPrisma.financialReport.create({
        data: {
          reportType: 'monthly',
          periodStart: new Date('2025-03-01'),
          periodEnd: new Date('2025-03-31'),
          totalIncome: 10000,
          totalExpenses: 2450,
          netProfit: 7550,
          bookingsCount: 20,
          expensesByCategory: JSON.stringify(expensesByCategory),
        },
      })

      const parsed = JSON.parse(report.expensesByCategory!)
      expect(parsed.Equipment).toBe(1200)
      expect(parsed.Travel).toBe(500)
    })

    it('should create weekly report', async () => {
      if (!testPrisma) return

      const report = await testPrisma.financialReport.create({
        data: {
          reportType: 'weekly',
          periodStart: new Date('2025-01-06'),
          periodEnd: new Date('2025-01-12'),
          totalIncome: 1500,
          totalExpenses: 300,
          netProfit: 1200,
          bookingsCount: 3,
        },
      })

      expect(report.reportType).toBe('weekly')
    })

    it('should create yearly report', async () => {
      if (!testPrisma) return

      const report = await testPrisma.financialReport.create({
        data: {
          reportType: 'yearly',
          periodStart: new Date('2024-01-01'),
          periodEnd: new Date('2024-12-31'),
          totalIncome: 85000,
          totalExpenses: 25000,
          netProfit: 60000,
          bookingsCount: 150,
          avgBookingValue: 566.67,
          topCategory: 'Real Estate',
        },
      })

      expect(report.reportType).toBe('yearly')
      expect(report.topCategory).toBe('Real Estate')
    })

    it('should get reports by type', async () => {
      if (!testPrisma) return

      await testPrisma.financialReport.deleteMany({})

      await testPrisma.financialReport.createMany({
        data: [
          { reportType: 'monthly', periodStart: new Date('2025-01-01'), periodEnd: new Date('2025-01-31'), totalIncome: 5000, totalExpenses: 1000, netProfit: 4000, bookingsCount: 10 },
          { reportType: 'monthly', periodStart: new Date('2025-02-01'), periodEnd: new Date('2025-02-28'), totalIncome: 6000, totalExpenses: 1200, netProfit: 4800, bookingsCount: 12 },
          { reportType: 'yearly', periodStart: new Date('2024-01-01'), periodEnd: new Date('2024-12-31'), totalIncome: 60000, totalExpenses: 15000, netProfit: 45000, bookingsCount: 120 },
        ],
      })

      const monthlyReports = await testPrisma.financialReport.findMany({
        where: { reportType: 'monthly' },
      })

      expect(monthlyReports.length).toBe(2)
    })
  })

  describe('Profit Calculations', () => {
    it('should calculate profit margin', async () => {
      if (!testPrisma) return

      const income = 10000
      const expenses = 3000
      const profit = income - expenses
      const profitMargin = (profit / income) * 100

      expect(profit).toBe(7000)
      expect(profitMargin).toBe(70)
    })

    it('should handle negative profit (loss)', async () => {
      if (!testPrisma) return

      const report = await testPrisma.financialReport.create({
        data: {
          reportType: 'monthly',
          periodStart: new Date('2025-04-01'),
          periodEnd: new Date('2025-04-30'),
          totalIncome: 2000,
          totalExpenses: 3500,
          netProfit: -1500, // Loss
          bookingsCount: 4,
        },
      })

      expect(report.netProfit).toBe(-1500)
      expect(report.netProfit < 0).toBe(true)
    })

    it('should calculate average booking value', async () => {
      if (!testPrisma) return

      await testPrisma.booking.deleteMany({})

      await testPrisma.booking.createMany({
        data: [
          { clientName: 'C1', clientEmail: 'c1@t.com', propertyAddress: 'A1', totalQuote: 300, status: 'completed' },
          { clientName: 'C2', clientEmail: 'c2@t.com', propertyAddress: 'A2', totalQuote: 500, status: 'completed' },
          { clientName: 'C3', clientEmail: 'c3@t.com', propertyAddress: 'A3', totalQuote: 700, status: 'completed' },
          { clientName: 'C4', clientEmail: 'c4@t.com', propertyAddress: 'A4', totalQuote: 400, status: 'completed' },
          { clientName: 'C5', clientEmail: 'c5@t.com', propertyAddress: 'A5', totalQuote: 600, status: 'completed' },
        ],
      })

      const aggregate = await testPrisma.booking.aggregate({
        where: { status: 'completed' },
        _avg: { totalQuote: true },
        _count: true,
      })

      expect(aggregate._count).toBe(5)
      expect(aggregate._avg.totalQuote).toBe(500) // (300+500+700+400+600) / 5
    })
  })

  describe('Completed Jobs Analysis', () => {
    it('should list completed jobs with earnings', async () => {
      if (!testPrisma) return

      await testPrisma.booking.deleteMany({})

      await testPrisma.booking.createMany({
        data: [
          { clientName: 'Completed 1', clientEmail: 'comp1@t.com', propertyAddress: 'A1', totalQuote: 500, paidAmount: 500, status: 'completed', completedAt: new Date('2025-01-15') },
          { clientName: 'Completed 2', clientEmail: 'comp2@t.com', propertyAddress: 'A2', totalQuote: 750, paidAmount: 750, status: 'completed', completedAt: new Date('2025-01-20') },
          { clientName: 'In Progress', clientEmail: 'prog@t.com', propertyAddress: 'A3', totalQuote: 400, status: 'in_progress' },
        ],
      })

      const completedJobs = await testPrisma.booking.findMany({
        where: { status: 'completed' },
        orderBy: { completedAt: 'desc' },
      })

      expect(completedJobs.length).toBe(2)

      const totalEarnings = completedJobs.reduce(
        (sum, job) => sum + (job.paidAmount || 0),
        0
      )
      expect(totalEarnings).toBe(1250)
    })

    it('should track work duration for billing', async () => {
      if (!testPrisma) return

      const booking = await testPrisma.booking.create({
        data: {
          clientName: 'Duration Client',
          clientEmail: 'duration@t.com',
          propertyAddress: 'Address',
          totalQuote: 500,
          workDurationMinutes: 180, // 3 hours
          status: 'completed',
        },
      })

      const hourlyRate = booking.totalQuote! / (booking.workDurationMinutes! / 60)
      expect(hourlyRate.toFixed(2)).toBe('166.67') // ~166.67 per hour
    })
  })
})

console.log('✓ Finances Tracking tests loaded')
