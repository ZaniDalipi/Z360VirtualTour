'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button, Card } from '@/components/ui'
import {
  Code, Copy, Check, Globe, Zap, Shield, ExternalLink,
  Play, Smartphone, Monitor, ChevronDown, ChevronUp
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Tour {
  id: string
  title: string
  slug: string
  clientName: string | null
  coverImage: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://z360-virtual-tour.vercel.app'

export default function IntegrationPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [selectedTour, setSelectedTour] = useState<string>('')
  const [embedWidth, setEmbedWidth] = useState('100%')
  const [embedHeight, setEmbedHeight] = useState('600')
  const [copied, setCopied] = useState<string | null>(null)
  const [openSection, setOpenSection] = useState<string | null>('embed')

  useEffect(() => {
    async function fetchTours() {
      try {
        const res = await fetch('/api/public/tours?limit=20')
        const data = await res.json()
        setTours(data.tours || [])
        if (data.tours?.length > 0) {
          setSelectedTour(data.tours[0].slug)
        }
      } catch (error) {
        console.error('Failed to fetch tours:', error)
      }
    }
    fetchTours()
  }, [])

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getEmbedCode = () => {
    return `<iframe
  src="${baseUrl}/embed/${selectedTour}"
  width="${embedWidth}"
  height="${embedHeight}"
  frameborder="0"
  allowfullscreen
  allow="xr-spatial-tracking; gyroscope; accelerometer"
  style="border-radius: 12px;"
></iframe>`
  }

  const getApiExample = () => {
    return `// Fetch all tours
fetch('${baseUrl}/api/public/tours')
  .then(res => res.json())
  .then(data => {
    console.log(data.tours);
  });

// Fetch tours by client name
fetch('${baseUrl}/api/public/client/tours?name=ClientName')
  .then(res => res.json())
  .then(data => {
    console.log(data.tours);
  });

// Fetch tours by category
fetch('${baseUrl}/api/public/tours?category=real-estate')
  .then(res => res.json())
  .then(data => {
    console.log(data.tours);
  });`
  }

  const getReactExample = () => {
    return `import { useState, useEffect } from 'react';

function TourEmbed({ tourSlug }) {
  return (
    <iframe
      src="${baseUrl}/embed/${selectedTour || '{tourSlug}'}"
      width="100%"
      height="600"
      frameBorder="0"
      allowFullScreen
      allow="xr-spatial-tracking; gyroscope; accelerometer"
      style={{ borderRadius: '12px' }}
    />
  );
}

// Usage:
// <TourEmbed tourSlug="my-property-tour" />`
  }

  const getWordPressShortcode = () => {
    return `<!-- Add this to your WordPress post or page -->
[iframe src="${baseUrl}/embed/${selectedTour}" width="100%" height="600"]

<!-- Or use raw HTML block -->
<iframe
  src="${baseUrl}/embed/${selectedTour}"
  width="100%"
  height="600"
  frameborder="0"
  allowfullscreen
></iframe>`
  }

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="border border-gold/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpenSection(openSection === id ? null : id)}
        className="w-full flex items-center justify-between p-4 sm:p-6 bg-navy-dark hover:bg-navy-medium transition-colors"
      >
        <h3 className="text-lg font-semibold text-cream">{title}</h3>
        {openSection === id ? (
          <ChevronUp className="w-5 h-5 text-gold" />
        ) : (
          <ChevronDown className="w-5 h-5 text-cream-muted" />
        )}
      </button>
      <AnimatePresence>
        {openSection === id && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-6 border-t border-gold/10">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-navy pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 text-gold text-sm mb-4">
              <Code className="w-4 h-4" />
              Integration Guide
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-cream mb-4">
              Embed Z360 Tours on Your Website
            </h1>
            <p className="text-cream-muted max-w-2xl mx-auto">
              Seamlessly integrate stunning 360° virtual tours into your website, property listings,
              or client portals. Perfect for real estate agencies and property platforms.
            </p>
          </div>

          {/* Quick Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <Card className="p-4 text-center">
              <Zap className="w-8 h-8 text-gold mx-auto mb-2" />
              <h4 className="font-medium text-cream mb-1">Easy Integration</h4>
              <p className="text-sm text-cream-muted">Copy & paste embed codes</p>
            </Card>
            <Card className="p-4 text-center">
              <Smartphone className="w-8 h-8 text-gold mx-auto mb-2" />
              <h4 className="font-medium text-cream mb-1">Fully Responsive</h4>
              <p className="text-sm text-cream-muted">Works on all devices</p>
            </Card>
            <Card className="p-4 text-center">
              <Shield className="w-8 h-8 text-gold mx-auto mb-2" />
              <h4 className="font-medium text-cream mb-1">Secure & Fast</h4>
              <p className="text-sm text-cream-muted">Hosted on our CDN</p>
            </Card>
          </div>

          {/* Integration Sections */}
          <div className="space-y-4">
            {/* Embed Code Generator */}
            <Section id="embed" title="Embed Code Generator">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    Select Tour
                  </label>
                  <select
                    value={selectedTour}
                    onChange={(e) => setSelectedTour(e.target.value)}
                    className="w-full px-4 py-3 bg-navy border border-gold/20 rounded-lg text-cream focus:border-gold focus:outline-none"
                  >
                    {tours.map((tour) => (
                      <option key={tour.id} value={tour.slug}>
                        {tour.title} {tour.clientName && `- ${tour.clientName}`}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Width
                      </label>
                      <select
                        value={embedWidth}
                        onChange={(e) => setEmbedWidth(e.target.value)}
                        className="w-full px-4 py-2 bg-navy border border-gold/20 rounded-lg text-cream focus:border-gold focus:outline-none"
                      >
                        <option value="100%">100% (Responsive)</option>
                        <option value="800px">800px</option>
                        <option value="640px">640px</option>
                        <option value="480px">480px</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Height
                      </label>
                      <select
                        value={embedHeight}
                        onChange={(e) => setEmbedHeight(e.target.value)}
                        className="w-full px-4 py-2 bg-navy border border-gold/20 rounded-lg text-cream focus:border-gold focus:outline-none"
                      >
                        <option value="600">600px</option>
                        <option value="500">500px</option>
                        <option value="400">400px</option>
                        <option value="700">700px</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-cream mb-2">
                      Embed Code
                    </label>
                    <div className="relative">
                      <pre className="bg-navy-dark border border-gold/10 rounded-lg p-4 overflow-x-auto text-xs text-cream-muted">
                        {getEmbedCode()}
                      </pre>
                      <Button
                        size="sm"
                        variant={copied === 'embed' ? 'secondary' : 'primary'}
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(getEmbedCode(), 'embed')}
                      >
                        {copied === 'embed' ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    Preview
                  </label>
                  <div className="bg-navy-dark border border-gold/10 rounded-lg p-4">
                    {selectedTour ? (
                      <iframe
                        src={`${baseUrl}/embed/${selectedTour}`}
                        width="100%"
                        height="350"
                        frameBorder="0"
                        allowFullScreen
                        allow="xr-spatial-tracking; gyroscope; accelerometer"
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="h-[350px] flex items-center justify-center text-cream-muted">
                        Select a tour to preview
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <a
                      href={`${baseUrl}/tour/${selectedTour}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gold hover:text-gold/80 flex items-center gap-1"
                    >
                      <Play className="w-4 h-4" />
                      View Full Tour
                    </a>
                    <span className="text-cream-dim">|</span>
                    <a
                      href={`${baseUrl}/embed/${selectedTour}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gold hover:text-gold/80 flex items-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Embed Page
                    </a>
                  </div>
                </div>
              </div>
            </Section>

            {/* API Integration */}
            <Section id="api" title="API Integration">
              <p className="text-cream-muted mb-4">
                Use our REST API to fetch tours programmatically and display them on your website.
                Perfect for dynamic integrations with balkanestateai.com or similar platforms.
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-cream mb-2">API Endpoints</h4>
                  <div className="bg-navy-dark border border-gold/10 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-navy-medium">
                        <tr>
                          <th className="text-left px-4 py-2 text-cream">Endpoint</th>
                          <th className="text-left px-4 py-2 text-cream">Description</th>
                        </tr>
                      </thead>
                      <tbody className="text-cream-muted">
                        <tr className="border-t border-gold/10">
                          <td className="px-4 py-2 font-mono text-xs">/api/public/tours</td>
                          <td className="px-4 py-2">List all tours</td>
                        </tr>
                        <tr className="border-t border-gold/10">
                          <td className="px-4 py-2 font-mono text-xs">/api/public/tours?category=real-estate</td>
                          <td className="px-4 py-2">Filter by category</td>
                        </tr>
                        <tr className="border-t border-gold/10">
                          <td className="px-4 py-2 font-mono text-xs">/api/public/client/tours?name=ClientName</td>
                          <td className="px-4 py-2">Tours by client name</td>
                        </tr>
                        <tr className="border-t border-gold/10">
                          <td className="px-4 py-2 font-mono text-xs">/api/public/tours/{'{slug}'}</td>
                          <td className="px-4 py-2">Get single tour by slug</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-cream mb-2">JavaScript Example</h4>
                  <div className="relative">
                    <pre className="bg-navy-dark border border-gold/10 rounded-lg p-4 overflow-x-auto text-xs text-cream-muted">
                      {getApiExample()}
                    </pre>
                    <Button
                      size="sm"
                      variant={copied === 'api' ? 'secondary' : 'primary'}
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(getApiExample(), 'api')}
                    >
                      {copied === 'api' ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Section>

            {/* React Integration */}
            <Section id="react" title="React / Next.js Integration">
              <p className="text-cream-muted mb-4">
                Easily integrate tours into your React or Next.js application with this component.
              </p>
              <div className="relative">
                <pre className="bg-navy-dark border border-gold/10 rounded-lg p-4 overflow-x-auto text-xs text-cream-muted">
                  {getReactExample()}
                </pre>
                <Button
                  size="sm"
                  variant={copied === 'react' ? 'secondary' : 'primary'}
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(getReactExample(), 'react')}
                >
                  {copied === 'react' ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </Section>

            {/* WordPress Integration */}
            <Section id="wordpress" title="WordPress Integration">
              <p className="text-cream-muted mb-4">
                Add virtual tours to your WordPress posts, pages, or property listings.
              </p>
              <div className="relative">
                <pre className="bg-navy-dark border border-gold/10 rounded-lg p-4 overflow-x-auto text-xs text-cream-muted">
                  {getWordPressShortcode()}
                </pre>
                <Button
                  size="sm"
                  variant={copied === 'wp' ? 'secondary' : 'primary'}
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(getWordPressShortcode(), 'wp')}
                >
                  {copied === 'wp' ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </Section>

            {/* Direct Links */}
            <Section id="links" title="Direct Links & QR Codes">
              <p className="text-cream-muted mb-4">
                Share tours directly with clients via links or generate QR codes for print materials.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Monitor className="w-6 h-6 text-gold" />
                    <h4 className="font-medium text-cream">Full Tour Page</h4>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={`${baseUrl}/tour/${selectedTour}`}
                      className="w-full px-3 py-2 pr-20 bg-navy border border-gold/20 rounded-lg text-sm text-cream-muted"
                    />
                    <Button
                      size="sm"
                      className="absolute right-1 top-1"
                      onClick={() => copyToClipboard(`${baseUrl}/tour/${selectedTour}`, 'tourlink')}
                    >
                      {copied === 'tourlink' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-cream-dim mt-2">
                    Full experience with navigation and branding
                  </p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe className="w-6 h-6 text-gold" />
                    <h4 className="font-medium text-cream">Embed Page</h4>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={`${baseUrl}/embed/${selectedTour}`}
                      className="w-full px-3 py-2 pr-20 bg-navy border border-gold/20 rounded-lg text-sm text-cream-muted"
                    />
                    <Button
                      size="sm"
                      className="absolute right-1 top-1"
                      onClick={() => copyToClipboard(`${baseUrl}/embed/${selectedTour}`, 'embedlink')}
                    >
                      {copied === 'embedlink' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-cream-dim mt-2">
                    Clean embed view for iframes
                  </p>
                </Card>
              </div>
            </Section>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Card className="p-8 bg-gradient-to-r from-gold/10 to-gold/5 border-gold/20">
              <h3 className="text-xl font-semibold text-cream mb-2">
                Need Custom Integration?
              </h3>
              <p className="text-cream-muted mb-4 max-w-md mx-auto">
                We can help you create a custom integration for your platform.
                Contact us for white-label solutions and API access.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="mailto:z360virtualtours@gmail.com">
                  <Button>Contact Us</Button>
                </a>
                <a href="/contact">
                  <Button variant="secondary">Request a Demo</Button>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
