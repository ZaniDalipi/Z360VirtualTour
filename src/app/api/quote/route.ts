import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { quoteRequestSchema, validateInput, formatZodErrors, getFirstError } from '@/lib/validations'
import {
  sendQuoteReceivedEmail,
  sendNewQuoteNotification,
} from '@/lib/email'

// Generate unique quote number
async function generateQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `Q-${year}-`

  // Get the latest quote number for this year
  const lastQuote = await prisma.quote.findFirst({
    where: {
      quoteNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      quoteNumber: 'desc',
    },
  })

  let nextNumber = 1
  if (lastQuote) {
    const lastNumber = parseInt(lastQuote.quoteNumber.split('-')[2], 10)
    nextNumber = lastNumber + 1
  }

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`
}

// Create new quote request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = validateInput(quoteRequestSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: getFirstError(validation.errors),
          errors: formatZodErrors(validation.errors),
        },
        { status: 400 }
      )
    }

    const data = validation.data

    // Check if client exists (optional account linking)
    let clientId: string | null = null
    const existingClient = await prisma.client.findUnique({
      where: { email: data.email.toLowerCase() },
    })

    if (existingClient) {
      clientId = existingClient.id
    }

    // Generate quote number
    const quoteNumber = await generateQuoteNumber()

    // Parse preferred call date if provided
    let preferredCallDate: Date | null = null
    if (data.preferredCallDate) {
      preferredCallDate = new Date(data.preferredCallDate)
    }

    // Create quote
    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        clientId,
        guestName: clientId ? null : data.name,
        guestEmail: clientId ? null : data.email.toLowerCase(),
        guestPhone: data.phone,
        guestCompany: data.company,
        propertyAddress: data.propertyAddress,
        propertyCity: data.propertyCity,
        propertyType: data.propertyType,
        propertySize: data.propertySize,
        projectDescription: data.projectDescription,
        specialRequests: data.specialRequests,
        pricingPlanId: data.pricingPlanId,
        preferredCallTime: data.preferredCallTime,
        preferredCallDate,
        status: 'pending',
      },
    })

    // Create status history entry
    await prisma.quoteStatusHistory.create({
      data: {
        quoteId: quote.id,
        status: 'pending',
        note: 'Quote request submitted',
        changedBy: 'system',
      },
    })

    // Send confirmation email to client
    await sendQuoteReceivedEmail(
      data.email,
      data.name,
      quoteNumber,
      data.propertyAddress,
      data.preferredCallTime
    )

    // Send notification to admin
    await sendNewQuoteNotification(
      quoteNumber,
      data.name,
      data.email,
      data.phone,
      data.propertyAddress,
      data.preferredCallTime
    )

    return NextResponse.json(
      {
        success: true,
        quoteNumber,
        message: 'Your quote request has been submitted! We will call you at your preferred time.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Quote creation error:', error)
    return NextResponse.json(
      { error: 'Failed to submit quote request. Please try again.' },
      { status: 500 }
    )
  }
}

// Get quote by number (for tracking)
export async function GET(request: NextRequest) {
  try {
    const quoteNumber = request.nextUrl.searchParams.get('number')
    const email = request.nextUrl.searchParams.get('email')

    if (!quoteNumber || !email) {
      return NextResponse.json(
        { error: 'Quote number and email are required' },
        { status: 400 }
      )
    }

    // Find quote
    const quote = await prisma.quote.findUnique({
      where: { quoteNumber },
      include: {
        client: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    // Verify email matches
    const quoteEmail = quote.client?.email || quote.guestEmail
    if (quoteEmail?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email does not match quote records' },
        { status: 403 }
      )
    }

    // Get status history
    const statusHistory = await prisma.quoteStatusHistory.findMany({
      where: { quoteId: quote.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return NextResponse.json({
      quote: {
        quoteNumber: quote.quoteNumber,
        status: quote.status,
        propertyAddress: quote.propertyAddress,
        propertyCity: quote.propertyCity,
        propertyType: quote.propertyType,
        estimatedPrice: quote.estimatedPrice,
        finalPrice: quote.finalPrice,
        callbackScheduled: quote.callbackScheduled,
        quotedAt: quote.quotedAt,
        quoteValidUntil: quote.quoteValidUntil,
        createdAt: quote.createdAt,
      },
      statusHistory: statusHistory.map((h) => ({
        status: h.status,
        note: h.note,
        date: h.createdAt,
      })),
    })
  } catch (error) {
    console.error('Quote fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    )
  }
}
