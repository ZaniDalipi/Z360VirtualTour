import { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Cookie, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cookie Policy | Z360 Virtual Tours',
  description: 'Learn about how Z360 Virtual Tours uses cookies and similar technologies.',
}

export default function CookiePolicyPage() {
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
              <Cookie className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-cream">Cookie Policy</h1>
              <p className="text-cream-muted text-sm">Last updated: January 2025</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-gold max-w-none">
            <div className="bg-navy-dark rounded-xl border border-gold/10 p-6 sm:p-8 space-y-8">

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">1. What Are Cookies?</h2>
                <p className="text-cream-muted leading-relaxed">
                  Cookies are small text files that are placed on your device when you visit a website.
                  They are widely used to make websites work more efficiently, provide a better user
                  experience, and give website owners information about how their site is being used.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">2. How We Use Cookies</h2>
                <p className="text-cream-muted leading-relaxed">
                  Z360 Virtual Tours uses cookies and similar technologies for various purposes:
                </p>
                <ul className="list-disc pl-6 text-cream-muted space-y-2 mt-2">
                  <li>To ensure the website functions properly</li>
                  <li>To remember your preferences and settings</li>
                  <li>To understand how you use our website</li>
                  <li>To improve our services and user experience</li>
                  <li>To deliver relevant content and advertisements</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">3. Types of Cookies We Use</h2>

                <div className="space-y-6 mt-4">
                  {/* Necessary Cookies */}
                  <div className="p-4 bg-navy-medium rounded-lg border border-gold/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">Required</span>
                      <h3 className="text-lg font-medium text-cream">Necessary Cookies</h3>
                    </div>
                    <p className="text-cream-muted text-sm leading-relaxed">
                      These cookies are essential for the website to function properly. They enable basic
                      functions like page navigation, secure area access, and remembering your cookie
                      consent preferences. The website cannot function properly without these cookies.
                    </p>
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gold/10">
                            <th className="text-left py-2 text-cream">Cookie Name</th>
                            <th className="text-left py-2 text-cream">Purpose</th>
                            <th className="text-left py-2 text-cream">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="text-cream-muted">
                          <tr className="border-b border-gold/5">
                            <td className="py-2">z360-cookie-consent</td>
                            <td className="py-2">Stores your cookie preferences</td>
                            <td className="py-2">1 year</td>
                          </tr>
                          <tr className="border-b border-gold/5">
                            <td className="py-2">z360-auth-token</td>
                            <td className="py-2">User authentication</td>
                            <td className="py-2">7 days</td>
                          </tr>
                          <tr>
                            <td className="py-2">z360-session</td>
                            <td className="py-2">Session management</td>
                            <td className="py-2">Session</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="p-4 bg-navy-medium rounded-lg border border-gold/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">Optional</span>
                      <h3 className="text-lg font-medium text-cream">Analytics Cookies</h3>
                    </div>
                    <p className="text-cream-muted text-sm leading-relaxed">
                      These cookies help us understand how visitors interact with our website by
                      collecting and reporting information anonymously. This helps us improve our
                      website and services.
                    </p>
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gold/10">
                            <th className="text-left py-2 text-cream">Cookie Name</th>
                            <th className="text-left py-2 text-cream">Purpose</th>
                            <th className="text-left py-2 text-cream">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="text-cream-muted">
                          <tr className="border-b border-gold/5">
                            <td className="py-2">_ga</td>
                            <td className="py-2">Google Analytics - Distinguishes users</td>
                            <td className="py-2">2 years</td>
                          </tr>
                          <tr className="border-b border-gold/5">
                            <td className="py-2">_ga_*</td>
                            <td className="py-2">Google Analytics - Session state</td>
                            <td className="py-2">2 years</td>
                          </tr>
                          <tr>
                            <td className="py-2">_gid</td>
                            <td className="py-2">Google Analytics - Distinguishes users</td>
                            <td className="py-2">24 hours</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="p-4 bg-navy-medium rounded-lg border border-gold/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded">Optional</span>
                      <h3 className="text-lg font-medium text-cream">Marketing Cookies</h3>
                    </div>
                    <p className="text-cream-muted text-sm leading-relaxed">
                      These cookies are used to track visitors across websites. The intention is to
                      display ads that are relevant and engaging for the individual user.
                    </p>
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gold/10">
                            <th className="text-left py-2 text-cream">Cookie Name</th>
                            <th className="text-left py-2 text-cream">Purpose</th>
                            <th className="text-left py-2 text-cream">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="text-cream-muted">
                          <tr className="border-b border-gold/5">
                            <td className="py-2">_fbp</td>
                            <td className="py-2">Facebook Pixel - Advertising</td>
                            <td className="py-2">3 months</td>
                          </tr>
                          <tr>
                            <td className="py-2">_gcl_au</td>
                            <td className="py-2">Google Ads - Conversion tracking</td>
                            <td className="py-2">3 months</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">4. Third-Party Cookies</h2>
                <p className="text-cream-muted leading-relaxed">
                  Some cookies on our website are set by third-party services that appear on our pages:
                </p>
                <ul className="list-disc pl-6 text-cream-muted space-y-2 mt-2">
                  <li>
                    <strong className="text-cream">Virtual Tour Platforms:</strong> Kuula, Matterport,
                    CloudPano and similar services that host our virtual tours
                  </li>
                  <li>
                    <strong className="text-cream">Google Services:</strong> Google Analytics for
                    website analytics and Google Maps for location features
                  </li>
                  <li>
                    <strong className="text-cream">Social Media:</strong> Facebook, Instagram, and
                    other social platforms for sharing functionality
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">5. Managing Cookies</h2>
                <p className="text-cream-muted leading-relaxed">
                  You can manage your cookie preferences in several ways:
                </p>

                <h3 className="text-lg font-medium text-cream mt-4 mb-2">Cookie Banner</h3>
                <p className="text-cream-muted leading-relaxed">
                  When you first visit our website, you&apos;ll see a cookie banner where you can accept
                  all cookies, accept only necessary cookies, or customize your preferences.
                </p>

                <h3 className="text-lg font-medium text-cream mt-4 mb-2">Browser Settings</h3>
                <p className="text-cream-muted leading-relaxed">
                  Most web browsers allow you to control cookies through their settings. You can:
                </p>
                <ul className="list-disc pl-6 text-cream-muted space-y-2 mt-2">
                  <li>View and delete cookies stored on your device</li>
                  <li>Block all cookies or specific types of cookies</li>
                  <li>Set preferences for certain websites</li>
                  <li>Enable private/incognito browsing mode</li>
                </ul>
                <p className="text-cream-muted leading-relaxed mt-3">
                  Please note that blocking certain cookies may affect the functionality of our website.
                </p>

                <h3 className="text-lg font-medium text-cream mt-4 mb-2">Opt-Out Links</h3>
                <p className="text-cream-muted leading-relaxed">
                  You can opt out of specific third-party cookies:
                </p>
                <ul className="list-disc pl-6 text-cream-muted space-y-2 mt-2">
                  <li>
                    Google Analytics:{' '}
                    <a
                      href="https://tools.google.com/dlpage/gaoptout"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:underline"
                    >
                      tools.google.com/dlpage/gaoptout
                    </a>
                  </li>
                  <li>
                    Facebook:{' '}
                    <a
                      href="https://www.facebook.com/settings/?tab=ads"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:underline"
                    >
                      facebook.com/settings/?tab=ads
                    </a>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">6. Local Storage</h2>
                <p className="text-cream-muted leading-relaxed">
                  In addition to cookies, we may use local storage to store information in your browser.
                  Local storage is similar to cookies but can store larger amounts of data. This is used
                  for features like remembering your preferences and storing your cookie consent choices.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">7. Updates to This Policy</h2>
                <p className="text-cream-muted leading-relaxed">
                  We may update this Cookie Policy from time to time to reflect changes in our practices
                  or for operational, legal, or regulatory reasons. Please revisit this policy regularly
                  to stay informed about our use of cookies.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-cream mb-4">8. Contact Us</h2>
                <p className="text-cream-muted leading-relaxed">
                  If you have questions about our use of cookies, please contact us:
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
