// Receipt/Work Report Generator Utility

export interface WorkReportData {
  // Receipt Info
  receiptNumber: string
  generatedAt: string

  // Business Info
  businessName: string
  businessEmail: string
  businessPhone: string
  businessAddress: string

  // Client Info
  clientName: string
  clientEmail: string
  clientPhone: string | null
  companyName: string | null

  // Job Details
  jobId: string
  propertyAddress: string
  propertyCity: string | null
  serviceType: string | null
  projectDescription: string | null

  // Work Session
  workDate: string
  workStartTime: string
  workEndTime: string
  workDurationMinutes: number
  workDurationFormatted: string

  // Pricing
  basePrice: number | null
  urgencySurcharge: number | null
  travelFee: number | null
  bundleDiscount: number | null
  totalAmount: number | null
  depositAmount: number | null
  depositPaid: boolean
  balanceDue: number | null

  // Additional
  internalNotes: string | null
  workNotes: string | null
}

// Generate a unique receipt number
export function generateReceiptNumber(bookingId: string, completedAt: Date): string {
  const year = completedAt.getFullYear()
  const month = String(completedAt.getMonth() + 1).padStart(2, '0')
  const day = String(completedAt.getDate()).padStart(2, '0')
  const shortId = bookingId.slice(-6).toUpperCase()

  return `Z360-${year}${month}${day}-${shortId}`
}

// Format duration in human readable format
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`
  }
  return `${mins} minute${mins !== 1 ? 's' : ''}`
}

// Format time for display
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

// Format date for display
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// Generate HTML receipt for PDF conversion
export function generateReceiptHTML(data: WorkReportData): string {
  const primaryColor = '#D4A84B' // Gold
  const darkBg = '#0F172A' // Navy
  const lightText = '#F8F5F0' // Cream

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Work Report - ${data.receiptNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f8f9fa;
      color: #333;
      line-height: 1.6;
    }
    .receipt {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, ${darkBg} 0%, #1e293b 100%);
      color: ${lightText};
      padding: 40px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: ${primaryColor};
      margin-bottom: 8px;
    }
    .tagline {
      font-size: 14px;
      opacity: 0.8;
    }
    .receipt-badge {
      display: inline-block;
      background: ${primaryColor};
      color: ${darkBg};
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      margin-top: 20px;
    }
    .receipt-number {
      font-size: 24px;
      font-weight: bold;
      margin-top: 15px;
      letter-spacing: 2px;
    }
    .content {
      padding: 40px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: ${primaryColor};
      font-weight: 600;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #eee;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }
    .info-item {
      margin-bottom: 12px;
    }
    .info-label {
      font-size: 11px;
      text-transform: uppercase;
      color: #888;
      margin-bottom: 2px;
    }
    .info-value {
      font-size: 15px;
      color: #333;
    }
    .highlight-box {
      background: linear-gradient(135deg, ${darkBg} 0%, #1e293b 100%);
      color: ${lightText};
      padding: 25px;
      border-radius: 12px;
      margin: 25px 0;
    }
    .duration-display {
      text-align: center;
    }
    .duration-label {
      font-size: 12px;
      text-transform: uppercase;
      color: ${primaryColor};
      margin-bottom: 8px;
    }
    .duration-value {
      font-size: 36px;
      font-weight: bold;
    }
    .duration-detail {
      font-size: 14px;
      opacity: 0.7;
      margin-top: 8px;
    }
    .pricing-table {
      width: 100%;
      border-collapse: collapse;
    }
    .pricing-table tr {
      border-bottom: 1px solid #eee;
    }
    .pricing-table tr:last-child {
      border-bottom: none;
    }
    .pricing-table td {
      padding: 12px 0;
    }
    .pricing-table .label {
      color: #666;
    }
    .pricing-table .value {
      text-align: right;
      font-weight: 500;
    }
    .pricing-table .discount {
      color: #22c55e;
    }
    .pricing-table .total-row {
      border-top: 2px solid ${primaryColor};
      font-size: 18px;
      font-weight: bold;
    }
    .pricing-table .total-row td {
      padding-top: 16px;
      color: ${darkBg};
    }
    .payment-status {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-paid {
      background: #dcfce7;
      color: #166534;
    }
    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }
    .notes-box {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid ${primaryColor};
    }
    .footer {
      background: #f8f9fa;
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid #eee;
    }
    .footer-text {
      font-size: 13px;
      color: #666;
    }
    .footer-brand {
      color: ${primaryColor};
      font-weight: 600;
    }
    .qr-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
    .timestamp {
      font-size: 11px;
      color: #999;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="logo">Z360</div>
      <div class="tagline">Professional 360° Virtual Tour Services</div>
      <div class="receipt-badge">WORK COMPLETION REPORT</div>
      <div class="receipt-number">${data.receiptNumber}</div>
    </div>

    <div class="content">
      <div class="info-grid">
        <div class="section">
          <div class="section-title">Client Information</div>
          <div class="info-item">
            <div class="info-label">Name</div>
            <div class="info-value">${data.clientName}</div>
          </div>
          ${data.companyName ? `
          <div class="info-item">
            <div class="info-label">Company</div>
            <div class="info-value">${data.companyName}</div>
          </div>
          ` : ''}
          <div class="info-item">
            <div class="info-label">Email</div>
            <div class="info-value">${data.clientEmail}</div>
          </div>
          ${data.clientPhone ? `
          <div class="info-item">
            <div class="info-label">Phone</div>
            <div class="info-value">${data.clientPhone}</div>
          </div>
          ` : ''}
        </div>

        <div class="section">
          <div class="section-title">Job Location</div>
          <div class="info-item">
            <div class="info-label">Address</div>
            <div class="info-value">${data.propertyAddress}</div>
          </div>
          ${data.propertyCity ? `
          <div class="info-item">
            <div class="info-label">City</div>
            <div class="info-value">${data.propertyCity}</div>
          </div>
          ` : ''}
          ${data.serviceType ? `
          <div class="info-item">
            <div class="info-label">Service Type</div>
            <div class="info-value">${data.serviceType}</div>
          </div>
          ` : ''}
        </div>
      </div>

      <div class="highlight-box">
        <div class="duration-display">
          <div class="duration-label">Total Work Duration</div>
          <div class="duration-value">${data.workDurationFormatted}</div>
          <div class="duration-detail">
            ${data.workDate} | ${data.workStartTime} - ${data.workEndTime}
          </div>
        </div>
      </div>

      ${data.projectDescription ? `
      <div class="section">
        <div class="section-title">Project Description</div>
        <div class="notes-box">
          ${data.projectDescription}
        </div>
      </div>
      ` : ''}

      ${data.workNotes ? `
      <div class="section">
        <div class="section-title">Work Notes</div>
        <div class="notes-box">
          ${data.workNotes}
        </div>
      </div>
      ` : ''}

      <div class="section">
        <div class="section-title">Pricing Summary</div>
        <table class="pricing-table">
          ${data.basePrice ? `
          <tr>
            <td class="label">Base Service Price</td>
            <td class="value">€${data.basePrice.toFixed(2)}</td>
          </tr>
          ` : ''}
          ${data.urgencySurcharge && data.urgencySurcharge > 0 ? `
          <tr>
            <td class="label">Urgency Surcharge</td>
            <td class="value">€${data.urgencySurcharge.toFixed(2)}</td>
          </tr>
          ` : ''}
          ${data.travelFee && data.travelFee > 0 ? `
          <tr>
            <td class="label">Travel Fee</td>
            <td class="value">€${data.travelFee.toFixed(2)}</td>
          </tr>
          ` : ''}
          ${data.bundleDiscount && data.bundleDiscount > 0 ? `
          <tr>
            <td class="label">Bundle Discount</td>
            <td class="value discount">-€${data.bundleDiscount.toFixed(2)}</td>
          </tr>
          ` : ''}
          <tr class="total-row">
            <td>Total Amount</td>
            <td class="value">€${(data.totalAmount || 0).toFixed(2)}</td>
          </tr>
        </table>

        ${data.depositAmount && data.depositAmount > 0 ? `
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
          <table class="pricing-table">
            <tr>
              <td class="label">
                Deposit
                <span class="payment-status ${data.depositPaid ? 'status-paid' : 'status-pending'}">
                  ${data.depositPaid ? 'PAID' : 'PENDING'}
                </span>
              </td>
              <td class="value">€${data.depositAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td class="label">Balance Due</td>
              <td class="value" style="font-weight: bold; color: ${darkBg};">
                €${(data.balanceDue || 0).toFixed(2)}
              </td>
            </tr>
          </table>
        </div>
        ` : ''}
      </div>
    </div>

    <div class="footer">
      <p class="footer-text">
        Thank you for choosing <span class="footer-brand">Z360 Virtual Tours</span>
      </p>
      <p class="footer-text" style="margin-top: 8px;">
        Your 360° tour will be delivered according to the agreed timeline.
      </p>
      <p class="timestamp">
        Generated on ${data.generatedAt} | Job ID: ${data.jobId}
      </p>
    </div>
  </div>
</body>
</html>
`
}

// Generate plain text version for email/SMS
export function generateReceiptText(data: WorkReportData): string {
  let text = `
═══════════════════════════════════════
       Z360 VIRTUAL TOURS
       Work Completion Report
═══════════════════════════════════════

Receipt #: ${data.receiptNumber}
Date: ${data.generatedAt}

───────────────────────────────────────
CLIENT INFORMATION
───────────────────────────────────────
Name: ${data.clientName}
${data.companyName ? `Company: ${data.companyName}\n` : ''}Email: ${data.clientEmail}
${data.clientPhone ? `Phone: ${data.clientPhone}\n` : ''}
───────────────────────────────────────
JOB DETAILS
───────────────────────────────────────
Location: ${data.propertyAddress}
${data.propertyCity ? `City: ${data.propertyCity}\n` : ''}${data.serviceType ? `Service: ${data.serviceType}\n` : ''}
───────────────────────────────────────
WORK SESSION
───────────────────────────────────────
Date: ${data.workDate}
Start Time: ${data.workStartTime}
End Time: ${data.workEndTime}
Duration: ${data.workDurationFormatted}

───────────────────────────────────────
PRICING
───────────────────────────────────────
`

  if (data.basePrice) {
    text += `Base Price:        €${data.basePrice.toFixed(2)}\n`
  }
  if (data.urgencySurcharge && data.urgencySurcharge > 0) {
    text += `Urgency Fee:       €${data.urgencySurcharge.toFixed(2)}\n`
  }
  if (data.travelFee && data.travelFee > 0) {
    text += `Travel Fee:        €${data.travelFee.toFixed(2)}\n`
  }
  if (data.bundleDiscount && data.bundleDiscount > 0) {
    text += `Bundle Discount:  -€${data.bundleDiscount.toFixed(2)}\n`
  }

  text += `───────────────────────────────────────
TOTAL:             €${(data.totalAmount || 0).toFixed(2)}
`

  if (data.depositAmount && data.depositAmount > 0) {
    text += `
Deposit ${data.depositPaid ? '(Paid)' : '(Pending)'}: €${data.depositAmount.toFixed(2)}
Balance Due:       €${(data.balanceDue || 0).toFixed(2)}
`
  }

  text += `
═══════════════════════════════════════
Thank you for choosing Z360 Virtual Tours!
═══════════════════════════════════════
`

  return text
}

// Generate CSV data for export
export function generateReceiptCSV(data: WorkReportData): string {
  const rows = [
    ['Receipt Number', data.receiptNumber],
    ['Generated At', data.generatedAt],
    [''],
    ['CLIENT INFORMATION'],
    ['Client Name', data.clientName],
    ['Company', data.companyName || ''],
    ['Email', data.clientEmail],
    ['Phone', data.clientPhone || ''],
    [''],
    ['JOB DETAILS'],
    ['Job ID', data.jobId],
    ['Property Address', data.propertyAddress],
    ['City', data.propertyCity || ''],
    ['Service Type', data.serviceType || ''],
    [''],
    ['WORK SESSION'],
    ['Work Date', data.workDate],
    ['Start Time', data.workStartTime],
    ['End Time', data.workEndTime],
    ['Duration (minutes)', String(data.workDurationMinutes)],
    ['Duration (formatted)', data.workDurationFormatted],
    [''],
    ['PRICING'],
    ['Base Price', data.basePrice?.toFixed(2) || '0.00'],
    ['Urgency Surcharge', data.urgencySurcharge?.toFixed(2) || '0.00'],
    ['Travel Fee', data.travelFee?.toFixed(2) || '0.00'],
    ['Bundle Discount', data.bundleDiscount?.toFixed(2) || '0.00'],
    ['Total Amount', data.totalAmount?.toFixed(2) || '0.00'],
    ['Deposit Amount', data.depositAmount?.toFixed(2) || '0.00'],
    ['Deposit Paid', data.depositPaid ? 'Yes' : 'No'],
    ['Balance Due', data.balanceDue?.toFixed(2) || '0.00'],
  ]

  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
}
