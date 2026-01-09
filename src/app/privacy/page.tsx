import { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Shield, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Z360 Virtual Tours',
  description: 'Learn how Z360 Virtual Tours collects, uses, and protects your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-navy pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-cream-muted hover:text-gold transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-cream">Privacy Policy</h1>
              <p className="text-cream-muted text-sm">Last updated: January 2025</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-gold max-w-none">
            <div className="bg-navy-dark rounded-xl border border-gold/10 p-6 sm:p-8 space-y-8">

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">1. Introduction</h2>
                <p className="text-cream-muted leading-relaxed">
                  Z360 Virtual Tours (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                  when you visit our website or use our virtual tour services.
                </p>
                <p className="text-cream-muted leading-relaxed mt-3">
                  Please read this privacy policy carefully. If you do not agree with the terms of this
                  privacy policy, please do not access the site.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">2. Information We Collect</h2>

                <h3 className="text-lg font-medium text-cream mt-4 mb-2">Personal Data</h3>
                <p className="text-cream-muted leading-relaxed">
                  We may collect personally identifiable information that you voluntarily provide to us when you:
                </p>
                <ul className="list-disc pl-6 text-cream-muted space-y-2 mt-2">
                  <li>Register on our website</li>
                  <li>Request a quote or book a service</li>
                  <li>Subscribe to our newsletter</li>
                  <li>Fill out a contact form</li>
                  <li>Participate in promotions or surveys</li>
                </ul>
                <p className="text-cream-muted leading-relaxed mt-3">
                  This information may include your name, email address, phone number, business name,
                  property address, and payment information.
                </p>

                <h3 className="text-lg font-medium text-cream mt-4 mb-2">Automatically Collected Data</h3>
                <p className="text-cream-muted leading-relaxed">
                  When you access our website, we may automatically collect certain information including:
                </p>
                <ul className="list-disc pl-6 text-cream-muted space-y-2 mt-2">
                  <li>IP address and browser type</li>
                  <li>Device information and operating system</li>
                  <li>Pages visited and time spent on pages</li>
                  <li>Referring website addresses</li>
                  <li>Geographic location (country/city level)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">3. How We Use Your Information</h2>
                <p className="text-cream-muted leading-relaxed">
                  We use the information we collect for various purposes, including:
                </p>
                <ul className="list-disc pl-6 text-cream-muted space-y-2 mt-2">
                  <li>Providing, operating, and maintaining our services</li>
                  <li>Processing your bookings and payments</li>
                  <li>Sending administrative information and service updates</li>
                  <li>Responding to your inquiries and requests</li>
                  <li>Personalizing your experience on our website</li>
                  <li>Analyzing usage patterns to improve our services</li>
                  <li>Sending marketing communications (with your consent)</li>
                  <li>Protecting against fraudulent or illegal activity</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">4. Sharing Your Information</h2>
                <p className="text-cream-muted leading-relaxed">
                  We may share your information in the following situations:
                </p>
                <ul className="list-disc pl-6 text-cream-muted space-y-2 mt-2">
                  <li>
                    <strong className="text-cream">Service Providers:</strong> With third parties who perform
                    services on our behalf (hosting, payment processing, email delivery)
                  </li>
                  <li>
                    <strong className="text-cream">Business Transfers:</strong> In connection with a merger,
                    acquisition, or sale of assets
                  </li>
                  <li>
                    <strong className="text-cream">Legal Obligations:</strong> When required by law or to
                    protect our rights and safety
                  </li>
                  <li>
                    <strong className="text-cream">With Your Consent:</strong> For any other purpose with
                    your explicit consent
                  </li>
                </ul>
                <p className="text-cream-muted leading-relaxed mt-3">
                  We do not sell your personal information to third parties.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">5. Cookies and Tracking</h2>
                <p className="text-cream-muted leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your experience.
                  For detailed information about how we use cookies, please see our{' '}
                  <Link href="/cookies" className="text-gold hover:underline">
                    Cookie Policy
                  </Link>.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">6. Data Security</h2>
                <p className="text-cream-muted leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect
                  your personal information. However, no method of transmission over the Internet
                  or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">7. Data Retention</h2>
                <p className="text-cream-muted leading-relaxed">
                  We retain your personal information only for as long as necessary to fulfill the
                  purposes outlined in this privacy policy, unless a longer retention period is
                  required or permitted by law.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">8. Your Rights</h2>
                <p className="text-cream-muted leading-relaxed">
                  Depending on your location, you may have certain rights regarding your personal data:
                </p>
                <ul className="list-disc pl-6 text-cream-muted space-y-2 mt-2">
                  <li>Right to access your personal data</li>
                  <li>Right to rectify inaccurate data</li>
                  <li>Right to request deletion of your data</li>
                  <li>Right to restrict or object to processing</li>
                  <li>Right to data portability</li>
                  <li>Right to withdraw consent at any time</li>
                </ul>
                <p className="text-cream-muted leading-relaxed mt-3">
                  To exercise these rights, please contact us using the information below.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">9. Third-Party Links</h2>
                <p className="text-cream-muted leading-relaxed">
                  Our website may contain links to third-party websites. We are not responsible for
                  the privacy practices or content of these external sites. We encourage you to
                  review the privacy policies of any third-party sites you visit.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">10. Children&apos;s Privacy</h2>
                <p className="text-cream-muted leading-relaxed">
                  Our services are not intended for individuals under the age of 18. We do not
                  knowingly collect personal information from children. If you believe we have
                  collected information from a minor, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">11. Changes to This Policy</h2>
                <p className="text-cream-muted leading-relaxed">
                  We may update this privacy policy from time to time. We will notify you of any
                  changes by posting the new policy on this page and updating the &quot;Last updated&quot;
                  date. We encourage you to review this policy periodically.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">12. Contact Us</h2>
                <p className="text-cream-muted leading-relaxed">
                  If you have questions or concerns about this privacy policy or our data practices,
                  please contact us at:
                </p>
                <div className="mt-4 p-4 bg-navy-medium rounded-lg">
                  <p className="text-cream font-medium">Z360 Virtual Tours</p>
                  <p className="text-cream-muted mt-2">
                    Email:{' '}
                    <a href="mailto:z360virtualtours@gmail.com" className="text-gold hover:underline">
                      z360virtualtours@gmail.com
                    </a>
                  </p>
                  <p className="text-cream-muted">
                    Phone:{' '}
                    <a href="tel:+38971967915" className="text-gold hover:underline">
                      +389 71 967 915
                    </a>
                  </p>
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
