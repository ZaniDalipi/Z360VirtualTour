'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { Card, Button, Input } from '@/components/ui'
import { motion } from 'framer-motion'

interface Category {
  id: string
  name: string
}

export default function NewTourPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
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
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories')
        if (res.ok) {
          const data = await res.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))

    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/tours', {
        method: 'POST',
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
        alert(data.error || 'Failed to create tour')
      }
    } catch (error) {
      console.error('Failed to create tour:', error)
      alert('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/tours"
          className="p-2 text-cream-muted hover:text-cream transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-h2 font-bold text-cream">New Tour</h1>
          <p className="text-body text-cream-muted">
            Create a new virtual tour for your portfolio
          </p>
        </div>
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Tour
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
