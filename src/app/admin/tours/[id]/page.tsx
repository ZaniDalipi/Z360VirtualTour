'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Trash2, Copy, Check, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { Card, Button, Input, ImageUpload } from '@/components/ui'
import { motion } from 'framer-motion'

interface Category {
  id: string
  name: string
}

export default function EditTourPage() {
  const router = useRouter()
  const params = useParams()
  const tourId = params.id as string

  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://z360virtualtours.com'

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    }
  }
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    clientName: '',
    location: '',
    coverImage: '',
    images: [] as string[],
    tourUrl: '',
    tourEmbed: '',
    categoryId: '',
    premium: false,
    highlight: false,
    featured: false,
    isActive: true,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tourRes, categoriesRes] = await Promise.all([
          fetch(`/api/admin/tours/${tourId}`),
          fetch('/api/admin/categories'),
        ])

        if (tourRes.ok) {
          const tour = await tourRes.json()
          setFormData({
            title: tour.title || '',
            slug: tour.slug || '',
            description: tour.description || '',
            shortDescription: tour.shortDescription || '',
            clientName: tour.clientName || '',
            location: tour.location || '',
            coverImage: tour.coverImage || '',
            images: tour.images || [],
            tourUrl: tour.tourUrl || '',
            tourEmbed: tour.tourEmbed || '',
            categoryId: tour.categoryId || '',
            premium: tour.premium || false,
            highlight: tour.highlight || false,
            featured: tour.featured || false,
            isActive: tour.isActive ?? true,
          })
        }

        if (categoriesRes.ok) {
          const cats = await categoriesRes.json()
          setCategories(cats)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [tourId])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const res = await fetch(`/api/admin/tours/${tourId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: formData.images,
        }),
      })

      if (res.ok) {
        router.push('/admin/tours')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update tour')
      }
    } catch (error) {
      console.error('Failed to update tour:', error)
      alert('Something went wrong')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this tour? This cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/tours/${tourId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.push('/admin/tours')
      } else {
        alert('Failed to delete tour')
      }
    } catch (error) {
      console.error('Failed to delete tour:', error)
      alert('Something went wrong')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-gold/10 rounded animate-pulse" />
        <div className="h-96 bg-gold/10 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/tours"
            className="p-2 text-cream-muted hover:text-cream transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-h2 font-bold text-cream">Edit Tour</h1>
            <p className="text-body text-cream-muted">{formData.title}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          {isDeleting ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <Trash2 className="w-4 h-4 mr-2" />
          )}
          Delete
        </Button>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSubmit}>
          <Card className="p-6 space-y-6">
            {/* Basic Info */}
            <div>
              <h2 className="text-h4 font-semibold text-cream mb-4">
                Basic Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    Tour Title *
                  </label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Modern Office Space"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    URL Slug *
                  </label>
                  <Input
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="modern-office-space"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    Client Name
                  </label>
                  <Input
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    Location
                  </label>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="New York, NY"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-cream mb-2">
                    Category *
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-navy border border-gold/20 text-cream
                               focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50"
                  >
                    <option value="">Select a category...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Share & Embed - for BalkanEstateAI integration */}
            {formData.slug && (
              <div className="bg-gradient-to-r from-purple-500/10 to-gold/10 border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <LinkIcon className="w-5 h-5 text-purple-400" />
                  <h2 className="text-h4 font-semibold text-cream">
                    Share & Embed
                  </h2>
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                    For BalkanEstateAI
                  </span>
                </div>
                <p className="text-sm text-cream-muted mb-4">
                  Copy the embed URL below and paste it into your BalkanEstateAI property listing&apos;s &quot;360° Tour URL&quot; field.
                </p>
                <div className="space-y-4">
                  {/* Main Embed URL */}
                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      Embed URL (paste this in BalkanEstateAI)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={`${baseUrl}/embed/${formData.slug}`}
                        readOnly
                        className="bg-navy/50 font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => copyToClipboard(`${baseUrl}/embed/${formData.slug}`, 'embed')}
                        className="flex-shrink-0"
                      >
                        {copiedField === 'embed' ? (
                          <>
                            <Check className="w-4 h-4 mr-2 text-green-400" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy URL
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  {/* Additional URLs */}
                  <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-gold/10">
                    <div>
                      <label className="block text-xs font-medium text-cream-muted mb-1">
                        Direct View URL
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={`${baseUrl}/tour/${formData.slug}`}
                          readOnly
                          className="bg-navy/50 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`${baseUrl}/tour/${formData.slug}`, 'view')}
                          className="p-2 text-cream-muted hover:text-gold transition-colors"
                        >
                          {copiedField === 'view' ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cream-muted mb-1">
                        API Endpoint
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={`${baseUrl}/api/public/tours/${formData.slug}`}
                          readOnly
                          className="bg-navy/50 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`${baseUrl}/api/public/tours/${formData.slug}`, 'api')}
                          className="p-2 text-cream-muted hover:text-gold transition-colors"
                        >
                          {copiedField === 'api' ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="text-h4 font-semibold text-cream mb-4">
                Description
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    Short Description
                  </label>
                  <Input
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    placeholder="Brief summary for tour cards"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    Full Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Detailed description of the tour..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-navy border border-gold/20 text-cream
                               placeholder:text-cream-muted focus:outline-none focus:ring-2
                               focus:ring-gold/50 focus:border-gold/50 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Media */}
            <div>
              <h2 className="text-h4 font-semibold text-cream mb-4">
                Media & Tour
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    Cover Image *
                  </label>
                  <ImageUpload
                    value={formData.coverImage}
                    onChange={(url) => setFormData(prev => ({ ...prev, coverImage: url as string }))}
                    tourSlug={formData.slug || undefined}
                    tourId={tourId}
                    imageType="cover"
                    placeholder="Upload cover image"
                  />
                  <p className="mt-2 text-xs text-cream-muted">
                    Or paste a URL directly:
                  </p>
                  <Input
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    Additional Images
                  </label>
                  <ImageUpload
                    value={formData.images}
                    onChange={(urls) => setFormData(prev => ({ ...prev, images: urls as string[] }))}
                    multiple
                    maxFiles={10}
                    tourSlug={formData.slug || undefined}
                    tourId={tourId}
                    imageType="gallery"
                    placeholder="Upload additional tour images"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    Tour URL (external link)
                  </label>
                  <Input
                    name="tourUrl"
                    value={formData.tourUrl}
                    onChange={handleChange}
                    placeholder="https://tour-platform.com/your-tour"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    Tour Embed Code (iframe)
                  </label>
                  <textarea
                    name="tourEmbed"
                    value={formData.tourEmbed}
                    onChange={handleChange}
                    placeholder='<iframe src="..." width="100%" height="500"></iframe>'
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-navy border border-gold/20 text-cream
                               placeholder:text-cream-muted focus:outline-none focus:ring-2
                               focus:ring-gold/50 focus:border-gold/50 resize-none font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Options */}
            <div>
              <h2 className="text-h4 font-semibold text-cream mb-4">
                Display Options
              </h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 border-gold/30 bg-gold/5 hover:bg-gold/10 transition-colors">
                  <input
                    type="checkbox"
                    name="premium"
                    checked={formData.premium}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gold/20 bg-navy text-gold focus:ring-gold/50"
                  />
                  <div>
                    <span className="text-gold font-bold">⭐ Premium Tour</span>
                    <p className="text-sm text-cream-muted">
                      Gold border, always displayed first (highest priority)
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 border-pink-500/30 bg-pink-500/5 hover:bg-pink-500/10 transition-colors">
                  <input
                    type="checkbox"
                    name="highlight"
                    checked={formData.highlight}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-pink-500/20 bg-navy text-pink-500 focus:ring-pink-500/50"
                  />
                  <div>
                    <span className="text-pink-400 font-bold">✨ Highlight Tour</span>
                    <p className="text-sm text-cream-muted">
                      Pink style, displayed second (after premium)
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gold/10 hover:border-gold/20 transition-colors">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gold/20 bg-navy text-gold focus:ring-gold/50"
                  />
                  <div>
                    <span className="text-cream font-medium">Featured Tour</span>
                    <p className="text-sm text-cream-muted">
                      Displayed third (after premium & highlight)
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gold/10 hover:border-gold/20 transition-colors">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gold/20 bg-navy text-gold focus:ring-gold/50"
                  />
                  <div>
                    <span className="text-cream font-medium">Published</span>
                    <p className="text-sm text-cream-muted">
                      Make this tour visible to the public
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gold/10">
              <Link href="/admin/tours">
                <Button variant="ghost">Cancel</Button>
              </Link>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </Card>
        </form>
      </motion.div>
    </div>
  )
}
