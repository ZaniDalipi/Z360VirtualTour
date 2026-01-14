import { Metadata } from 'next'
import Link from 'next/link'
import { FileText, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | Z360 Virtual Tours',
  description: 'Read our terms of service and conditions for using Z360 Virtual Tours services.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-navy pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-cream-muted hover:text-gold transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-gold" />
          </div>
          <h1 className="text-3xl font-bold text-cream">Terms of Service</h1>
        </div>

        <div className="prose prose-invert prose-gold max-w-none">
          <p className="text-cream-muted text-lg mb-8">
            Last updated: January 2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-cream mb-4">Acceptance of Terms</h2>
            <p className="text-cream-muted">
              By accessing or using Z360 Virtual Tours services, you agree to be bound by these
              terms of service. If you do not agree, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-cream mb-4">Services</h2>
            <p className="text-cream-muted">
              Z360 Virtual Tours provides professional 360° virtual tour photography and related
              services. Service details, pricing, and delivery timelines are specified in individual
              service agreements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-cream mb-4">Intellectual Property</h2>
            <p className="text-cream-muted">
              All content, including virtual tours, photographs, and materials created by Z360
              Virtual Tours remain our intellectual property until full payment is received and
              rights are transferred as specified in the service agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-cream mb-4">Payment Terms</h2>
            <p className="text-cream-muted">
              Payment terms are specified in individual quotes and invoices. A deposit may be
              required before work commences. Final deliverables are released upon full payment.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-cream mb-4">Limitation of Liability</h2>
            <p className="text-cream-muted">
              Z360 Virtual Tours liability is limited to the amount paid for services. We are not
              liable for indirect, incidental, or consequential damages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-cream mb-4">Contact Us</h2>
            <p className="text-cream-muted">
              For questions about these terms, please contact us at{' '}
              <a href="mailto:legal@z360tours.com" className="text-gold hover:underline">
                legal@z360tours.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
