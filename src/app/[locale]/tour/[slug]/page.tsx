'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import {
  ArrowLeft,
  MapPin,
  Eye,
  Share2,
  ExternalLink,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
  X,
  Play,
  Calendar,
  Hash,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Maximize,
  Heart,
} from 'lucide-react'
import { PublicHeader, Footer } from '@/components/layout'
import { Button, Card, ImageGallery3D } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'

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

interface RelatedTour {
  id: string
  title: string
  slug: string
  coverImage: string
}

// Helper to safely parse images from API response (handles both string and array)
function parseImages(images: string | string[] | null | undefined): string[] {
  if (!images) return []
  if (Array.isArray(images)) return images
  try {
    const parsed = JSON.parse(images)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function TourDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const t = useTranslations('tourDetail')
  const tCta = useTranslations('cta')
  const tCommon = useTranslations('common')

  const [tour, setTour] = useState<Tour | null>(null)
  const [relatedTours, setRelatedTours] = useState<RelatedTour[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedEmbed, setCopiedEmbed] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [showFullscreen, setShowFullscreen] = useState(false)

  const baseUrl = 'https://z360-virtual-tour.vercel.app'

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await fetch(`/api/tours/${slug}`)
        if (res.ok) {
          const data = await res.json()
          // Defensively parse images to ensure it's always an array
          setTour({
            ...data,
            images: parseImages(data.images),
          })

          // Fetch related tours from same category
          const relatedRes = await fetch(`/api/tours?category=${data.category.slug}&limit=4`)
          if (relatedRes.ok) {
            const relatedData = await relatedRes.json()
            setRelatedTours(relatedData.tours?.filter((t: RelatedTour) => t.slug !== slug).slice(0, 3) || [])
          }
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

  const handleCopyEmbedUrl = async () => {
    const embedUrl = `${baseUrl}/embed/${slug}`
    await navigator.clipboard.writeText(embedUrl)
    setCopiedEmbed(true)
    setTimeout(() => setCopiedEmbed(false), 2000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
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
        <div className="animate-pulse">
          <div className="h-[70vh] bg-gold/10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="h-8 w-64 bg-gold/10 rounded mb-4" />
            <div className="h-4 w-48 bg-gold/10 rounded" />
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
          <h1 className="text-h2 font-bold text-cream mb-4">{t('notFound')}</h1>
          <p className="text-cream-muted mb-8">
            {t('notFoundMessage')}
          </p>
          <Link href="/tours">
            <Button>{t('viewAllTours')}</Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy">
      <PublicHeader />

      {/* Fixed Top Navigation Bar - Below Header */}
      <div className="sticky top-16 z-40 bg-navy-dark/95 backdrop-blur-md border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left: Back Button & Breadcrumb */}
            <div className="flex items-center gap-3">
              <Link
                href="/tours"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 text-cream transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">All Tours</span>
              </Link>
              <div className="hidden md:flex items-center gap-2 text-cream-muted text-sm">
                <span>/</span>
                <Link href={`/tours?category=${tour.category.slug}`} className="hover:text-gold transition-colors">
                  {tour.category.name}
                </Link>
                <span>/</span>
                <span className="text-cream truncate max-w-[200px]">{tour.title}</span>
              </div>
            </div>

            {/* Right: Stats & Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Tour ID */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-navy border border-gold/20 text-xs text-cream-muted">
                <Hash className="w-3 h-3" />
                <span className="font-mono">{tour.id.slice(-8)}</span>
              </div>

              {/* Views */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-navy border border-gold/20 text-xs">
                <Eye className="w-3 h-3 text-gold" />
                <span className="text-cream font-medium">{tour.views.toLocaleString()}</span>
              </div>

              {/* Date */}
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-navy border border-gold/20 text-xs text-cream-muted">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(tour.createdAt)}</span>
              </div>

              {/* Like Button */}
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-lg border transition-all ${
                  isLiked
                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                    : 'bg-navy border-gold/20 text-cream-muted hover:text-red-400 hover:border-red-400/50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>

              {/* Share Button */}
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 rounded-lg bg-navy border border-gold/20 text-cream-muted hover:text-gold hover:border-gold/50 transition-all"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* All Tours Grid */}
              <Link
                href="/tours"
                className="p-2 rounded-lg bg-navy border border-gold/20 text-cream-muted hover:text-gold hover:border-gold/50 transition-all"
              >
                <Grid3X3 className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section with Cover Image */}
      <section className="relative h-[60vh] min-h-[450px] max-h-[700px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={tour.coverImage}
            alt={tour.title}
            fill
            className="object-cover"
            priority
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-navy/30" />
        </div>

<<<<<<< HEAD:src/app/tour/[slug]/page.tsx
        {/* Fullscreen Button */}
        {tour.tourUrl && (
          <div className="absolute top-4 right-4 z-10">
            <a
              href={tour.tourUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy/60 backdrop-blur-sm border border-gold/20 text-cream hover:bg-gold hover:text-navy transition-all"
            >
              <Maximize className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Full Experience</span>
            </a>
          </div>
        )}
=======
        {/* Back Button */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy/60 backdrop-blur-sm border border-gold/20 text-cream hover:bg-navy/80 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('backToTours')}</span>
          </Link>
        </div>
>>>>>>> claude/add-translation-support-YzG9S:src/app/[locale]/tour/[slug]/page.tsx

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 md:pb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-3 sm:space-y-4"
            >
              {/* Category Badge */}
              <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-gold text-navy text-xs sm:text-sm font-semibold">
                {tour.category.name}
              </span>

              {/* Title */}
<<<<<<< HEAD:src/app/tour/[slug]/page.tsx
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-cream max-w-3xl">
=======
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-cream max-w-3xl">
>>>>>>> claude/add-translation-support-YzG9S:src/app/[locale]/tour/[slug]/page.tsx
                {tour.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base text-cream/80">
                {tour.clientName && (
                  <span className="text-cream font-medium">{tour.clientName}</span>
                )}
                {tour.location && (
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    {tour.location}
                  </span>
                )}
<<<<<<< HEAD:src/app/tour/[slug]/page.tsx
=======
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  {tour.views.toLocaleString()} {t('views')}
                </span>
>>>>>>> claude/add-translation-support-YzG9S:src/app/[locale]/tour/[slug]/page.tsx
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-2 sm:pt-4">
                {tour.tourUrl && (
<<<<<<< HEAD:src/app/tour/[slug]/page.tsx
                  <a href={tour.tourUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="group">
                      <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Start Virtual Tour
=======
                  <a href={tour.tourUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button size="lg" className="group w-full sm:w-auto">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:scale-110 transition-transform" />
                      {t('viewVirtualTour')}
>>>>>>> claude/add-translation-support-YzG9S:src/app/[locale]/tour/[slug]/page.tsx
                    </Button>
                  </a>
                )}
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setShowShareModal(true)}
                  className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 w-full sm:w-auto"
                >
                  <Share2 className="w-4 h-4 mr-2" />
<<<<<<< HEAD:src/app/tour/[slug]/page.tsx
                  Share Tour
=======
                  {t('share')}
>>>>>>> claude/add-translation-support-YzG9S:src/app/[locale]/tour/[slug]/page.tsx
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Embedded Tour Section */}
      {tour.tourEmbed && (
        <section className="bg-navy-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg sm:text-xl md:text-h3 font-bold text-cream mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
                </span>
                {t('interactiveTour')}
              </h2>
              <Card className="overflow-hidden">
                <div
                  className="aspect-video w-full"
                  dangerouslySetInnerHTML={{ __html: sanitizeEmbedHTML(tour.tourEmbed) }}
                />
              </Card>
            </motion.div>
          </div>
        </section>
      )}

      {/* Description Section */}
      {tour.description && (
        <section className="py-8 sm:py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-4 sm:p-6 md:p-8 lg:p-12">
                <h2 className="text-lg sm:text-xl md:text-h3 font-bold text-cream mb-4 sm:mb-6">
                  {t('aboutProject')}
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-cream-muted leading-relaxed whitespace-pre-wrap max-w-4xl">
                  {tour.description}
                </p>
              </Card>
            </motion.div>
          </div>
        </section>
      )}

<<<<<<< HEAD:src/app/tour/[slug]/page.tsx
      {/* Gallery Section - 3D Carousel */}
      {tour.images && tour.images.length > 0 && (
        <section className="py-12 md:py-20 bg-gradient-to-b from-navy-dark/50 to-navy overflow-hidden">
=======
      {/* Gallery Section */}
      {Array.isArray(tour.images) && tour.images.length > 0 && (
        <section className="py-8 sm:py-12 md:py-16 bg-navy-dark/50">
>>>>>>> claude/add-translation-support-YzG9S:src/app/[locale]/tour/[slug]/page.tsx
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
<<<<<<< HEAD:src/app/tour/[slug]/page.tsx
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-cream mb-3">
                  Project Gallery
                </h2>
                <p className="text-cream-muted">
                  Click on images to view in fullscreen • Use arrows or swipe to navigate
                </p>
              </div>
              <ImageGallery3D
                images={tour.images}
                title={tour.title}
                autoPlay={false}
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Related Tours Section */}
      {relatedTours.length > 0 && (
        <section className="py-12 md:py-16 bg-navy-dark/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-h3 font-bold text-cream">
                  More in {tour.category.name}
                </h2>
                <Link
                  href={`/tours?category=${tour.category.slug}`}
                  className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedTours.map((relatedTour, index) => (
                  <Link key={relatedTour.id} href={`/tour/${relatedTour.slug}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="group relative aspect-[16/10] rounded-2xl overflow-hidden border border-gold/20 hover:border-gold/50 transition-all"
                    >
                      <Image
                        src={relatedTour.coverImage}
                        alt={relatedTour.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-cream font-semibold group-hover:text-gold transition-colors line-clamp-2">
                          {relatedTour.title}
                        </h3>
                      </div>
                      {/* Hover Play Icon */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 rounded-full bg-gold/90 flex items-center justify-center">
                          <Play className="w-6 h-6 text-navy ml-1" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
=======
              <h2 className="text-lg sm:text-xl md:text-h3 font-bold text-cream mb-6 sm:mb-8">
                {t('projectGallery')}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {tour.images.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="group relative aspect-[4/3] rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden border border-gold/20"
                  >
                    <Image
                      src={image}
                      alt={`${tour.title} - Image ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
>>>>>>> claude/add-translation-support-YzG9S:src/app/[locale]/tour/[slug]/page.tsx
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-10 sm:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 sm:p-8 md:p-12 lg:p-16 text-center relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--gold)_1px,_transparent_1px)] bg-[length:24px_24px]" />
              </div>

              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl md:text-h2 lg:text-display font-bold text-cream mb-2 sm:mb-4">
                  {t('wantTourLikeThis')}
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-cream-muted mb-6 sm:mb-8 max-w-2xl mx-auto">
                  {t('wantTourDescription')}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                  <Link href="/contact" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto">
                      {t('getFreeQuote')}
                    </Button>
                  </Link>
                  <Link href="/tours" className="w-full sm:w-auto">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                      {t('viewMoreProjects')}
                    </Button>
                  </Link>
                </div>
              </div>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowShareModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-md"
            >
<<<<<<< HEAD:src/app/tour/[slug]/page.tsx
              <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-h4 font-semibold text-cream">
                    Share This Tour
=======
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-h4 font-semibold text-cream">
                    {t('shareThisTour')}
>>>>>>> claude/add-translation-support-YzG9S:src/app/[locale]/tour/[slug]/page.tsx
                  </h3>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="p-2 rounded-lg text-cream-muted hover:text-cream hover:bg-gold/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                  {shareLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl border border-gold/20 ${link.color} transition-colors`}
                      >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="text-xs sm:text-sm text-cream-muted">
                          {link.name}
                        </span>
                      </a>
                    )
                  })}
                </div>

                {/* Copy page link */}
                <div className="space-y-2">
                  <label className="text-sm text-cream-muted">
<<<<<<< HEAD:src/app/tour/[slug]/page.tsx
                    Copy page link
=======
                    {t('orCopyLink')}
>>>>>>> claude/add-translation-support-YzG9S:src/app/[locale]/tour/[slug]/page.tsx
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 min-w-0 px-3 sm:px-4 py-2 rounded-xl bg-navy border border-gold/20 text-cream text-xs sm:text-sm truncate"
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

                {/* Embed URL for BalkanEstateAI */}
                <div className="space-y-2 pt-4 mt-4 border-t border-gold/10">
                  <label className="text-sm text-cream-muted flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Embed URL for Property Listings
                  </label>
                  <p className="text-xs text-cream-muted/70 mb-2">
                    Use this URL to embed this tour in BalkanEstateAI or other property websites
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${baseUrl}/embed/${slug}`}
                      readOnly
                      className="flex-1 min-w-0 px-3 sm:px-4 py-2 rounded-xl bg-navy border border-purple-500/30 text-cream text-xs sm:text-sm truncate font-mono"
                    />
                    <Button
                      variant="secondary"
                      onClick={handleCopyEmbedUrl}
                      className="flex-shrink-0 border-purple-500/30 hover:bg-purple-500/20"
                    >
                      {copiedEmbed ? (
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
