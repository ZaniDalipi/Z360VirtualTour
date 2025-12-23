'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  value?: string | string[]
  onChange: (value: string | string[]) => void
  multiple?: boolean
  tourId?: string
  tourSlug?: string
  imageType?: 'cover' | 'gallery'
  maxFiles?: number
  className?: string
  disabled?: boolean
  placeholder?: string
}

export function ImageUpload({
  value,
  onChange,
  multiple = false,
  tourId,
  tourSlug,
  imageType = 'gallery',
  maxFiles = 10,
  className = '',
  disabled = false,
  placeholder = 'Click or drag to upload',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Normalize value to array for consistent handling
  const images: string[] = Array.isArray(value)
    ? value
    : value
      ? [value]
      : []

  const handleUpload = useCallback(async (files: FileList | File[]) => {
    if (disabled) return

    setError(null)
    setIsUploading(true)

    const fileArray = Array.from(files)

    // Check max files limit
    if (multiple && images.length + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`)
      setIsUploading(false)
      return
    }

    try {
      const uploadPromises = fileArray.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('imageType', imageType)

        // Add tour context for folder organization
        if (tourSlug) {
          formData.append('tourSlug', tourSlug)
        }
        if (tourId) {
          formData.append('tourId', tourId)
        }

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Upload failed')
        }

        const data = await response.json()
        return data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)

      if (multiple) {
        onChange([...images, ...uploadedUrls])
      } else {
        onChange(uploadedUrls[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }, [disabled, tourId, tourSlug, imageType, images, maxFiles, multiple, onChange])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files)
    }
  }, [handleUpload])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files)
    }
  }, [handleUpload])

  const removeImage = useCallback((indexToRemove: number) => {
    if (multiple) {
      const newImages = images.filter((_, index) => index !== indexToRemove)
      onChange(newImages)
    } else {
      onChange('')
    }
  }, [images, multiple, onChange])

  const triggerFileSelect = () => {
    inputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-gold bg-gold/5' : 'border-gold/30 hover:border-gold/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isUploading ? 'pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="w-10 h-10 text-gold animate-spin mb-2" />
            <p className="text-sm text-cream-muted">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <Upload className="w-10 h-10 text-gold/60 mb-2" />
            <p className="text-sm text-cream">{placeholder}</p>
            <p className="text-xs text-cream-muted mt-1">
              JPEG, PNG, WebP, GIF up to 10MB
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Preview images */}
      {images.length > 0 && (
        <div className={`grid gap-4 ${multiple ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1'}`}>
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden bg-navy-light aspect-video border border-gold/20"
            >
              {imageUrl.startsWith('http') ? (
                <Image
                  src={imageUrl}
                  alt={`Uploaded image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ImageIcon className="w-8 h-8 text-cream-muted" />
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(index)
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Image count for multiple */}
      {multiple && images.length > 0 && (
        <p className="text-sm text-cream-muted">
          {images.length} of {maxFiles} images
        </p>
      )}
    </div>
  )
}
