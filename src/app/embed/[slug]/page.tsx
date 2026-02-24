'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { MapPin, ExternalLink, Eye } from 'lucide-react'

interface Tour {
  id: string
  title: string
  slug: string
  description: string | null
  clientName: string | null
  location: string | null
  coverImage: string
  tourUrl: string | null
  tourEmbed: string | null
  category: {
    name: string
  }
}

export default function EmbedTourPage() {
  const params = useParams()
  const slug = params.slug as string
  const [tour, setTour] = useState<Tour | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await fetch(`/api/embed/${slug}`)
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

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A1520',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #C9A962',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!tour) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A1520',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#E8DCC4',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <p>Tour not found</p>
      </div>
    )
  }

  // If tour has embed code, show it
  if (tour.tourEmbed) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A1520',
        fontFamily: 'system-ui, sans-serif',
      }}>
        {/* Embedded Tour */}
        <div
          style={{ width: '100%', height: 'calc(100vh - 60px)' }}
          dangerouslySetInnerHTML={{ __html: tour.tourEmbed }}
        />

        {/* Footer Bar */}
        <div style={{
          height: '60px',
          background: '#0A1520',
          borderTop: '1px solid rgba(201, 169, 98, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#C9A962', fontWeight: 'bold', fontSize: '14px' }}>
              Z<span style={{ color: '#E8DCC4' }}>360</span>
            </span>
            <span style={{ color: '#E8DCC4', fontSize: '14px' }}>{tour.title}</span>
            {tour.location && (
              <span style={{ color: '#B8A88A', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin style={{ width: '12px', height: '12px' }} />
                {tour.location}
              </span>
            )}
          </div>
          {tour.tourUrl && (
            <a
              href={tour.tourUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#C9A962',
                textDecoration: 'none',
                fontSize: '13px',
              }}
            >
              <ExternalLink style={{ width: '14px', height: '14px' }} />
              Full Screen
            </a>
          )}
        </div>
      </div>
    )
  }

  // Fallback: show cover image with link
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A1520',
      fontFamily: 'system-ui, sans-serif',
      position: 'relative',
    }}>
      {/* Cover Image */}
      <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 60px)' }}>
        <Image
          src={tour.coverImage}
          alt={tour.title}
          fill
          style={{ objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(10, 21, 32, 0.9), transparent)',
        }} />

        {/* Play Button */}
        {tour.tourUrl && (
          <a
            href={tour.tourUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80px',
              height: '80px',
              background: 'rgba(201, 169, 98, 0.9)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              transition: 'transform 0.2s',
            }}
          >
            <Eye style={{ width: '32px', height: '32px', color: '#0A1520' }} />
          </a>
        )}

        {/* Info Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
        }}>
          <span style={{
            display: 'inline-block',
            background: '#C9A962',
            color: '#0A1520',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '8px',
          }}>
            {tour.category.name}
          </span>
          <h1 style={{ color: '#E8DCC4', fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
            {tour.title}
          </h1>
          {tour.location && (
            <p style={{ color: '#B8A88A', fontSize: '14px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin style={{ width: '14px', height: '14px' }} />
              {tour.location}
            </p>
          )}
        </div>
      </div>

      {/* Footer Bar */}
      <div style={{
        height: '60px',
        background: '#0A1520',
        borderTop: '1px solid rgba(201, 169, 98, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
      }}>
        <span style={{ color: '#C9A962', fontWeight: 'bold', fontSize: '14px' }}>
          Z<span style={{ color: '#E8DCC4' }}>360</span> Virtual Tours
        </span>
        <a
          href={`https://z360virtualtours.com/tour/${tour.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#C9A962',
            textDecoration: 'none',
            fontSize: '13px',
          }}
        >
          <ExternalLink style={{ width: '14px', height: '14px' }} />
          View Full Tour
        </a>
      </div>
    </div>
  )
}
