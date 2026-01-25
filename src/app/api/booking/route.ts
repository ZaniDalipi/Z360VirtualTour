import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Booking, TravelBundle, PricingPlan } from '@/lib/models'
import { calculateQuote, getDistanceByCity } from '@/lib/quote-utils'

// Send email notification for new booking
async function sendBookingNotification(booking: {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string | null
  companyName: string | null
  propertyAddress: string
  propertyCity: string | null
  distanceKm: number | null
  quote: {
    basePrice: number
    urgencySurchargePercent: number
    urgencySurchargeAmount: number
    travelFee: number
    bundleDiscount: number
    total: number
    depositAmount: number | null
    depositPercent: number | null
  }
}) {
  // Only send email if EMAIL_PASS is configured
  if (!process.env.EMAIL_PASS) {
    console.log('Email notification skipped - EMAIL_PASS not configured')
    return
  }

  try {
    const nodemailer = await import('nodemailer')

    const transporter = nodemailer.default.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'z360virtualtours@gmail.com',
        pass: process.env.EMAIL_PASS,
      },
    })

    const mailOptions = {
      from: `"Z360 Bookings" <${process.env.EMAIL_USER || 'z360virtualtours@gmail.com'}>`,
      replyTo: `"${booking.clientName}" <${booking.clientEmail}>`,
      to: 'z360virtualtours@gmail.com',
      subject: `New Booking Request from ${booking.clientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #C9A962; border-bottom: 2px solid #C9A962; padding-bottom: 10px;">
            New Booking Request
          </h2>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 140px;">Client:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.clientName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <a href="mailto:${booking.clientEmail}">${booking.clientEmail}</a>
              </td>
            </tr>
            ${booking.clientPhone ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <a href="tel:${booking.clientPhone}">${booking.clientPhone}</a>
              </td>
            </tr>
            ` : ''}
            ${booking.companyName ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Company:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.companyName}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Property Address:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.propertyAddress}</td>
            </tr>
            ${booking.propertyCity ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">City:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.propertyCity}</td>
            </tr>
            ` : ''}
            ${booking.distanceKm ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Distance:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.distanceKm} km</td>
            </tr>
            ` : ''}
          </table>

          <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 8px;">
            <h3 style="margin: 0 0 15px 0; color: #333;">Quote Estimate</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px 0;">Base Price:</td>
                <td style="padding: 5px 0; text-align: right;">€${booking.quote.basePrice.toFixed(2)}</td>
              </tr>
              ${booking.quote.urgencySurchargeAmount > 0 ? `
              <tr>
                <td style="padding: 5px 0; color: #e67e22;">Urgency Surcharge (${booking.quote.urgencySurchargePercent}%):</td>
                <td style="padding: 5px 0; text-align: right; color: #e67e22;">+€${booking.quote.urgencySurchargeAmount.toFixed(2)}</td>
              </tr>
              ` : ''}
              ${booking.quote.travelFee > 0 ? `
              <tr>
                <td style="padding: 5px 0;">Travel Fee:</td>
                <td style="padding: 5px 0; text-align: right;">+€${booking.quote.travelFee.toFixed(2)}</td>
              </tr>
              ` : ''}
              ${booking.quote.bundleDiscount > 0 ? `
              <tr>
                <td style="padding: 5px 0; color: #27ae60;">Bundle Discount:</td>
                <td style="padding: 5px 0; text-align: right; color: #27ae60;">-€${booking.quote.bundleDiscount.toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr style="border-top: 2px solid #C9A962;">
                <td style="padding: 10px 0; font-weight: bold; font-size: 18px;">Total:</td>
                <td style="padding: 10px 0; text-align: right; font-weight: bold; font-size: 18px; color: #C9A962;">€${booking.quote.total.toFixed(2)}</td>
              </tr>
              ${booking.quote.depositAmount ? `
              <tr>
                <td style="padding: 5px 0; color: #666;">Deposit Required (${booking.quote.depositPercent}%):</td>
                <td style="padding: 5px 0; text-align: right; color: #666;">€${booking.quote.depositAmount.toFixed(2)}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <p style="margin-top: 20px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000'}/admin/bookings"
               style="display: inline-block; padding: 12px 24px; background-color: #C9A962; color: #0D1B2A; text-decoration: none; border-radius: 8px; font-weight: bold;">
              View in Admin Panel
            </a>
          </p>

          <p style="margin-top: 20px; color: #666; font-size: 12px; text-align: center;">
            This notification was sent from the Z360 Virtual Tours booking system.
          </p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log('Booking notification email sent successfully')
  } catch (error) {
    console.error('Failed to send booking notification email:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
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
    let planName = ''
    if (data.pricingPlanId) {
      const plan = await PricingPlan.findById(data.pricingPlanId)
      if (plan) {
        basePrice = plan.price
        planName = plan.name
      }
    }

    // Calculate distance from city
    let distanceKm = data.estimatedDistance
    if (!distanceKm && data.propertyCity) {
      distanceKm = getDistanceByCity(data.propertyCity)
    }

    // Calculate quote
    const quote = await calculateQuote({
      pricingPlanPrice: basePrice,
      urgencyTierId: data.urgencyTierId,
      distanceKm,
      bundleId: data.travelBundleId,
    })

    // If joining a bundle, validate it
    if (data.travelBundleId) {
      const bundle = await TravelBundle.findById(data.travelBundleId)
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
    const booking = await Booking.create({
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      companyName: data.companyName,
      propertyAddress: data.propertyAddress,
      propertyCity: data.propertyCity,
      estimatedDistance: distanceKm,
      serviceType: data.serviceType || planName,
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

    // Send notification email (async, don't block the response)
    sendBookingNotification({
      id: booking._id.toString(),
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone || null,
      companyName: data.companyName || null,
      propertyAddress: data.propertyAddress,
      propertyCity: data.propertyCity || null,
      distanceKm,
      quote: {
        basePrice: quote.basePrice,
        urgencySurchargePercent: quote.urgencySurchargePercent,
        urgencySurchargeAmount: quote.urgencySurchargeAmount,
        travelFee: quote.travelFee,
        bundleDiscount: quote.bundleDiscount,
        total: quote.total,
        depositAmount: quote.depositAmount,
        depositPercent: quote.depositPercent,
      },
    }).catch(err => console.error('Email error:', err))

    return NextResponse.json({
      success: true,
      bookingId: booking._id,
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
