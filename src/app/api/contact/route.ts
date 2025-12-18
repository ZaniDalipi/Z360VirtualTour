import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

// Email configuration - uses environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'z360virtualtours@gmail.com',
    pass: process.env.EMAIL_PASS, // App password from Gmail
  },
})

async function sendEmailNotification(submission: {
  name: string
  email: string
  phone: string | null
  company: string | null
  service: string | null
  message: string
}) {
  // Only send email if EMAIL_PASS is configured
  if (!process.env.EMAIL_PASS) {
    console.log('Email notification skipped - EMAIL_PASS not configured')
    return
  }

  const mailOptions = {
    from: process.env.EMAIL_USER || 'z360virtualtours@gmail.com',
    to: 'z360virtualtours@gmail.com',
    subject: `New Contact Form Submission from ${submission.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #C9A962; border-bottom: 2px solid #C9A962; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Name:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${submission.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
              <a href="mailto:${submission.email}">${submission.email}</a>
            </td>
          </tr>
          ${submission.phone ? `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
              <a href="tel:${submission.phone}">${submission.phone}</a>
            </td>
          </tr>
          ` : ''}
          ${submission.company ? `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Company:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${submission.company}</td>
          </tr>
          ` : ''}
          ${submission.service ? `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Service:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${submission.service}</td>
          </tr>
          ` : ''}
        </table>

        <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Message:</h3>
          <p style="margin: 0; white-space: pre-wrap;">${submission.message}</p>
        </div>

        <p style="margin-top: 20px; color: #666; font-size: 12px;">
          This message was sent from the Z360 Virtual Tours contact form.
        </p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Email notification sent successfully')
  } catch (error) {
    console.error('Failed to send email notification:', error)
    // Don't throw - we still want to save the submission even if email fails
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.name || !data.email || !data.message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Save to database
    const submission = await prisma.contactSubmission.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        service: data.service || null,
        message: data.message,
      },
    })

    // Send email notification (async, don't wait)
    sendEmailNotification({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      company: data.company || null,
      service: data.service || null,
      message: data.message,
    })

    return NextResponse.json({
      success: true,
      id: submission.id,
    })
  } catch (error) {
    console.error('Failed to submit contact form:', error)
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    )
  }
}
