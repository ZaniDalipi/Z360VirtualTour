import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Quote, QuoteStatusHistory } from '@/lib/models'
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
    await connectDB()

    const admin = await getAdminFromCookies()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const quote = await Quote.findById(id).populate('clientId', 'name email phone company')

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Mark as read
    if (!quote.isRead) {
      await Quote.findByIdAndUpdate(id, { isRead: true })
    }

    // Get status history
    const statusHistory = await QuoteStatusHistory.find({ quoteId: id }).sort({ createdAt: -1 })

    const client = quote.clientId as { name?: string; email?: string; phone?: string; company?: string } | null

    return NextResponse.json({
      quote: {
        ...quote.toObject(),
        id: quote._id,
        clientName: client?.name || quote.guestName,
        clientEmail: client?.email || quote.guestEmail,
        clientPhone: client?.phone || quote.guestPhone,
        clientCompany: client?.company || quote.guestCompany,
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
    await connectDB()

    const admin = await getAdminFromCookies()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const quote = await Quote.findById(id).populate('clientId', 'name email')

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    const client = quote.clientId as { name?: string; email?: string } | null
    const clientName = client?.name || quote.guestName || 'Client'
    const clientEmail = client?.email || quote.guestEmail

    // Handle status change
    if (body.status && body.status !== quote.status) {
      // Create status history entry
      await QuoteStatusHistory.create({
        quoteId: id,
        status: body.status,
        note: body.statusNote || null,
        changedBy: admin.id,
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
    const updatedQuote = await Quote.findByIdAndUpdate(id, updateData, { new: true })

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
    await connectDB()

    const admin = await getAdminFromCookies()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Delete status history first
    await QuoteStatusHistory.deleteMany({ quoteId: id })

    // Delete quote
    await Quote.findByIdAndDelete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Quote delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete quote' },
      { status: 500 }
    )
  }
}
