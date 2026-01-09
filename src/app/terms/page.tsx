import { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { FileText, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | Z360 Virtual Tours',
  description: 'Terms and conditions for using Z360 Virtual Tours services.',
}

export default function TermsOfServicePage() {
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
              <FileText className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-cream">Terms of Service</h1>
              <p className="text-cream-muted text-sm">Last updated: January 2025</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-gold max-w-none">
            <div className="bg-navy-dark rounded-xl border border-gold/10 p-6 sm:p-8 space-y-8">

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">1. Agreement to Terms</h2>
                <p className="text-cream-muted leading-relaxed">
                  By accessing or using the Z360 Virtual Tours website and services, you agree to be bound
                  by these Terms of Service and all applicable laws and regulations. If you do not agree
                  with any of these terms, you are prohibited from using or accessing our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">2. Description of Services</h2>
                <p className="text-cream-muted leading-relaxed">
                  Z360 Virtual Tours provides professional 360° virtual tour creation services for
                  real estate, businesses, hospitality venues, and other properties. Our services include:
                </p>
                <ul className="list-disc pl-6 text-cream-muted space-y-2 mt-2">
                  <li>On-site 360° photography and capture</li>
                  <li>Virtual tour creation and editing</li>
                  <li>Tour hosting and embedding solutions</li>
                  <li>Custom branding and hotspot integration</li>
                  <li>Tour maintenance and updates</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">3. Booking and Payment</h2>

                <h3 className="text-lg font-medium text-cream mt-4 mb-2">3.1 Booking Process</h3>
                <p className="text-cream-muted leading-relaxed">
                  All bookings must be made through our website or by direct contact with our team.
                  A booking is confirmed only after we have accepted your request and you have made
                  the required deposit payment.
                </p>

                <h3 className="text-lg font-medium text-cream mt-4 mb-2">3.2 Payment Terms</h3>
                <ul className="list-disc pl-6 text-cream-muted space-y-2 mt-2">
                  <li>A 50% deposit is required to confirm your booking</li>
                  <li>The remaining balance is due upon delivery of the completed tour</li>
                  <li>Payments can be made via bank transfer or cash</li>
                  <li>All prices are in EUR unless otherwise specified</li>
                </ul>

                <h3 className="text-lg font-medium text-cream mt-4 mb-2">3.3 Cancellation Policy</h3>
                <ul className="list-disc pl-6 text-cream-muted space-y-2 mt-2">
                  <li>Cancellations made 48+ hours before the appointment: Full deposit refund</li>
                  <li>Cancellations made 24-48 hours before: 50% deposit refund</li>
                  <li>Cancellations made less than 24 hours before: No refund</li>
                  <li>Rescheduling is free if requested 24+ hours in advance</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">4. Client Responsibilities</h2>
                <p className="text-cream-muted leading-relaxed">
                  As a client, you agree to:
                </p>
                <ul className="list-disc pl-6 text-cream-muted space-y-2 mt-2">
                  <li>Ensure the property is accessible and ready for photography at the scheduled time</li>
                  <li>Obtain necessary permissions from property owners or managers</li>
                  <li>Provide accurate information about the property and requirements</li>
                  <li>Ensure the property is safe for our team to work in</li>
                  <li>Remove or secure any valuables or confidential materials</li>
                  <li>Be present or designate a representative during the shoot (recommended)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">5. Intellectual Property</h2>

                <h3 className="text-lg font-medium text-cream mt-4 mb-2">5.1 Ownership</h3>
                <p className="text-cream-muted leading-relaxed">
                  Upon full payment, you receive a non-exclusive license to use the virtual tour for
                  your intended purposes. Z360 Virtual Tours retains the copyright and ownership of
                  all created content.
                </p>

                <h3 className="text-lg font-medium text-cream mt-4 mb-2">5.2 Portfolio Use</h3>
                <p className="text-cream-muted leading-relaxed">
                  We reserve the right to use completed tours in our portfolio, marketing materials,
                  and case studies unless otherwise agreed in writing.
                </p>

                <h3 className="text-lg font-medium text-cream mt-4 mb-2">5.3 Restrictions</h3>
                <p className="text-cream-muted leading-relaxed">
                  You may not resell, redistribute, or sublicense the virtual tour content without
                  our written permission.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">6. Delivery and Revisions</h2>
                <ul className="list-disc pl-6 text-cream-muted space-y-2">
                  <li>Tours are typically delivered within 3-7 business days after the shoot</li>
                  <li>One round of minor revisions is included in the standard package</li>
                  <li>Additional revisions may incur extra charges</li>
                  <li>Major changes to the tour structure may require additional fees</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">7. Hosting and Maintenance</h2>
                <p className="text-cream-muted leading-relaxed">
                  Virtual tours are hosted on third-party platforms (such as Kuula, Matterport, or
                  similar services). We provide:
                </p>
                <ul className="list-disc pl-6 text-cream-muted space-y-2 mt-2">
                  <li>Initial setup and configuration of the tour</li>
                  <li>Embed codes and links for integration into your website</li>
                  <li>Technical support for tour-related issues</li>
                </ul>
                <p className="text-cream-muted leading-relaxed mt-3">
                  Ongoing hosting fees from third-party platforms are the responsibility of the client
                  unless included in a maintenance package.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">8. Limitation of Liability</h2>
                <p className="text-cream-muted leading-relaxed">
                  To the maximum extent permitted by law, Z360 Virtual Tours shall not be liable for:
                </p>
                <ul className="list-disc pl-6 text-cream-muted space-y-2 mt-2">
                  <li>Any indirect, incidental, or consequential damages</li>
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Damages resulting from third-party service interruptions</li>
                  <li>Issues arising from inaccurate information provided by the client</li>
                </ul>
                <p className="text-cream-muted leading-relaxed mt-3">
                  Our total liability shall not exceed the amount paid for the specific service in question.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">9. Force Majeure</h2>
                <p className="text-cream-muted leading-relaxed">
                  We shall not be liable for any failure or delay in performing our obligations due to
                  circumstances beyond our reasonable control, including but not limited to natural
                  disasters, acts of government, pandemic, civil unrest, or equipment failure.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">10. User Accounts</h2>
                <p className="text-cream-muted leading-relaxed">
                  If you create an account on our website, you are responsible for:
                </p>
                <ul className="list-disc pl-6 text-cream-muted space-y-2 mt-2">
                  <li>Maintaining the confidentiality of your login credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                </ul>
                <p className="text-cream-muted leading-relaxed mt-3">
                  We reserve the right to suspend or terminate accounts that violate these terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">11. Prohibited Uses</h2>
                <p className="text-cream-muted leading-relaxed">
                  You agree not to use our services or website for:
                </p>
                <ul className="list-disc pl-6 text-cream-muted space-y-2 mt-2">
                  <li>Any illegal or unauthorized purpose</li>
                  <li>Uploading malicious code or attempting to hack our systems</li>
                  <li>Impersonating another person or entity</li>
                  <li>Interfering with the proper functioning of the website</li>
                  <li>Collecting user information without consent</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">12. Governing Law</h2>
                <p className="text-cream-muted leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of
                  North Macedonia, without regard to its conflict of law provisions. Any disputes
                  arising from these terms shall be resolved in the courts of North Macedonia.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">13. Changes to Terms</h2>
                <p className="text-cream-muted leading-relaxed">
                  We reserve the right to modify these terms at any time. Changes will be effective
                  immediately upon posting to the website. Your continued use of our services after
                  any changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">14. Contact Information</h2>
                <p className="text-cream-muted leading-relaxed">
                  For questions about these Terms of Service, please contact us at:
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
