import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  WorkReportData,
  generateReceiptNumber,
  formatDuration,
  formatTime,
  formatDate,
  generateReceiptHTML,
  generateReceiptText,
  generateReceiptCSV,
} from '@/lib/receipt-generator'

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
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json' // json, html, text, csv

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        pricingPlan: true,
        urgencyTier: true,
        travelZone: true,
        travelBundle: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Build work report data
    const completedAt = booking.completedAt || new Date()
    const workStartedAt = booking.workStartedAt ? new Date(booking.workStartedAt) : completedAt
    const workEndedAt = booking.workEndedAt ? new Date(booking.workEndedAt) : completedAt
    const durationMinutes = booking.workDurationMinutes || 0

    const depositAmount = booking.depositAmount || 0
    const totalAmount = booking.totalQuote || 0
    const balanceDue = booking.depositPaid
      ? totalAmount - depositAmount
      : totalAmount

    const reportData: WorkReportData = {
      // Receipt Info
      receiptNumber: generateReceiptNumber(booking.id, completedAt),
      generatedAt: formatDate(new Date()) + ' at ' + formatTime(new Date()),

      // Business Info (you can customize these)
      businessName: 'Z360 Virtual Tours',
      businessEmail: 'contact@z360tours.com',
      businessPhone: '+389 XX XXX XXX',
      businessAddress: 'Skopje, North Macedonia',

      // Client Info
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      clientPhone: booking.clientPhone,
      companyName: booking.companyName,

      // Job Details
      jobId: booking.id,
      propertyAddress: booking.propertyAddress,
      propertyCity: booking.propertyCity,
      serviceType: booking.serviceType || booking.pricingPlan?.name || null,
      projectDescription: booking.projectDescription,

      // Work Session
      workDate: formatDate(workStartedAt),
      workStartTime: formatTime(workStartedAt),
      workEndTime: formatTime(workEndedAt),
      workDurationMinutes: durationMinutes,
      workDurationFormatted: formatDuration(durationMinutes),

      // Pricing
      basePrice: booking.basePrice,
      urgencySurcharge: booking.urgencySurcharge,
      travelFee: booking.travelFee,
      bundleDiscount: booking.bundleDiscount,
      totalAmount: totalAmount,
      depositAmount: depositAmount,
      depositPaid: booking.depositPaid,
      balanceDue: balanceDue,

      // Notes
      internalNotes: booking.internalNotes,
      workNotes: null, // Can be added from the completion modal
    }

    // Return in requested format
    switch (format) {
      case 'html':
        const html = generateReceiptHTML(reportData)
        return new NextResponse(html, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Disposition': `inline; filename="${reportData.receiptNumber}.html"`,
          },
        })

      case 'text':
        const text = generateReceiptText(reportData)
        return new NextResponse(text, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="${reportData.receiptNumber}.txt"`,
          },
        })

      case 'csv':
        const csv = generateReceiptCSV(reportData)
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${reportData.receiptNumber}.csv"`,
          },
        })

      case 'json':
      default:
        return NextResponse.json(reportData)
    }
  } catch (error) {
    console.error('Failed to generate receipt:', error)
    return NextResponse.json(
      { error: 'Failed to generate receipt' },
      { status: 500 }
    )
  }
}

// POST endpoint to complete work and generate receipt
export async function POST(
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

    const booking = await prisma.booking.findUnique({ where: { id } })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Complete the work with additional notes
    const now = new Date()
    const workStart = booking.workStartedAt || now
    const durationMs = now.getTime() - new Date(workStart).getTime()
    const durationMinutes = data.manualDuration || Math.round(durationMs / (1000 * 60))

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: now,
        workEndedAt: now,
        workDurationMinutes: durationMinutes,
        // Add work notes to internal notes
        internalNotes: data.workNotes
          ? `${booking.internalNotes || ''}\n\n--- Work Notes (${formatDate(now)}) ---\n${data.workNotes}`.trim()
          : booking.internalNotes,
      },
    })

    // Generate receipt data
    const completedAt = now
    const workStartedAt = booking.workStartedAt ? new Date(booking.workStartedAt) : completedAt

    const depositAmount = updatedBooking.depositAmount || 0
    const totalAmount = updatedBooking.totalQuote || 0
    const balanceDue = updatedBooking.depositPaid
      ? totalAmount - depositAmount
      : totalAmount

    const reportData: WorkReportData = {
      receiptNumber: generateReceiptNumber(updatedBooking.id, completedAt),
      generatedAt: formatDate(now) + ' at ' + formatTime(now),
      businessName: 'Z360 Virtual Tours',
      businessEmail: 'contact@z360tours.com',
      businessPhone: '+389 XX XXX XXX',
      businessAddress: 'Skopje, North Macedonia',
      clientName: updatedBooking.clientName,
      clientEmail: updatedBooking.clientEmail,
      clientPhone: updatedBooking.clientPhone,
      companyName: updatedBooking.companyName,
      jobId: updatedBooking.id,
      propertyAddress: updatedBooking.propertyAddress,
      propertyCity: updatedBooking.propertyCity,
      serviceType: updatedBooking.serviceType,
      projectDescription: updatedBooking.projectDescription,
      workDate: formatDate(workStartedAt),
      workStartTime: formatTime(workStartedAt),
      workEndTime: formatTime(completedAt),
      workDurationMinutes: durationMinutes,
      workDurationFormatted: formatDuration(durationMinutes),
      basePrice: updatedBooking.basePrice,
      urgencySurcharge: updatedBooking.urgencySurcharge,
      travelFee: updatedBooking.travelFee,
      bundleDiscount: updatedBooking.bundleDiscount,
      totalAmount: totalAmount,
      depositAmount: depositAmount,
      depositPaid: updatedBooking.depositPaid,
      balanceDue: balanceDue,
      internalNotes: updatedBooking.internalNotes,
      workNotes: data.workNotes || null,
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      receipt: reportData,
    })
  } catch (error) {
    console.error('Failed to complete work:', error)
    return NextResponse.json(
      { error: 'Failed to complete work' },
      { status: 500 }
    )
  }
}
