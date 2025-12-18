import { NextRequest, NextResponse } from 'next/server'
import { bookings, travelBundles, calculateQuote, getDistanceByCity } from '@/lib/booking-db'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.clientName || !data.clientEmail || !data.propertyAddress) {
      return NextResponse.json(
        { error: 'Name, email, and property address are required' },
        { status: 400 }
      )
    }

    // Get pricing plan price if selected
    let basePrice = 0
    if (data.pricingPlanId) {
      const plan = await prisma.pricingPlan.findUnique({
        where: { id: data.pricingPlanId },
      })
      if (plan) {
        basePrice = plan.price
      }
    }

    // Calculate distance from city
    let distanceKm = data.estimatedDistance
    if (!distanceKm && data.propertyCity) {
      distanceKm = getDistanceByCity(data.propertyCity)
    }

    // Calculate quote
    const quote = calculateQuote({
      pricingPlanPrice: basePrice,
      urgencyTierId: data.urgencyTierId,
      distanceKm,
      bundleId: data.travelBundleId,
    })

    // If joining a bundle, validate it
    if (data.travelBundleId) {
      const bundle = travelBundles.findUnique(data.travelBundleId)
      if (!bundle) {
        return NextResponse.json(
          { error: 'Selected bundle not found' },
          { status: 400 }
        )
      }
      if (bundle.status !== 'open') {
        return NextResponse.json(
          { error: 'Selected bundle is no longer accepting participants' },
          { status: 400 }
        )
      }
      if (bundle.currentCount >= bundle.maxParticipants) {
        return NextResponse.json(
          { error: 'Selected bundle is full' },
          { status: 400 }
        )
      }
    }

    // Create booking
    const booking = bookings.create({
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      companyName: data.companyName,
      propertyAddress: data.propertyAddress,
      propertyCity: data.propertyCity,
      estimatedDistance: distanceKm,
      serviceType: data.serviceType,
      projectDescription: data.projectDescription,
      specialRequests: data.specialRequests,
      pricingPlanId: data.pricingPlanId,
      urgencyTierId: data.urgencyTierId,
      preferredDate: data.preferredDate,
      alternateDate: data.alternateDate,
      deadlineDate: data.deadlineDate,
      isFlexible: data.isFlexible ?? true,
      travelBundleId: data.travelBundleId,
      basePrice: quote.basePrice,
      urgencySurcharge: quote.urgencySurchargeAmount,
      travelFee: quote.travelFee,
      bundleDiscount: quote.bundleDiscount,
      totalQuote: quote.total,
      depositAmount: quote.depositAmount,
      status: 'quote_requested',
    })

    // Send notification email to admin
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@z360virtualtours.com',
        subject: `New Booking Request from ${data.clientName}`,
        html: `
          <h2>New Booking Request</h2>
          <p><strong>Client:</strong> ${data.clientName}</p>
          <p><strong>Email:</strong> ${data.clientEmail}</p>
          <p><strong>Phone:</strong> ${data.clientPhone || 'Not provided'}</p>
          <p><strong>Company:</strong> ${data.companyName || 'Not provided'}</p>
          <p><strong>Property Address:</strong> ${data.propertyAddress}</p>
          <p><strong>City:</strong> ${data.propertyCity || 'Not specified'}</p>
          <p><strong>Distance:</strong> ${distanceKm ? `${distanceKm} km` : 'Not calculated'}</p>
          <hr>
          <h3>Quote Estimate</h3>
          <p><strong>Base Price:</strong> €${quote.basePrice.toFixed(2)}</p>
          ${quote.urgencySurchargeAmount > 0 ? `<p><strong>Urgency Surcharge (${quote.urgencySurchargePercent}%):</strong> €${quote.urgencySurchargeAmount.toFixed(2)}</p>` : ''}
          ${quote.travelFee > 0 ? `<p><strong>Travel Fee:</strong> €${quote.travelFee.toFixed(2)}</p>` : ''}
          ${quote.bundleDiscount > 0 ? `<p><strong>Bundle Discount:</strong> -€${quote.bundleDiscount.toFixed(2)}</p>` : ''}
          <p><strong>Total:</strong> €${quote.total.toFixed(2)}</p>
          ${quote.depositAmount ? `<p><strong>Deposit Required (${quote.depositPercent}%):</strong> €${quote.depositAmount.toFixed(2)}</p>` : ''}
          <hr>
          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL || ''}/admin/bookings/${booking.id}">View Booking in Admin</a></p>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError)
      // Don't fail the booking if email fails
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      quote: {
        basePrice: quote.basePrice,
        urgencySurcharge: quote.urgencySurchargeAmount,
        travelFee: quote.travelFee,
        bundleDiscount: quote.bundleDiscount,
        total: quote.total,
        depositAmount: quote.depositAmount,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking request' },
      { status: 500 }
    )
  }
}
