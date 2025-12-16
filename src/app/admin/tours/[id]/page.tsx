'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Card, Button, Input } from '@/components/ui'
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
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    clientName: '',
    location: '',
    coverImage: '',
    images: '',
    tourUrl: '',
    tourEmbed: '',
    categoryId: '',
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
            images: (tour.images || []).join('\n'),
            tourUrl: tour.tourUrl || '',
            tourEmbed: tour.tourEmbed || '',
            categoryId: tour.categoryId || '',
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
          images: formData.images.split('\n').filter(Boolean),
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
                    Cover Image URL *
                  </label>
                  <Input
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  {formData.coverImage && (
                    <div className="mt-3 relative w-40 h-24 rounded-lg overflow-hidden border border-gold/20">
                      <img
                        src={formData.coverImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    Additional Images (one URL per line)
                  </label>
                  <textarea
                    name="images"
                    value={formData.images}
                    onChange={handleChange}
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-navy border border-gold/20 text-cream
                               placeholder:text-cream-muted focus:outline-none focus:ring-2
                               focus:ring-gold/50 focus:border-gold/50 resize-none"
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
                Options
              </h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
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
                      Display this tour prominently on the homepage
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
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
