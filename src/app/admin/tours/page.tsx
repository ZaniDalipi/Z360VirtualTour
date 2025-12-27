'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Search, Eye, Edit, Trash2, ExternalLink, Copy, Check } from 'lucide-react'
import { Card, Button, Input } from '@/components/ui'
import { motion } from 'framer-motion'

interface Tour {
  id: string
  title: string
  slug: string
  clientName: string | null
  location: string | null
  coverImage: string
  category: {
    name: string
  }
  featured: boolean
  isActive: boolean
  views: number
  createdAt: string
}

export default function AdminToursPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://z360virtualtours.com'

  const copyEmbedUrl = async (slug: string) => {
    const embedUrl = `${baseUrl}/embed/${slug}`
    try {
      await navigator.clipboard.writeText(embedUrl)
      setCopiedSlug(slug)
      setTimeout(() => setCopiedSlug(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = embedUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedSlug(slug)
      setTimeout(() => setCopiedSlug(null), 2000)
    }
  }

  useEffect(() => {
    fetchTours()
  }, [])

  const fetchTours = async () => {
    try {
      const res = await fetch('/api/admin/tours')
      if (res.ok) {
        const data = await res.json()
        setTours(data)
      }
    } catch (error) {
      console.error('Failed to fetch tours:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tour?')) return

    setDeleteId(id)
    try {
      const res = await fetch(`/api/admin/tours/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setTours(tours.filter((t) => t.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete tour:', error)
    } finally {
      setDeleteId(null)
    }
  }

  const filteredTours = tours.filter(
    (tour) =>
      tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gold/10 rounded animate-pulse" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gold/10 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-bold text-cream">Tours</h1>
          <p className="text-body text-cream-muted">
            Manage your virtual tour portfolio
          </p>
        </div>
        <Link href="/admin/tours/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Tour
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tours..."
          className="pl-12"
        />
      </div>

      {/* Tours List */}
      <Card className="overflow-hidden">
        {filteredTours.length > 0 ? (
          <div className="divide-y divide-gold/10">
            {filteredTours.map((tour, index) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 hover:bg-gold/5 transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={tour.coverImage}
                    alt={tour.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-cream truncate">
                      {tour.title}
                    </h3>
                    {tour.featured && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gold text-navy font-medium">
                        Featured
                      </span>
                    )}
                    {!tour.isActive && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-cream-muted truncate">
                    {tour.clientName || 'No client'} • {tour.category.name}
                  </p>
                </div>

                {/* Views */}
                <div className="hidden sm:flex items-center gap-1 text-cream-muted">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{tour.views}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyEmbedUrl(tour.slug)}
                    className="p-2 text-cream-muted hover:text-gold transition-colors"
                    title="Copy Embed URL for BalkanEstateAI"
                  >
                    {copiedSlug === tour.slug ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <Link
                    href={`/tour/${tour.slug}`}
                    target="_blank"
                    className="p-2 text-cream-muted hover:text-cream transition-colors"
                    title="View Tour"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/admin/tours/${tour.id}`}
                    className="p-2 text-cream-muted hover:text-cream transition-colors"
                    title="Edit Tour"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(tour.id)}
                    disabled={deleteId === tour.id}
                    className="p-2 text-cream-muted hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Delete Tour"
                  >
                    {deleteId === tour.id ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-cream-muted mb-4">
              {searchQuery ? 'No tours match your search' : 'No tours yet'}
            </p>
            {!searchQuery && (
              <Link href="/admin/tours/new">
                <Button variant="secondary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Tour
                </Button>
              </Link>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
