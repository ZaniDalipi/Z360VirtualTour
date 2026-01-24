import nodemailer from 'nodemailer'

// Email transporter configuration
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email] Email credentials not configured')
    return null
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

const transporter = createTransporter()
const FROM_EMAIL = process.env.EMAIL_USER || 'noreply@z360tours.com'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000'

// Email templates
const emailStyles = `
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #0D1B2A; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #142536; border-radius: 12px; padding: 40px; border: 1px solid rgba(201, 169, 98, 0.2); }
    .logo { text-align: center; margin-bottom: 30px; }
    .logo h1 { color: #C9A962; font-size: 28px; margin: 0; }
    .content { color: #E8DCC4; line-height: 1.6; }
    .content h2 { color: #E8DCC4; margin-top: 0; }
    .content p { margin: 16px 0; }
    .btn { display: inline-block; background-color: #C9A962; color: #0D1B2A !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .btn:hover { background-color: #D4B896; }
    .code { background-color: #1C3247; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .code span { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #C9A962; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(201, 169, 98, 0.2); }
    .footer p { color: #9A9082; font-size: 12px; margin: 8px 0; }
    .info-box { background-color: #1C3247; padding: 16px; border-radius: 8px; margin: 20px 0; }
    .info-box p { margin: 8px 0; font-size: 14px; }
    .highlight { color: #C9A962; font-weight: 600; }
  </style>
`

const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${emailStyles}
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <h1>Z360 Virtual Tours</h1>
      </div>
      ${content}
      <div class="footer">
        <p>This email was sent by Z360 Virtual Tours</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  </div>
</body>
</html>
`

// Generate a secure random token
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

// Generate a 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send email helper
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!transporter) {
    console.log('[Email] Transporter not configured, skipping email')
    console.log('[Email] Would send to:', to)
    console.log('[Email] Subject:', subject)
    return false
  }

  try {
    await transporter.sendMail({
      from: `"Z360 Virtual Tours" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    })
    console.log('[Email] Sent successfully to:', to)
    return true
  } catch (error) {
    console.error('[Email] Failed to send:', error)
    return false
  }
}

// ============================================
// EMAIL TEMPLATES
// ============================================

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<boolean> {
  const verifyUrl = `${BASE_URL}/verify-email?token=${token}`

  const content = `
    <div class="content">
      <h2>Verify Your Email</h2>
      <p>Hi ${name},</p>
      <p>Thank you for creating an account with Z360 Virtual Tours. Please verify your email address to complete your registration.</p>
      <p style="text-align: center;">
        <a href="${verifyUrl}" class="btn">Verify Email Address</a>
      </p>
      <div class="info-box">
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #C9A962;">${verifyUrl}</p>
      </div>
      <p>This link will expire in <span class="highlight">24 hours</span>.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    </div>
  `

  return sendEmail(email, 'Verify Your Email - Z360 Virtual Tours', emailWrapper(content))
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<boolean> {
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`

  const content = `
    <div class="content">
      <h2>Reset Your Password</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below to create a new password.</p>
      <p style="text-align: center;">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </p>
      <div class="info-box">
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #C9A962;">${resetUrl}</p>
      </div>
      <p>This link will expire in <span class="highlight">1 hour</span>.</p>
      <p>If you didn't request a password reset, please ignore this email or contact us if you have concerns.</p>
    </div>
  `

  return sendEmail(email, 'Reset Your Password - Z360 Virtual Tours', emailWrapper(content))
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const content = `
    <div class="content">
      <h2>Welcome to Z360 Virtual Tours!</h2>
      <p>Hi ${name},</p>
      <p>Your email has been verified and your account is now active. We're excited to have you on board!</p>
      <p>With Z360 Virtual Tours, you can:</p>
      <ul style="color: #E8DCC4;">
        <li>Request quotes for virtual tour services</li>
        <li>Track your project progress</li>
        <li>Access your completed tours</li>
        <li>Communicate directly with our team</li>
      </ul>
      <p style="text-align: center;">
        <a href="${BASE_URL}/quote" class="btn">Request a Quote</a>
      </p>
      <p>If you have any questions, don't hesitate to reach out!</p>
    </div>
  `

  return sendEmail(email, 'Welcome to Z360 Virtual Tours!', emailWrapper(content))
}

export async function sendQuoteReceivedEmail(
  email: string,
  name: string,
  quoteNumber: string,
  propertyAddress: string,
  preferredCallTime: string
): Promise<boolean> {
  const callTimeLabels: Record<string, string> = {
    morning: '9:00 AM - 12:00 PM',
    afternoon: '12:00 PM - 5:00 PM',
    evening: '5:00 PM - 8:00 PM',
  }

  const content = `
    <div class="content">
      <h2>Quote Request Received</h2>
      <p>Hi ${name},</p>
      <p>Thank you for your interest in Z360 Virtual Tours! We've received your quote request and will be in touch soon.</p>

      <div class="info-box">
        <p><span class="highlight">Quote Number:</span> ${quoteNumber}</p>
        <p><span class="highlight">Property:</span> ${propertyAddress}</p>
        <p><span class="highlight">Preferred Call Time:</span> ${callTimeLabels[preferredCallTime] || preferredCallTime}</p>
      </div>

      <h3 style="color: #C9A962;">What Happens Next?</h3>
      <ol style="color: #E8DCC4;">
        <li>Our team will review your request</li>
        <li>We'll call you at your preferred time to discuss your project</li>
        <li>After our conversation, we'll send you a detailed quote</li>
        <li>Once you accept, we'll schedule your virtual tour shoot</li>
      </ol>

      <p>We typically respond within <span class="highlight">24-48 hours</span>.</p>

      <p>If you have any urgent questions, feel free to call us directly.</p>
    </div>
  `

  return sendEmail(email, `Quote Request Received - ${quoteNumber}`, emailWrapper(content))
}

export async function sendCallbackScheduledEmail(
  email: string,
  name: string,
  quoteNumber: string,
  callbackDate: Date
): Promise<boolean> {
  const formattedDate = callbackDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const formattedTime = callbackDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const content = `
    <div class="content">
      <h2>Callback Scheduled</h2>
      <p>Hi ${name},</p>
      <p>Great news! We've scheduled a call to discuss your virtual tour project.</p>

      <div class="code">
        <p style="color: #E8DCC4; margin-bottom: 10px;">Scheduled Call:</p>
        <span style="font-size: 20px; letter-spacing: 0;">${formattedDate}</span>
        <br>
        <span>${formattedTime}</span>
      </div>

      <div class="info-box">
        <p><span class="highlight">Quote Number:</span> ${quoteNumber}</p>
      </div>

      <p>Please make sure you're available at the scheduled time. If you need to reschedule, please let us know as soon as possible.</p>

      <p>During the call, we'll discuss:</p>
      <ul style="color: #E8DCC4;">
        <li>Your property and specific requirements</li>
        <li>Recommended tour features</li>
        <li>Pricing and timeline</li>
        <li>Any questions you may have</li>
      </ul>
    </div>
  `

  return sendEmail(email, `Callback Scheduled - ${quoteNumber}`, emailWrapper(content))
}

export async function sendQuoteReadyEmail(
  email: string,
  name: string,
  quoteNumber: string,
  totalPrice: number,
  validUntil: Date
): Promise<boolean> {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(totalPrice)

  const formattedDate = validUntil.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const content = `
    <div class="content">
      <h2>Your Quote is Ready!</h2>
      <p>Hi ${name},</p>
      <p>Following our conversation, we've prepared your personalized quote for the virtual tour project.</p>

      <div class="code">
        <p style="color: #E8DCC4; margin-bottom: 10px;">Total Quote:</p>
        <span style="font-size: 28px; letter-spacing: 0;">${formattedPrice}</span>
      </div>

      <div class="info-box">
        <p><span class="highlight">Quote Number:</span> ${quoteNumber}</p>
        <p><span class="highlight">Valid Until:</span> ${formattedDate}</p>
      </div>

      <p>To proceed with your virtual tour, simply give us a call or reply to this email to confirm.</p>

      <p style="text-align: center;">
        <a href="${BASE_URL}/contact" class="btn">Contact Us to Proceed</a>
      </p>

      <p>If you have any questions about the quote, we're happy to discuss further.</p>
    </div>
  `

  return sendEmail(email, `Your Quote is Ready - ${quoteNumber}`, emailWrapper(content))
}

export async function sendQuoteStatusUpdateEmail(
  email: string,
  name: string,
  quoteNumber: string,
  status: string,
  message?: string
): Promise<boolean> {
  const statusLabels: Record<string, string> = {
    callback_scheduled: 'Callback Scheduled',
    quoted: 'Quote Ready',
    accepted: 'Quote Accepted',
    declined: 'Quote Declined',
    expired: 'Quote Expired',
  }

  const content = `
    <div class="content">
      <h2>Quote Status Update</h2>
      <p>Hi ${name},</p>
      <p>There's an update on your quote request.</p>

      <div class="info-box">
        <p><span class="highlight">Quote Number:</span> ${quoteNumber}</p>
        <p><span class="highlight">New Status:</span> ${statusLabels[status] || status}</p>
      </div>

      ${message ? `<p>${message}</p>` : ''}

      <p>If you have any questions, please don't hesitate to contact us.</p>

      <p style="text-align: center;">
        <a href="${BASE_URL}/contact" class="btn">Contact Us</a>
      </p>
    </div>
  `

  return sendEmail(email, `Quote Update - ${quoteNumber}`, emailWrapper(content))
}

// Admin notification
export async function sendNewQuoteNotification(
  quoteNumber: string,
  clientName: string,
  clientEmail: string,
  clientPhone: string,
  propertyAddress: string,
  preferredCallTime: string
): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return false

  const callTimeLabels: Record<string, string> = {
    morning: '9:00 AM - 12:00 PM',
    afternoon: '12:00 PM - 5:00 PM',
    evening: '5:00 PM - 8:00 PM',
  }

  const content = `
    <div class="content">
      <h2>New Quote Request</h2>
      <p>A new quote request has been submitted.</p>

      <div class="info-box">
        <p><span class="highlight">Quote Number:</span> ${quoteNumber}</p>
        <p><span class="highlight">Client:</span> ${clientName}</p>
        <p><span class="highlight">Email:</span> ${clientEmail}</p>
        <p><span class="highlight">Phone:</span> ${clientPhone}</p>
        <p><span class="highlight">Property:</span> ${propertyAddress}</p>
        <p><span class="highlight">Preferred Call Time:</span> ${callTimeLabels[preferredCallTime] || preferredCallTime}</p>
      </div>

      <p style="text-align: center;">
        <a href="${BASE_URL}/admin/quotes" class="btn">View in Dashboard</a>
      </p>
    </div>
  `

  return sendEmail(adminEmail, `New Quote Request - ${quoteNumber}`, emailWrapper(content))
}
