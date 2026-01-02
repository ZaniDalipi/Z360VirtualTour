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

// Base email template with improved design
function baseTemplate(content: string, title: string = 'Z360 Virtual Tours') {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <!--[if mso]>
      <style type="text/css">
        table {border-collapse: collapse;}
        .fallback-font {font-family: Arial, sans-serif !important;}
      </style>
      <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0D1B2A; -webkit-font-smoothing: antialiased;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0D1B2A; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #1B2838; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.3);">
              <!-- Header with Logo -->
              <tr>
                <td style="background: linear-gradient(135deg, #0D1B2A 0%, #1B2838 100%); padding: 35px 30px; text-align: center; border-bottom: 3px solid #C9A962;">
                  <!-- Logo Container -->
                  <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                    <tr>
                      <td align="center">
                        <!-- 360° Icon Circle -->
                        <div style="display: inline-block; width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #C9A962 0%, #A88B4A 100%); margin-bottom: 15px; line-height: 64px; text-align: center;">
                          <span style="font-size: 24px; font-weight: 800; color: #0D1B2A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">360°</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <!-- Z360 Text Logo -->
                        <h1 style="margin: 0 0 6px 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">
                          <span style="color: #C9A962;">Z</span><span style="color: #F5F1E6;">360</span>
                        </h1>
                        <p style="margin: 0; color: #C9A962; font-size: 13px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase;">
                          Virtual Tours
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 35px; color: #F5F1E6; font-size: 15px; line-height: 1.7;">
                  ${content}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #0D1B2A; padding: 30px 35px; border-top: 1px solid #2A3B4D;">
                  <!-- Company Info -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding-bottom: 20px;">
                        <p style="margin: 0 0 8px; color: #C9A962; font-size: 14px; font-weight: 600;">
                          Z360 Virtual Tours
                        </p>
                        <p style="margin: 0; color: #6B7B8A; font-size: 12px;">
                          Professional 360° Virtual Tour Services | Balkans Region
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-bottom: 20px;">
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="padding: 0 12px;">
                              <a href="mailto:z360virtualtours@gmail.com" style="color: #C9A962; text-decoration: none; font-size: 13px;">
                                ✉️ z360virtualtours@gmail.com
                              </a>
                            </td>
                            <td style="color: #3A4B5C;">|</td>
                            <td style="padding: 0 12px;">
                              <a href="tel:+38971967915" style="color: #C9A962; text-decoration: none; font-size: 13px;">
                                📞 +389 71 967 915
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-top: 15px; border-top: 1px solid #2A3B4D;">
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="padding: 0 10px;">
                              <a href="https://facebook.com/z360virtualtours" style="color: #6B7B8A; text-decoration: none; font-size: 12px;">Facebook</a>
                            </td>
                            <td style="padding: 0 10px;">
                              <a href="https://instagram.com/z360virtualtours" style="color: #6B7B8A; text-decoration: none; font-size: 12px;">Instagram</a>
                            </td>
                            <td style="padding: 0 10px;">
                              <a href="https://linkedin.com/company/z360virtualtours" style="color: #6B7B8A; text-decoration: none; font-size: 12px;">LinkedIn</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Unsubscribe / Legal -->
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">
              <tr>
                <td align="center" style="padding: 20px;">
                  <p style="margin: 0; color: #4A5568; font-size: 11px; line-height: 1.6;">
                    © ${new Date().getFullYear()} Z360 Virtual Tours. All rights reserved.<br>
                    You're receiving this email because you interacted with our booking system.
                  </p>
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
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; width: 60px; height: 60px; background-color: #22c55e20; border-radius: 50%; line-height: 60px; margin-bottom: 15px;">
          <span style="font-size: 28px;">✓</span>
        </div>
        <h2 style="color: #C9A962; margin: 0 0 8px; font-size: 24px; font-weight: 600;">Thank You for Your Request!</h2>
        <p style="margin: 0; color: #8B9AAD; font-size: 14px;">We've received your booking and will be in touch soon</p>
      </div>

      <p style="font-size: 16px; line-height: 1.7; margin-bottom: 25px;">
        Hi <strong style="color: #C9A962;">${data.clientName}</strong>,
      </p>

      <p style="font-size: 15px; line-height: 1.7; color: #D4D9E0; margin-bottom: 30px;">
        Thank you for choosing Z360 Virtual Tours! We've received your booking request and our team will review it shortly. You'll receive a confirmed quote within <strong>24 hours</strong>.
      </p>

      <!-- Reference Box -->
      <div style="background: linear-gradient(135deg, #0D1B2A 0%, #162232 100%); border-radius: 14px; padding: 25px; margin: 25px 0; text-align: center; border: 1px solid #2A3B4D;">
        <p style="margin: 0 0 8px; color: #8B9AAD; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px;">Your Reference Number</p>
        <p style="margin: 0; font-size: 28px; font-weight: 700; color: #C9A962; font-family: 'SF Mono', Monaco, 'Courier New', monospace; letter-spacing: 2px;">
          #${data.bookingId.slice(-8).toUpperCase()}
        </p>
        <p style="margin: 10px 0 0; color: #6B7B8A; font-size: 12px;">
          Save this for your records
        </p>
      </div>

      <!-- Booking Details -->
      <div style="background-color: #0D1B2A; border-radius: 12px; padding: 25px; margin: 25px 0;">
        <h3 style="color: #C9A962; margin: 0 0 20px; font-size: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Booking Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 14px 0; border-bottom: 1px solid #2A3B4D; color: #8B9AAD; font-size: 14px;">Property Address</td>
            <td style="padding: 14px 0; border-bottom: 1px solid #2A3B4D; text-align: right; color: #F5F1E6; font-size: 14px;">${data.propertyAddress}</td>
          </tr>
          ${data.preferredDate ? `
          <tr>
            <td style="padding: 14px 0; border-bottom: 1px solid #2A3B4D; color: #8B9AAD; font-size: 14px;">Preferred Date</td>
            <td style="padding: 14px 0; border-bottom: 1px solid #2A3B4D; text-align: right; color: #F5F1E6; font-size: 14px;">${new Date(data.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 14px 0; border-bottom: 1px solid #2A3B4D; color: #8B9AAD; font-size: 14px;">Estimated Total</td>
            <td style="padding: 14px 0; border-bottom: 1px solid #2A3B4D; text-align: right; font-weight: 700; color: #C9A962; font-size: 18px;">€${data.totalQuote.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 14px 0; color: #8B9AAD; font-size: 14px;">Deposit Required</td>
            <td style="padding: 14px 0; text-align: right; color: #F5F1E6; font-size: 14px;">€${data.depositAmount.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 13px; color: #6B7B8A; line-height: 1.6; text-align: center; font-style: italic;">
        * Final pricing will be confirmed after we review your request details
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="${BASE_URL}/booking/status?id=${data.bookingId}" style="display: inline-block; background: linear-gradient(135deg, #C9A962 0%, #A88B4A 100%); color: #0D1B2A; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 15px rgba(201, 169, 98, 0.3);">
          Track Your Booking
        </a>
      </div>

      <!-- What's Next Section -->
      <div style="background-color: #0D1B2A; border-radius: 12px; padding: 20px; margin-top: 25px; border-left: 4px solid #3b82f6;">
        <h4 style="color: #3b82f6; margin: 0 0 12px; font-size: 14px; font-weight: 600;">What happens next?</h4>
        <p style="margin: 0; color: #D4D9E0; font-size: 14px; line-height: 1.7;">
          Our team will review your request and send you a confirmed quote within 24 hours. Once you approve and pay the deposit, we'll schedule your photo shoot.
        </p>
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
      <div style="text-align: center; margin-bottom: 25px;">
        <h2 style="color: #C9A962; margin: 0 0 10px; font-size: 26px; font-weight: 600;">Your Quote is Ready!</h2>
        <p style="margin: 0; color: #8B9AAD; font-size: 14px;">Reference: <span style="font-family: monospace; color: #F5F1E6;">#${data.bookingId.slice(-8).toUpperCase()}</span></p>
      </div>

      <p style="font-size: 16px; line-height: 1.7; margin-bottom: 20px;">
        Hi <strong style="color: #C9A962;">${data.clientName}</strong>,
      </p>

      <p style="font-size: 15px; line-height: 1.7; color: #D4D9E0; margin-bottom: 30px;">
        Thank you for your interest in our virtual tour services! We've carefully reviewed your request and prepared a personalized quote for you.
      </p>

      <!-- Quote Box -->
      <div style="background: linear-gradient(135deg, #0D1B2A 0%, #162232 100%); border-radius: 16px; padding: 30px; margin: 25px 0; text-align: center; border: 1px solid #2A3B4D;">
        <p style="margin: 0 0 8px; color: #8B9AAD; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px;">Total Quote</p>
        <p style="margin: 0 0 25px; font-size: 42px; font-weight: 700; color: #C9A962; line-height: 1;">€${data.totalQuote.toFixed(2)}</p>

        <div style="background-color: #1B2838; border-radius: 10px; padding: 15px; display: inline-block;">
          <p style="margin: 0; color: #8B9AAD; font-size: 13px;">
            Deposit to confirm booking
          </p>
          <p style="margin: 5px 0 0; color: #F5F1E6; font-size: 22px; font-weight: 600;">
            €${data.depositAmount.toFixed(2)}
          </p>
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="${data.paymentUrl}" style="display: inline-block; background: linear-gradient(135deg, #C9A962 0%, #A88B4A 100%); color: #0D1B2A; text-decoration: none; padding: 18px 50px; border-radius: 10px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 15px rgba(201, 169, 98, 0.3);">
          Pay Deposit & Confirm Booking
        </a>
      </div>

      <!-- What's Next Section -->
      <div style="background-color: #0D1B2A; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #C9A962;">
        <h3 style="color: #C9A962; margin: 0 0 15px; font-size: 16px; font-weight: 600;">What happens next?</h3>
        <ol style="color: #D4D9E0; line-height: 2; padding-left: 20px; margin: 0; font-size: 14px;">
          <li>Pay your deposit to secure your booking</li>
          <li>We'll contact you to schedule the photo shoot</li>
          <li>Our team will capture stunning 360° imagery of your property</li>
          <li>Receive your professional virtual tour within 3-5 business days</li>
        </ol>
      </div>

      <!-- Validity Notice -->
      <div style="text-align: center; padding: 15px; background-color: #f59e0b15; border-radius: 8px; margin-top: 25px;">
        <p style="margin: 0; font-size: 14px; color: #f59e0b;">
          ⏰ This quote is valid for <strong>${data.validDays} days</strong>
        </p>
      </div>

      <!-- Questions Section -->
      <p style="font-size: 14px; color: #8B9AAD; line-height: 1.6; margin-top: 30px; text-align: center;">
        Have questions about your quote? Feel free to reply to this email or contact us directly.
      </p>
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
  }) => {
    // Status-specific colors and icons
    const statusStyles: Record<string, { color: string; icon: string; bgColor: string }> = {
      confirmed: { color: '#22c55e', icon: '✓', bgColor: '#22c55e20' },
      scheduled: { color: '#3b82f6', icon: '📅', bgColor: '#3b82f620' },
      in_progress: { color: '#f59e0b', icon: '🔄', bgColor: '#f59e0b20' },
      editing: { color: '#8b5cf6', icon: '✨', bgColor: '#8b5cf620' },
      delivered: { color: '#22c55e', icon: '🎉', bgColor: '#22c55e20' },
      completed: { color: '#22c55e', icon: '🎊', bgColor: '#22c55e20' },
      cancelled: { color: '#ef4444', icon: '✕', bgColor: '#ef444420' },
      default: { color: '#C9A962', icon: 'ℹ', bgColor: '#C9A96220' },
    }
    const style = statusStyles[data.status] || statusStyles.default

    return {
      subject: `Booking Update: ${data.statusLabel} - Z360 Virtual Tours`,
      html: baseTemplate(`
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #C9A962; margin: 0 0 8px; font-size: 24px; font-weight: 600;">Booking Status Update</h2>
          <p style="margin: 0; color: #8B9AAD; font-size: 14px;">Reference: <span style="font-family: monospace; color: #F5F1E6;">#${data.bookingId.slice(-8).toUpperCase()}</span></p>
        </div>

        <p style="font-size: 16px; line-height: 1.7; margin-bottom: 25px;">
          Hi <strong style="color: #C9A962;">${data.clientName}</strong>,
        </p>

        <!-- Status Badge -->
        <div style="background: linear-gradient(135deg, #0D1B2A 0%, #162232 100%); border-radius: 16px; padding: 30px; margin: 25px 0; text-align: center; border: 1px solid #2A3B4D;">
          <div style="display: inline-block; width: 56px; height: 56px; background-color: ${style.bgColor}; border-radius: 50%; line-height: 56px; margin-bottom: 15px;">
            <span style="font-size: 26px;">${style.icon}</span>
          </div>
          <p style="margin: 0 0 8px; color: #8B9AAD; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px;">Current Status</p>
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: ${style.color};">${data.statusLabel}</p>
        </div>

        <!-- Message -->
        <div style="background-color: #0D1B2A; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid ${style.color};">
          <p style="margin: 0; font-size: 15px; line-height: 1.8; color: #D4D9E0;">
            ${data.message}
          </p>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 35px 0;">
          <a href="${BASE_URL}/booking/status?id=${data.bookingId}" style="display: inline-block; background: linear-gradient(135deg, #C9A962 0%, #A88B4A 100%); color: #0D1B2A; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 15px rgba(201, 169, 98, 0.3);">
            View Full Details
          </a>
        </div>

        <p style="font-size: 14px; color: #8B9AAD; line-height: 1.6; margin-top: 30px; text-align: center;">
          Questions about your booking? Reply to this email or contact us directly.
        </p>
      `),
    }
  },

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
