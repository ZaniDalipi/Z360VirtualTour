import crypto from 'crypto'
import { prisma } from './prisma'

export type WebhookEvent =
  | 'booking.created'
  | 'booking.confirmed'
  | 'booking.scheduled'
  | 'booking.completed'
  | 'booking.cancelled'
  | 'tour.created'
  | 'tour.ready'
  | 'tour.updated'

interface WebhookPayload {
  event: WebhookEvent
  timestamp: string
  data: Record<string, unknown>
}

/**
 * Generate HMAC signature for webhook payload
 */
function generateSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

/**
 * Send webhook to a specific URL
 */
async function sendWebhook(
  webhookId: string,
  url: string,
  secret: string,
  payload: WebhookPayload
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const payloadString = JSON.stringify(payload)
  const signature = generateSignature(payloadString, secret)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Z360-Signature': signature,
        'X-Z360-Event': payload.event,
        'X-Z360-Timestamp': payload.timestamp,
      },
      body: payloadString,
    })

    // Update webhook record
    await prisma.webhook.update({
      where: { id: webhookId },
      data: {
        lastTriggered: new Date(),
        lastStatus: response.status,
        failureCount: response.ok ? 0 : { increment: 1 },
      },
    })

    return {
      success: response.ok,
      statusCode: response.status,
    }
  } catch (error) {
    // Update failure count
    await prisma.webhook.update({
      where: { id: webhookId },
      data: {
        lastTriggered: new Date(),
        failureCount: { increment: 1 },
      },
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Trigger webhooks for a specific event
 */
export async function triggerWebhooks(
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<void> {
  try {
    // Find all active webhooks subscribed to this event
    const webhooks = await prisma.webhook.findMany({
      where: {
        isActive: true,
        failureCount: { lt: 5 }, // Disable after 5 failures
        apiKey: {
          isActive: true,
        },
      },
    })

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    }

    // Filter webhooks that are subscribed to this event
    const subscribedWebhooks = webhooks.filter((webhook: typeof webhooks[number]) => {
      try {
        const events = JSON.parse(webhook.events) as string[]
        return events.includes(event) || events.includes('*')
      } catch {
        return false
      }
    })

    // Send webhooks in parallel (fire and forget)
    await Promise.allSettled(
      subscribedWebhooks.map((webhook: typeof webhooks[number]) =>
        sendWebhook(webhook.id, webhook.url, webhook.secret, payload)
      )
    )
  } catch (error) {
    console.error('Error triggering webhooks:', error)
  }
}

/**
 * Webhook event descriptions for documentation
 */
export const webhookEvents: Record<WebhookEvent, string> = {
  'booking.created': 'Fired when a new booking/quote request is created',
  'booking.confirmed': 'Fired when a booking is confirmed by admin',
  'booking.scheduled': 'Fired when a booking date is scheduled',
  'booking.completed': 'Fired when a booking/tour is marked as completed',
  'booking.cancelled': 'Fired when a booking is cancelled',
  'tour.created': 'Fired when a new tour is created in the system',
  'tour.ready': 'Fired when a tour is ready for viewing (published)',
  'tour.updated': 'Fired when tour details are updated',
}
