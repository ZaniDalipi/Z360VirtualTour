/**
 * LemonSqueezy Payment Integration
 *
 * Setup:
 * 1. Create account at https://lemonsqueezy.com
 * 2. Create a Store
 * 3. Create Products for your services (e.g., "Basic Tour - €150", "Premium Tour - €300")
 * 4. Get your API key from Settings > API
 * 5. Set up webhook at Settings > Webhooks pointing to /api/payments/webhook
 * 6. Add environment variables:
 *    - LEMONSQUEEZY_API_KEY=your_api_key
 *    - LEMONSQUEEZY_STORE_ID=your_store_id
 *    - LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
 */

const LEMONSQUEEZY_API_URL = 'https://api.lemonsqueezy.com/v1'

interface LemonSqueezyCheckoutOptions {
  productId: string // The variant ID from LemonSqueezy
  email?: string
  name?: string
  bookingId: string
  customData?: Record<string, string>
}

interface LemonSqueezyCheckoutResponse {
  data: {
    id: string
    attributes: {
      url: string
    }
  }
}

/**
 * Create a checkout session with LemonSqueezy
 */
export async function createCheckout(options: LemonSqueezyCheckoutOptions): Promise<string> {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  const storeId = process.env.LEMONSQUEEZY_STORE_ID

  if (!apiKey || !storeId) {
    throw new Error('LemonSqueezy API key or Store ID not configured')
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://z360virtualtours.com'

  const response = await fetch(`${LEMONSQUEEZY_API_URL}/checkouts`, {
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: options.email,
            name: options.name,
            custom: {
              booking_id: options.bookingId,
              ...options.customData,
            },
          },
          checkout_options: {
            button_color: '#C9A962',
          },
          product_options: {
            redirect_url: `${baseUrl}/payment/success?booking_id=${options.bookingId}`,
          },
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: storeId,
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: options.productId,
            },
          },
        },
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('LemonSqueezy checkout error:', error)
    throw new Error('Failed to create checkout')
  }

  const data: LemonSqueezyCheckoutResponse = await response.json()
  return data.data.attributes.url
}

/**
 * Verify webhook signature from LemonSqueezy
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret) {
    console.error('LemonSqueezy webhook secret not configured')
    return false
  }

  // LemonSqueezy uses HMAC SHA256
  const crypto = require('crypto')
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  )
}

/**
 * Get order details from LemonSqueezy
 */
export async function getOrder(orderId: string) {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  if (!apiKey) {
    throw new Error('LemonSqueezy API key not configured')
  }

  const response = await fetch(`${LEMONSQUEEZY_API_URL}/orders/${orderId}`, {
    headers: {
      'Accept': 'application/vnd.api+json',
      'Authorization': `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch order')
  }

  return response.json()
}

/**
 * Format amount in cents to display format
 */
export function formatAmount(amountInCents: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: currency,
  }).format(amountInCents / 100)
}
