import { Metadata } from 'next'
import Link from 'next/link'
import { Cookie, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cookie Policy | Z360 Virtual Tours',
  description: 'Learn about how Z360 Virtual Tours uses cookies and similar technologies.',
}

export default function CookiePolicyPage() {
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
            <Cookie className="w-6 h-6 text-gold" />
          </div>
          <h1 className="text-3xl font-bold text-cream">Cookie Policy</h1>
        </div>

        <div className="prose prose-invert prose-gold max-w-none">
          <p className="text-cream-muted text-lg mb-8">
            Last updated: January 2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-cream mb-4">What Are Cookies</h2>
            <p className="text-cream-muted">
              Cookies are small text files that are stored on your device when you visit our website.
              They help us provide you with a better experience by remembering your preferences and
              understanding how you use our site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-cream mb-4">How We Use Cookies</h2>
            <p className="text-cream-muted">
              We use cookies for essential website functionality, analytics, and to improve your
              browsing experience. This includes remembering your language preferences and login status.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-cream mb-4">Managing Cookies</h2>
            <p className="text-cream-muted">
              You can control and manage cookies through your browser settings. Please note that
              disabling certain cookies may affect the functionality of our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-cream mb-4">Contact Us</h2>
            <p className="text-cream-muted">
              If you have questions about our cookie policy, please contact us at{' '}
              <a href="mailto:info@z360tours.com" className="text-gold hover:underline">
                info@z360tours.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
