'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Eye,
  Share2,
  ExternalLink,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
  X,
} from 'lucide-react'
import { PublicHeader, Footer } from '@/components/layout'
import { Button, Card } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'

interface Tour {
  id: string
  title: string
  slug: string
  description: string | null
  shortDescription: string | null
  clientName: string | null
  location: string | null
  coverImage: string
  images: string[]
  tourUrl: string | null
  tourEmbed: string | null
  views: number
  createdAt: string
  category: {
    id: string
    name: string
    slug: string
  }
}

export default function TourDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [tour, setTour] = useState<Tour | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await fetch(`/api/tours/${slug}`)
        if (res.ok) {
          const data = await res.json()
          setTour(data)
        }
      } catch (error) {
        console.error('Failed to fetch tour:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      fetchTour()
    }
  }, [slug])

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = tour?.title || 'Virtual Tour'

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-blue-600/20 text-blue-400',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      color: 'hover:bg-sky-500/20 text-sky-400',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`,
      color: 'hover:bg-blue-700/20 text-blue-500',
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy">
        <PublicHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 bg-gold/10 rounded" />
            <div className="h-96 bg-gold/10 rounded-2xl" />
            <div className="h-32 bg-gold/10 rounded-xl" />
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-navy">
        <PublicHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-h2 font-bold text-cream mb-4">Tour Not Found</h1>
          <p className="text-cream-muted mb-8">
            The tour you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/tours">
            <Button>View All Tours</Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy">
      <PublicHeader />

      {/* Back Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/tours"
          className="inline-flex items-center gap-2 text-cream-muted hover:text-cream transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tours
        </Link>
      </div>

      {/* Tour Content */}
      <section className="py-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-full bg-gold/20 text-gold text-sm">
                    {tour.category.name}
                  </span>
                </div>
                <h1 className="text-display font-bold text-cream mb-2">
                  {tour.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-cream-muted">
                  {tour.clientName && (
                    <span className="text-cream-soft">{tour.clientName}</span>
                  )}
                  {tour.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {tour.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {tour.views} views
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowShareModal(true)}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                {tour.tourUrl && (
                  <a href={tour.tourUrl} target="_blank" rel="noopener noreferrer">
                    <Button>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Tour
                    </Button>
                  </a>
                )}
              </div>
            </div>

            {/* Tour Embed or Cover Image */}
            <Card className="overflow-hidden">
              {tour.tourEmbed ? (
                <div
                  className="aspect-video"
                  dangerouslySetInnerHTML={{ __html: tour.tourEmbed }}
                />
              ) : (
                <div className="relative aspect-video">
                  <Image
                    src={tour.coverImage}
                    alt={tour.title}
                    fill
                    className="object-cover"
                  />
                  {tour.tourUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-navy/60">
                      <a href={tour.tourUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="lg">
                          <ExternalLink className="w-5 h-5 mr-2" />
                          Launch Virtual Tour
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Description */}
            {tour.description && (
              <Card className="p-6">
                <h2 className="text-h4 font-semibold text-cream mb-4">
                  About This Tour
                </h2>
                <p className="text-body text-cream-muted leading-relaxed whitespace-pre-wrap">
                  {tour.description}
                </p>
              </Card>
            )}

            {/* Gallery */}
            {tour.images && tour.images.length > 0 && (
              <div>
                <h2 className="text-h4 font-semibold text-cream mb-4">
                  Gallery
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tour.images.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative aspect-[4/3] rounded-xl overflow-hidden border border-gold/20"
                    >
                      <Image
                        src={image}
                        alt={`${tour.title} - Image ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <Card className="p-8 text-center">
              <h2 className="text-h3 font-bold text-cream mb-4">
                Want a Tour Like This?
              </h2>
              <p className="text-body text-cream-muted mb-6 max-w-xl mx-auto">
                Let's create an immersive virtual tour for your space.
                Contact us to discuss your project.
              </p>
              <Link href="/contact">
                <Button size="lg">Get a Quote</Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowShareModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-h4 font-semibold text-cream">
                    Share This Tour
                  </h3>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="p-1 text-cream-muted hover:text-cream transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {shareLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-gold/20 ${link.color} transition-colors`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-sm text-cream-muted">
                          {link.name}
                        </span>
                      </a>
                    )
                  })}
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-cream-muted">
                    Or copy link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-4 py-2 rounded-xl bg-navy border border-gold/20 text-cream text-sm truncate"
                    />
                    <Button
                      variant="secondary"
                      onClick={handleCopyLink}
                      className="flex-shrink-0"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
