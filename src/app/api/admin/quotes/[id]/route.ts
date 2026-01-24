import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'
import {
  sendCallbackScheduledEmail,
  sendQuoteReadyEmail,
  sendQuoteStatusUpdateEmail,
} from '@/lib/email'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Get single quote details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getAdminFromCookies()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            company: true,
          },
        },
      },
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Mark as read
    if (!quote.isRead) {
      await prisma.quote.update({
        where: { id },
        data: { isRead: true },
      })
    }

    // Get status history
    const statusHistory = await prisma.quoteStatusHistory.findMany({
      where: { quoteId: id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      quote: {
        ...quote,
        clientName: quote.client?.name || quote.guestName,
        clientEmail: quote.client?.email || quote.guestEmail,
        clientPhone: quote.client?.phone || quote.guestPhone,
        clientCompany: quote.client?.company || quote.guestCompany,
      },
      statusHistory,
    })
  } catch (error) {
    console.error('Quote fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    )
  }
}

// Update quote
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getAdminFromCookies()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    const clientName = quote.client?.name || quote.guestName || 'Client'
    const clientEmail = quote.client?.email || quote.guestEmail

    // Handle status change
    if (body.status && body.status !== quote.status) {
      // Create status history entry
      await prisma.quoteStatusHistory.create({
        data: {
          quoteId: id,
          status: body.status,
          note: body.statusNote || null,
          changedBy: admin.id,
        },
      })

      // Send appropriate notification
      if (clientEmail) {
        switch (body.status) {
          case 'callback_scheduled':
            if (body.callbackScheduled) {
              await sendCallbackScheduledEmail(
                clientEmail,
                clientName,
                quote.quoteNumber,
                new Date(body.callbackScheduled)
              )
            }
            break

          case 'quoted':
            if (body.finalPrice && body.quoteValidUntil) {
              await sendQuoteReadyEmail(
                clientEmail,
                clientName,
                quote.quoteNumber,
                body.finalPrice,
                new Date(body.quoteValidUntil)
              )
            }
            break

          default:
            await sendQuoteStatusUpdateEmail(
              clientEmail,
              clientName,
              quote.quoteNumber,
              body.status,
              body.statusNote
            )
        }
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {}

    if (body.status) updateData.status = body.status
    if (body.callbackScheduled) {
      updateData.callbackScheduled = new Date(body.callbackScheduled)
    }
    if (body.callbackCompleted) {
      updateData.callbackCompleted = new Date(body.callbackCompleted)
    }
    if (body.callNotes !== undefined) updateData.callNotes = body.callNotes
    if (body.internalNotes !== undefined) updateData.internalNotes = body.internalNotes
    if (body.estimatedPrice !== undefined) updateData.estimatedPrice = body.estimatedPrice
    if (body.finalPrice !== undefined) {
      updateData.finalPrice = body.finalPrice
      updateData.quotedAt = new Date()
    }
    if (body.quoteValidUntil) {
      updateData.quoteValidUntil = new Date(body.quoteValidUntil)
    }
    if (body.assignedTo !== undefined) updateData.assignedTo = body.assignedTo

    // Update quote
    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      quote: updatedQuote,
    })
  } catch (error) {
    console.error('Quote update error:', error)
    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    )
  }
}

// Delete quote
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getAdminFromCookies()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Delete status history first
    await prisma.quoteStatusHistory.deleteMany({
      where: { quoteId: id },
    })

    // Delete quote
    await prisma.quote.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Quote delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete quote' },
      { status: 500 }
    )
  }
}
