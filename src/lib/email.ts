import nodemailer from 'nodemailer'

// Email configuration
const EMAIL_USER = process.env.EMAIL_USER || 'z360virtualtours@gmail.com'
const EMAIL_PASS = process.env.EMAIL_PASS
const ADMIN_EMAIL = 'z360virtualtours@gmail.com'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000'

// Create transporter
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  })
}

// Base email template
function baseTemplate(content: string, title: string = 'Z360 Virtual Tours') {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0D1B2A;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0D1B2A; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1B2838; border-radius: 16px; overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #C9A962 0%, #A88B4A 100%); padding: 30px; text-align: center;">
                  <h1 style="margin: 0; color: #0D1B2A; font-size: 24px; font-weight: 700;">Z360 Virtual Tours</h1>
                  <p style="margin: 5px 0 0; color: #0D1B2A; font-size: 14px; opacity: 0.8;">Professional 360° Virtual Tour Services</p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px; color: #F5F1E6;">
                  ${content}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #0D1B2A; padding: 30px; text-align: center;">
                  <p style="margin: 0 0 10px; color: #888; font-size: 12px;">
                    Z360 Virtual Tours | Balkans Region
                  </p>
                  <p style="margin: 0; color: #888; font-size: 12px;">
                    <a href="mailto:z360virtualtours@gmail.com" style="color: #C9A962; text-decoration: none;">z360virtualtours@gmail.com</a>
                    &nbsp;|&nbsp;
                    <a href="tel:+38971967915" style="color: #C9A962; text-decoration: none;">+389 71 967 915</a>
                  </p>
                  <div style="margin-top: 20px;">
                    <a href="https://facebook.com/z360virtualtours" style="color: #888; text-decoration: none; margin: 0 10px;">Facebook</a>
                    <a href="https://instagram.com/z360virtualtours" style="color: #888; text-decoration: none; margin: 0 10px;">Instagram</a>
                    <a href="https://linkedin.com/company/z360virtualtours" style="color: #888; text-decoration: none; margin: 0 10px;">LinkedIn</a>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

// Email Templates
export const emailTemplates = {
  // Booking confirmation to client
  bookingConfirmation: (data: {
    clientName: string
    bookingId: string
    totalQuote: number
    depositAmount: number
    propertyAddress: string
    preferredDate?: string
  }) => ({
    subject: `Booking Request Received - Reference #${data.bookingId.slice(-8).toUpperCase()}`,
    html: baseTemplate(`
      <h2 style="color: #C9A962; margin-top: 0;">Thank You for Your Booking Request!</h2>

      <p style="font-size: 16px; line-height: 1.6;">
        Hi ${data.clientName},
      </p>

      <p style="font-size: 16px; line-height: 1.6;">
        We've received your booking request and will review it shortly. You'll receive a confirmed quote within 24 hours.
      </p>

      <div style="background-color: #0D1B2A; border-radius: 12px; padding: 20px; margin: 25px 0;">
        <p style="margin: 0 0 15px; color: #C9A962; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Reference Number</p>
        <p style="margin: 0; font-size: 24px; font-weight: 700; color: #C9A962; font-family: monospace;">
          #${data.bookingId.slice(-8).toUpperCase()}
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #333; color: #888;">Property</td>
          <td style="padding: 12px; border-bottom: 1px solid #333; text-align: right;">${data.propertyAddress}</td>
        </tr>
        ${data.preferredDate ? `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #333; color: #888;">Preferred Date</td>
          <td style="padding: 12px; border-bottom: 1px solid #333; text-align: right;">${new Date(data.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #333; color: #888;">Estimated Total</td>
          <td style="padding: 12px; border-bottom: 1px solid #333; text-align: right; font-weight: 700; color: #C9A962;">€${data.totalQuote.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 12px; color: #888;">Deposit Required</td>
          <td style="padding: 12px; text-align: right;">€${data.depositAmount.toFixed(2)}</td>
        </tr>
      </table>

      <p style="font-size: 14px; color: #888; line-height: 1.6;">
        * Final pricing will be confirmed after we review your request details.
      </p>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${BASE_URL}/booking/status?id=${data.bookingId}" style="display: inline-block; background: linear-gradient(135deg, #C9A962 0%, #A88B4A 100%); color: #0D1B2A; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600;">
          Track Your Booking
        </a>
      </div>
    `),
  }),

  // Quote sent to client
  quoteSent: (data: {
    clientName: string
    bookingId: string
    totalQuote: number
    depositAmount: number
    paymentUrl: string
    validDays: number
  }) => ({
    subject: `Your Quote is Ready - €${data.totalQuote.toFixed(2)} - Z360 Virtual Tours`,
    html: baseTemplate(`
      <h2 style="color: #C9A962; margin-top: 0;">Your Quote is Ready!</h2>

      <p style="font-size: 16px; line-height: 1.6;">
        Hi ${data.clientName},
      </p>

      <p style="font-size: 16px; line-height: 1.6;">
        We've reviewed your request and prepared your personalized quote. To confirm your booking, simply pay the deposit below.
      </p>

      <div style="background-color: #0D1B2A; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
        <p style="margin: 0 0 10px; color: #888; font-size: 14px;">Total Quote</p>
        <p style="margin: 0 0 20px; font-size: 36px; font-weight: 700; color: #C9A962;">€${data.totalQuote.toFixed(2)}</p>
        <p style="margin: 0; color: #888; font-size: 14px;">Deposit to confirm: <strong style="color: #F5F1E6;">€${data.depositAmount.toFixed(2)}</strong></p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.paymentUrl}" style="display: inline-block; background: linear-gradient(135deg, #C9A962 0%, #A88B4A 100%); color: #0D1B2A; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Pay Deposit Now
        </a>
      </div>

      <p style="font-size: 14px; color: #888; text-align: center;">
        This quote is valid for ${data.validDays} days.
      </p>

      <div style="background-color: #0D1B2A; border-radius: 8px; padding: 15px; margin-top: 25px;">
        <p style="margin: 0; font-size: 13px; color: #888;">
          <strong style="color: #F5F1E6;">Reference:</strong> #${data.bookingId.slice(-8).toUpperCase()}
        </p>
      </div>
    `),
  }),

  // Payment received
  paymentReceived: (data: {
    clientName: string
    bookingId: string
    amount: number
    paymentType: 'deposit' | 'balance' | 'full'
    totalQuote: number
    remainingBalance: number
  }) => ({
    subject: `Payment Received - €${data.amount.toFixed(2)} - Z360 Virtual Tours`,
    html: baseTemplate(`
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 80px; height: 80px; background-color: #22c55e20; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
          <span style="font-size: 40px;">✓</span>
        </div>
      </div>

      <h2 style="color: #22c55e; margin-top: 0; text-align: center;">Payment Received!</h2>

      <p style="font-size: 16px; line-height: 1.6; text-align: center;">
        Hi ${data.clientName}, thank you for your payment!
      </p>

      <div style="background-color: #0D1B2A; border-radius: 12px; padding: 25px; margin: 25px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #888;">Payment Type</td>
            <td style="padding: 10px 0; text-align: right; text-transform: capitalize;">${data.paymentType}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #888;">Amount Paid</td>
            <td style="padding: 10px 0; text-align: right; font-size: 20px; font-weight: 700; color: #22c55e;">€${data.amount.toFixed(2)}</td>
          </tr>
          ${data.remainingBalance > 0 ? `
          <tr>
            <td style="padding: 10px 0; border-top: 1px solid #333; color: #888;">Remaining Balance</td>
            <td style="padding: 10px 0; border-top: 1px solid #333; text-align: right;">€${data.remainingBalance.toFixed(2)}</td>
          </tr>
          ` : ''}
        </table>
      </div>

      <p style="font-size: 16px; line-height: 1.6;">
        ${data.paymentType === 'deposit'
          ? 'Your booking is now confirmed! We will contact you shortly to finalize the shooting schedule.'
          : 'Your payment has been processed successfully. Thank you for choosing Z360 Virtual Tours!'}
      </p>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${BASE_URL}/booking/status?id=${data.bookingId}" style="display: inline-block; background: linear-gradient(135deg, #C9A962 0%, #A88B4A 100%); color: #0D1B2A; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600;">
          View Booking Status
        </a>
      </div>

      <div style="background-color: #0D1B2A; border-radius: 8px; padding: 15px; margin-top: 25px;">
        <p style="margin: 0; font-size: 13px; color: #888;">
          <strong style="color: #F5F1E6;">Reference:</strong> #${data.bookingId.slice(-8).toUpperCase()}
        </p>
      </div>
    `),
  }),

  // Status update
  statusUpdate: (data: {
    clientName: string
    bookingId: string
    status: string
    statusLabel: string
    message: string
  }) => ({
    subject: `Booking Update: ${data.statusLabel} - Z360 Virtual Tours`,
    html: baseTemplate(`
      <h2 style="color: #C9A962; margin-top: 0;">Booking Status Update</h2>

      <p style="font-size: 16px; line-height: 1.6;">
        Hi ${data.clientName},
      </p>

      <p style="font-size: 16px; line-height: 1.6;">
        ${data.message}
      </p>

      <div style="background-color: #0D1B2A; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
        <p style="margin: 0 0 10px; color: #888; font-size: 12px; text-transform: uppercase;">Current Status</p>
        <p style="margin: 0; font-size: 20px; font-weight: 700; color: #C9A962;">${data.statusLabel}</p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${BASE_URL}/booking/status?id=${data.bookingId}" style="display: inline-block; background: linear-gradient(135deg, #C9A962 0%, #A88B4A 100%); color: #0D1B2A; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600;">
          View Full Details
        </a>
      </div>

      <div style="background-color: #0D1B2A; border-radius: 8px; padding: 15px; margin-top: 25px;">
        <p style="margin: 0; font-size: 13px; color: #888;">
          <strong style="color: #F5F1E6;">Reference:</strong> #${data.bookingId.slice(-8).toUpperCase()}
        </p>
      </div>
    `),
  }),

  // Tour delivered
  tourDelivered: (data: {
    clientName: string
    bookingId: string
    tourUrl?: string
    tourEmbed?: string
  }) => ({
    subject: `Your Virtual Tour is Ready! - Z360 Virtual Tours`,
    html: baseTemplate(`
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 60px;">🎉</span>
      </div>

      <h2 style="color: #C9A962; margin-top: 0; text-align: center;">Your Virtual Tour is Ready!</h2>

      <p style="font-size: 16px; line-height: 1.6; text-align: center;">
        Hi ${data.clientName}, great news! Your 360° virtual tour has been completed and is ready for viewing.
      </p>

      ${data.tourUrl ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.tourUrl}" style="display: inline-block; background: linear-gradient(135deg, #C9A962 0%, #A88B4A 100%); color: #0D1B2A; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          View Your Tour
        </a>
      </div>
      ` : ''}

      <div style="background-color: #0D1B2A; border-radius: 12px; padding: 25px; margin: 25px 0;">
        <h3 style="color: #C9A962; margin-top: 0;">What's Next?</h3>
        <ul style="color: #F5F1E6; line-height: 1.8; padding-left: 20px;">
          <li>Share your tour on social media</li>
          <li>Embed it on your website</li>
          <li>Add it to your Google Business listing</li>
          <li>Send it to potential clients</li>
        </ul>
      </div>

      <p style="font-size: 16px; line-height: 1.6;">
        If you need any modifications or have questions, please don't hesitate to contact us. We're here to help!
      </p>

      <div style="background-color: #0D1B2A; border-radius: 8px; padding: 15px; margin-top: 25px;">
        <p style="margin: 0; font-size: 13px; color: #888;">
          <strong style="color: #F5F1E6;">Reference:</strong> #${data.bookingId.slice(-8).toUpperCase()}
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
        <p style="font-size: 14px; color: #888;">
          We'd love to hear your feedback! Please take a moment to rate your experience.
        </p>
      </div>
    `),
  }),

  // Change request confirmation to user
  changeRequestConfirmation: (data: {
    clientName: string
    bookingId: string
    requestType: 'date_change' | 'cancellation' | 'other'
    message?: string
    newPreferredDate?: string
    newPreferredTime?: string
    propertyAddress: string
    currentStatus: string
  }) => {
    const requestTypeLabels = {
      date_change: 'Date Change Request',
      cancellation: 'Cancellation Request',
      other: 'Change Request',
    }

    return {
      subject: `${requestTypeLabels[data.requestType]} Received - Reference #${data.bookingId.slice(-8).toUpperCase()}`,
      html: baseTemplate(`
        <h2 style="color: #C9A962; margin-top: 0;">Your Request Has Been Submitted</h2>

        <p style="font-size: 16px; line-height: 1.6;">
          Hi ${data.clientName},
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
          We have received your ${requestTypeLabels[data.requestType].toLowerCase()} and our team will review it shortly. You will receive an update within 24-48 hours.
        </p>

        <div style="background-color: #0D1B2A; border-radius: 12px; padding: 20px; margin: 25px 0;">
          <p style="margin: 0 0 15px; color: #C9A962; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Request Details</p>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #888; border-bottom: 1px solid #333;">Request Type</td>
              <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #333; color: #C9A962; font-weight: 600;">${requestTypeLabels[data.requestType]}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888; border-bottom: 1px solid #333;">Property</td>
              <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #333;">${data.propertyAddress}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888; border-bottom: 1px solid #333;">Reference</td>
              <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #333; font-family: monospace;">#${data.bookingId.slice(-8).toUpperCase()}</td>
            </tr>
            ${data.newPreferredDate ? `
            <tr>
              <td style="padding: 10px 0; color: #888; border-bottom: 1px solid #333;">New Preferred Date</td>
              <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #333;">${new Date(data.newPreferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}${data.newPreferredTime ? ` at ${data.newPreferredTime}` : ''}</td>
            </tr>
            ` : ''}
            ${data.message ? `
            <tr>
              <td colspan="2" style="padding: 15px 0;">
                <p style="margin: 0 0 5px; color: #888; font-size: 12px;">Your Message:</p>
                <p style="margin: 0; background-color: #1B2838; padding: 12px; border-radius: 8px; font-style: italic;">"${data.message}"</p>
              </td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="background-color: ${data.requestType === 'cancellation' ? '#dc262620' : '#C9A96220'}; border-radius: 12px; padding: 20px; margin: 25px 0;">
          <h3 style="color: ${data.requestType === 'cancellation' ? '#dc2626' : '#C9A962'}; margin-top: 0; font-size: 16px;">What Happens Next?</h3>
          ${data.requestType === 'cancellation' ? `
          <ul style="color: #F5F1E6; line-height: 1.8; padding-left: 20px; margin: 0;">
            <li>Our team will review your cancellation request</li>
            <li>We will check if a refund is applicable based on our cancellation policy</li>
            <li>You will receive a confirmation email once processed</li>
            <li>If you paid a deposit, refund details will be included in the confirmation</li>
          </ul>
          ` : data.requestType === 'date_change' ? `
          <ul style="color: #F5F1E6; line-height: 1.8; padding-left: 20px; margin: 0;">
            <li>Our team will check availability for your requested date</li>
            <li>If the date is available, we will update your booking</li>
            <li>If not, we will suggest alternative dates</li>
            <li>No additional fees apply for date changes made 48+ hours before the shoot</li>
          </ul>
          ` : `
          <ul style="color: #F5F1E6; line-height: 1.8; padding-left: 20px; margin: 0;">
            <li>Our team will review your request carefully</li>
            <li>We may reach out if we need additional information</li>
            <li>You will receive an update via email once we have a response</li>
          </ul>
          `}
        </div>

        <p style="font-size: 14px; color: #888; line-height: 1.6;">
          If you have any urgent questions, feel free to contact us directly at <a href="mailto:z360virtualtours@gmail.com" style="color: #C9A962;">z360virtualtours@gmail.com</a> or call us at <a href="tel:+38971967915" style="color: #C9A962;">+389 71 967 915</a>.
        </p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${BASE_URL}/booking/status?id=${data.bookingId}" style="display: inline-block; background: linear-gradient(135deg, #C9A962 0%, #A88B4A 100%); color: #0D1B2A; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600;">
            Track Your Booking
          </a>
        </div>
      `),
    }
  },

  // Change request notification to admin
  changeRequestAdmin: (data: {
    clientName: string
    clientEmail: string
    clientPhone?: string
    bookingId: string
    requestType: 'date_change' | 'cancellation' | 'other'
    message?: string
    newPreferredDate?: string
    newPreferredTime?: string
    propertyAddress: string
    currentStatus: string
  }) => {
    const requestTypeLabels = {
      date_change: '📅 Date Change Request',
      cancellation: '❌ Cancellation Request',
      other: '📝 Change Request',
    }
    const urgencyColors = {
      date_change: '#f59e0b',
      cancellation: '#dc2626',
      other: '#3b82f6',
    }

    return {
      subject: `[ACTION REQUIRED] ${requestTypeLabels[data.requestType]} - ${data.clientName}`,
      html: baseTemplate(`
        <div style="background-color: ${urgencyColors[data.requestType]}20; border-left: 4px solid ${urgencyColors[data.requestType]}; padding: 15px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
          <h2 style="color: ${urgencyColors[data.requestType]}; margin: 0; font-size: 20px;">${requestTypeLabels[data.requestType]}</h2>
          <p style="margin: 5px 0 0; color: #888;">A client has submitted a change request that requires your attention.</p>
        </div>

        <div style="background-color: #0D1B2A; border-radius: 12px; padding: 20px; margin: 25px 0;">
          <h3 style="color: #C9A962; margin-top: 0;">Client Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #888; width: 120px;">Name</td>
              <td style="padding: 10px 0; font-weight: 600;">${data.clientName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888;">Email</td>
              <td style="padding: 10px 0;"><a href="mailto:${data.clientEmail}" style="color: #C9A962;">${data.clientEmail}</a></td>
            </tr>
            ${data.clientPhone ? `
            <tr>
              <td style="padding: 10px 0; color: #888;">Phone</td>
              <td style="padding: 10px 0;"><a href="tel:${data.clientPhone}" style="color: #C9A962;">${data.clientPhone}</a></td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="background-color: #0D1B2A; border-radius: 12px; padding: 20px; margin: 25px 0;">
          <h3 style="color: #C9A962; margin-top: 0;">Booking Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #888; width: 120px;">Reference</td>
              <td style="padding: 10px 0; font-family: monospace; font-size: 16px;">#${data.bookingId.slice(-8).toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888;">Property</td>
              <td style="padding: 10px 0;">${data.propertyAddress}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888;">Current Status</td>
              <td style="padding: 10px 0;">${data.currentStatus}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #0D1B2A; border-radius: 12px; padding: 20px; margin: 25px 0;">
          <h3 style="color: #C9A962; margin-top: 0;">Request Details</h3>
          ${data.newPreferredDate ? `
          <div style="margin-bottom: 15px;">
            <p style="margin: 0 0 5px; color: #888; font-size: 12px; text-transform: uppercase;">Requested New Date</p>
            <p style="margin: 0; font-size: 18px; color: #f59e0b;">${new Date(data.newPreferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}${data.newPreferredTime ? ` at ${data.newPreferredTime}` : ''}</p>
          </div>
          ` : ''}
          ${data.message ? `
          <div>
            <p style="margin: 0 0 5px; color: #888; font-size: 12px; text-transform: uppercase;">Client Message</p>
            <div style="background-color: #1B2838; padding: 15px; border-radius: 8px; border-left: 3px solid #C9A962;">
              <p style="margin: 0; font-style: italic; line-height: 1.6;">"${data.message}"</p>
            </div>
          </div>
          ` : '<p style="color: #888; font-style: italic;">No additional message provided.</p>'}
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${BASE_URL}/admin/bookings" style="display: inline-block; background: linear-gradient(135deg, #C9A962 0%, #A88B4A 100%); color: #0D1B2A; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; margin: 0 10px;">
            View in Admin Panel
          </a>
        </div>

        <div style="background-color: #dc262620; border-radius: 8px; padding: 15px; margin-top: 25px; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #dc2626;">
            ⏰ Please respond to this request within 24-48 hours
          </p>
        </div>
      `),
    }
  },

  // Change request response to user (when admin approves/rejects)
  changeRequestResponse: (data: {
    clientName: string
    bookingId: string
    requestType: 'date_change' | 'cancellation' | 'other'
    approved: boolean
    adminMessage?: string
    propertyAddress: string
    newConfirmedDate?: string
    newConfirmedTime?: string
  }) => {
    const requestTypeLabels = {
      date_change: 'Date Change',
      cancellation: 'Cancellation',
      other: 'Change',
    }

    return {
      subject: data.approved
        ? `Your ${requestTypeLabels[data.requestType]} Request Has Been Approved - Z360 Virtual Tours`
        : `Update on Your ${requestTypeLabels[data.requestType]} Request - Z360 Virtual Tours`,
      html: baseTemplate(`
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="width: 60px; height: 60px; margin: 0 auto 15px; border-radius: 50%; background-color: ${data.approved ? '#22c55e20' : '#f59e0b20'}; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 28px;">${data.approved ? '✓' : '!'}</span>
          </div>
          <h1 style="color: ${data.approved ? '#22c55e' : '#f59e0b'}; margin: 0 0 10px; font-size: 24px;">
            ${data.approved ? 'Request Approved' : 'Request Update'}
          </h1>
          <p style="color: #888; margin: 0; font-size: 16px;">
            Booking Reference: #${data.bookingId.slice(-8).toUpperCase()}
          </p>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">Hi ${data.clientName},</p>

        ${data.approved ? `
        <p style="font-size: 16px; line-height: 1.6;">
          Great news! Your <strong>${requestTypeLabels[data.requestType].toLowerCase()} request</strong> for the booking at <strong>${data.propertyAddress}</strong> has been approved.
        </p>
        ` : `
        <p style="font-size: 16px; line-height: 1.6;">
          We've reviewed your <strong>${requestTypeLabels[data.requestType].toLowerCase()} request</strong> for the booking at <strong>${data.propertyAddress}</strong>. Unfortunately, we were unable to approve this request at this time.
        </p>
        `}

        ${data.approved && data.requestType === 'date_change' && data.newConfirmedDate ? `
        <div style="background-color: #22c55e20; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
          <h3 style="color: #22c55e; margin-top: 0;">New Confirmed Date</h3>
          <p style="font-size: 20px; font-weight: 600; margin: 0; color: #F5F1E6;">
            ${data.newConfirmedDate}${data.newConfirmedTime ? ` at ${data.newConfirmedTime}` : ''}
          </p>
        </div>
        ` : ''}

        ${data.approved && data.requestType === 'cancellation' ? `
        <div style="background-color: #0D1B2A; border-radius: 12px; padding: 20px; margin: 25px 0;">
          <h3 style="color: #C9A962; margin-top: 0;">What Happens Next?</h3>
          <ul style="color: #F5F1E6; line-height: 1.8; padding-left: 20px; margin: 0;">
            <li>Your booking has been cancelled</li>
            <li>If you paid a deposit, our team will process your refund within 5-7 business days</li>
            <li>You will receive a separate email confirmation once the refund is processed</li>
            <li>If you have any questions, please don't hesitate to contact us</li>
          </ul>
        </div>
        ` : ''}

        ${data.adminMessage ? `
        <div style="background-color: #0D1B2A; border-radius: 12px; padding: 20px; margin: 25px 0;">
          <h3 style="color: #C9A962; margin-top: 0;">Message from Z360 Team</h3>
          <div style="background-color: #1B2838; padding: 15px; border-radius: 8px; border-left: 3px solid #C9A962;">
            <p style="margin: 0; font-style: italic; line-height: 1.6;">"${data.adminMessage}"</p>
          </div>
        </div>
        ` : ''}

        ${!data.approved ? `
        <div style="background-color: #0D1B2A; border-radius: 12px; padding: 20px; margin: 25px 0;">
          <h3 style="color: #C9A962; margin-top: 0;">Need Help?</h3>
          <p style="color: #F5F1E6; line-height: 1.6; margin: 0;">
            If you'd like to discuss alternative options or have questions about this decision, please contact us. We're happy to help find a solution that works for you.
          </p>
        </div>
        ` : ''}

        <p style="font-size: 14px; color: #888; line-height: 1.6; margin-top: 30px;">
          If you have any questions, feel free to contact us at <a href="mailto:z360virtualtours@gmail.com" style="color: #C9A962;">z360virtualtours@gmail.com</a> or call us at <a href="tel:+38971967915" style="color: #C9A962;">+389 71 967 915</a>.
        </p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${BASE_URL}/booking/status?id=${data.bookingId}" style="display: inline-block; background: linear-gradient(135deg, #C9A962 0%, #A88B4A 100%); color: #0D1B2A; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600;">
            View Booking Details
          </a>
        </div>
      `),
    }
  },
}

// Send email function
export async function sendEmail(to: string, template: { subject: string; html: string }): Promise<boolean> {
  if (!EMAIL_PASS) {
    console.warn('EMAIL_PASS not configured, skipping email send')
    return false
  }

  try {
    const transporter = createTransporter()

    await transporter.sendMail({
      from: `"Z360 Virtual Tours" <${EMAIL_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    })

    console.log(`Email sent to ${to}: ${template.subject}`)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

// Send email to admin
export async function sendAdminNotification(template: { subject: string; html: string }): Promise<boolean> {
  return sendEmail(ADMIN_EMAIL, template)
}

// Helper to get status message for client
export function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    quote_sent: 'We have reviewed your request and sent you a personalized quote. Please check the details and proceed with the deposit payment to confirm your booking.',
    confirmed: 'Great news! Your booking has been confirmed. We will contact you shortly to finalize the shooting schedule.',
    scheduled: 'Your photo shoot has been scheduled. We look forward to capturing your space!',
    in_progress: 'We are currently working on your virtual tour. You will be notified once it is ready.',
    editing: 'Your virtual tour is in the editing phase. We are adding the finishing touches!',
    delivered: 'Your virtual tour has been completed and delivered. Thank you for choosing Z360 Virtual Tours!',
    completed: 'Your project has been marked as completed. Thank you for your business!',
    cancelled: 'Your booking has been cancelled. If you have any questions, please contact us.',
  }
  return messages[status] || 'Your booking status has been updated.'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    quote_requested: 'Quote Requested',
    quote_sent: 'Quote Sent',
    negotiating: 'Negotiating',
    pending_deposit: 'Awaiting Deposit',
    confirmed: 'Confirmed',
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    editing: 'Editing',
    delivered: 'Delivered',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }
  return labels[status] || status
}
