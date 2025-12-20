import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET single expense
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { category: true },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Failed to fetch expense:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
      { status: 500 }
    )
  }
}

// PUT update expense
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await request.json()

    const updateData: Record<string, unknown> = {}

    if (data.description !== undefined) updateData.description = data.description
    if (data.amount !== undefined) updateData.amount = parseFloat(data.amount)
    if (data.date !== undefined) updateData.date = new Date(data.date)
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId
    if (data.vendor !== undefined) updateData.vendor = data.vendor || null
    if (data.receiptUrl !== undefined) updateData.receiptUrl = data.receiptUrl || null
    if (data.notes !== undefined) updateData.notes = data.notes || null
    if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring
    if (data.recurringFrequency !== undefined) updateData.recurringFrequency = data.recurringFrequency || null
    if (data.bookingId !== undefined) updateData.bookingId = data.bookingId || null

    const expense = await prisma.expense.update({
      where: { id },
      data: updateData,
      include: { category: true },
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Failed to update expense:', error)
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    )
  }
}

// DELETE expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.expense.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete expense:', error)
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    )
  }
}
