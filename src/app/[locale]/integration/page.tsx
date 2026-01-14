'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Code, Copy, Check, ArrowLeft, Key, Webhook, BookOpen } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { motion } from 'framer-motion'

const codeExamples = {
  fetch: `// Fetch available tours
const response = await fetch('https://z360tours.com/api/v1/tours', {
  headers: {
    'X-API-Key': 'your-api-key'
  }
});
const tours = await response.json();`,

  booking: `// Create a booking
const response = await fetch('https://z360tours.com/api/v1/bookings', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your-api-key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    propertyAddress: '123 Main St, Skopje',
    serviceType: 'real-estate'
  })
});`,

  embed: `<!-- Embed a tour in your website -->
<iframe
  src="https://z360tours.com/embed/tour-slug"
  width="100%"
  height="600"
  frameborder="0"
  allowfullscreen
></iframe>`
}

export default function IntegrationPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyCode = async (code: string, key: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(key)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <main className="min-h-screen bg-navy pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-cream-muted hover:text-gold transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-cream mb-4">API Integration</h1>
            <p className="text-xl text-cream-muted max-w-2xl mx-auto">
              Integrate Z360 Virtual Tours into your applications with our powerful API
            </p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Key, title: 'API Keys', desc: 'Secure authentication with API keys' },
            { icon: Webhook, title: 'Webhooks', desc: 'Real-time notifications for events' },
            { icon: BookOpen, title: 'Documentation', desc: 'Comprehensive API documentation' },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-lg font-semibold text-cream mb-2">{feature.title}</h3>
                <p className="text-cream-muted">{feature.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Code Examples */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-cream">Code Examples</h2>

          {Object.entries(codeExamples).map(([key, code]) => (
            <Card key={key} className="overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-navy-medium border-b border-gold/10">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-gold" />
                  <span className="text-sm font-medium text-cream capitalize">{key}</span>
                </div>
                <button
                  onClick={() => copyCode(code, key)}
                  className="flex items-center gap-1 text-sm text-cream-muted hover:text-gold transition-colors"
                >
                  {copiedCode === key ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-sm text-cream-muted">
                <code>{code}</code>
              </pre>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Card className="p-8 inline-block">
            <h3 className="text-xl font-semibold text-cream mb-4">Ready to Get Started?</h3>
            <p className="text-cream-muted mb-6">Contact us to get your API key</p>
            <Link href="/contact">
              <Button>Request API Access</Button>
            </Link>
          </Card>
        </div>
      </div>
    </main>
  )
}
