import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET financial dashboard stats
export async function GET(request: NextRequest) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // week, month, year, all

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case 'all':
        startDate = new Date(2020, 0, 1) // Far back enough
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Get completed bookings (income)
    const completedBookings = await prisma.booking.findMany({
      where: {
        status: 'completed',
        completedAt: {
          gte: startDate,
          lte: now,
        },
      },
      select: {
        id: true,
        totalQuote: true,
        completedAt: true,
        serviceType: true,
        depositPaid: true,
      },
    })

    // Get all confirmed/scheduled/in_progress bookings (pending income)
    const pendingBookings = await prisma.booking.findMany({
      where: {
        status: { in: ['confirmed', 'scheduled', 'in_progress'] },
      },
      select: {
        id: true,
        totalQuote: true,
        depositAmount: true,
        depositPaid: true,
      },
    })

    // Get expenses
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: now,
        },
      },
      include: {
        category: true,
      },
    })

    // Calculate totals
    const totalIncome = completedBookings.reduce((sum, b) => sum + (b.totalQuote || 0), 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const netProfit = totalIncome - totalExpenses
    const pendingIncome = pendingBookings.reduce((sum, b) => sum + (b.totalQuote || 0), 0)
    const collectedDeposits = pendingBookings
      .filter(b => b.depositPaid)
      .reduce((sum, b) => sum + (b.depositAmount || 0), 0)

    // Expenses by category
    const expensesByCategory: Record<string, number> = {}
    expenses.forEach(e => {
      const categoryName = e.category.name
      expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + e.amount
    })

    // Monthly income trend (last 6 months)
    const monthlyIncome: Array<{ month: string; income: number; expenses: number }> = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const monthBookings = await prisma.booking.findMany({
        where: {
          status: 'completed',
          completedAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        select: { totalQuote: true },
      })

      const monthExpenses = await prisma.expense.findMany({
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        select: { amount: true },
      })

      monthlyIncome.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        income: monthBookings.reduce((sum, b) => sum + (b.totalQuote || 0), 0),
        expenses: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
      })
    }

    // Recent transactions (last 10)
    const recentExpenses = await prisma.expense.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { category: true },
    })

    const recentCompletedBookings = await prisma.booking.findMany({
      where: { status: 'completed' },
      take: 5,
      orderBy: { completedAt: 'desc' },
      select: {
        id: true,
        clientName: true,
        totalQuote: true,
        completedAt: true,
        serviceType: true,
      },
    })

    return NextResponse.json({
      period,
      summary: {
        totalIncome,
        totalExpenses,
        netProfit,
        profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0,
        pendingIncome,
        collectedDeposits,
        completedBookingsCount: completedBookings.length,
        avgBookingValue: completedBookings.length > 0
          ? totalIncome / completedBookings.length
          : 0,
      },
      expensesByCategory,
      monthlyIncome,
      recentTransactions: {
        expenses: recentExpenses.map(e => ({
          id: e.id,
          type: 'expense',
          description: e.description,
          amount: -e.amount,
          date: e.date,
          category: e.category.name,
        })),
        income: recentCompletedBookings.map(b => ({
          id: b.id,
          type: 'income',
          description: `${b.clientName} - ${b.serviceType || 'Booking'}`,
          amount: b.totalQuote || 0,
          date: b.completedAt,
        })),
      },
    })
  } catch (error) {
    console.error('Failed to fetch financial stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch financial stats' },
      { status: 500 }
    )
  }
}
