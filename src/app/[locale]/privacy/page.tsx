import { Metadata } from 'next'
import Link from 'next/link'
import { Shield, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Z360 Virtual Tours',
  description: 'Learn about how Z360 Virtual Tours collects, uses, and protects your personal information.',
}

export default function PrivacyPolicyPage() {
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
            <Shield className="w-6 h-6 text-gold" />
          </div>
          <h1 className="text-3xl font-bold text-cream">Privacy Policy</h1>
        </div>

        <div className="prose prose-invert prose-gold max-w-none">
          <p className="text-cream-muted text-lg mb-8">
            Last updated: January 2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-cream mb-4">Information We Collect</h2>
            <p className="text-cream-muted">
              We collect information you provide directly to us, such as when you create an account,
              make a booking, or contact us. This may include your name, email address, phone number,
              and company information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-cream mb-4">How We Use Your Information</h2>
            <p className="text-cream-muted">
              We use the information we collect to provide and improve our services, process your
              bookings, communicate with you, and send you marketing communications (with your consent).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-cream mb-4">Data Security</h2>
            <p className="text-cream-muted">
              We implement appropriate technical and organizational measures to protect your personal
              data against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-cream mb-4">Your Rights</h2>
            <p className="text-cream-muted">
              You have the right to access, correct, or delete your personal data. You can also
              object to processing or request data portability. Contact us to exercise these rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-cream mb-4">Contact Us</h2>
            <p className="text-cream-muted">
              For privacy-related inquiries, please contact us at{' '}
              <a href="mailto:privacy@z360tours.com" className="text-gold hover:underline">
                privacy@z360tours.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
