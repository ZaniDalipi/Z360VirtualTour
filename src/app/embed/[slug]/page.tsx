'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Tour {
  id: string
  title: string
  slug: string
  tourUrl: string | null
  tourEmbed: string | null
  coverImage: string | null
}

export default function EmbedTourPage() {
  const params = useParams()
  const slug = params.slug as string
  const [tour, setTour] = useState<Tour | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTour() {
      try {
        const response = await fetch(`/api/public/tours/${slug}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Tour not found')
          } else {
            setError('Failed to load tour')
          }
          return
        }
        const data = await response.json()
        setTour(data)
      } catch {
        setError('Failed to load tour')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchTour()
    }
  }, [slug])

  // Send message to parent window about tour loading
  useEffect(() => {
    if (tour) {
      window.parent.postMessage({
        type: 'z360-tour-loaded',
        tour: {
          id: tour.id,
          title: tour.title,
          slug: tour.slug,
        }
      }, '*')
    }
  }, [tour])

  if (loading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0D1B2A',
        color: '#C9A962',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(201, 169, 98, 0.3)',
            borderTop: '3px solid #C9A962',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px',
          }} />
          <p>Loading Virtual Tour...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  if (error || !tour) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0D1B2A',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#C9A962', marginBottom: '10px' }}>Tour Not Found</h2>
          <p style={{ color: '#888' }}>{error || 'The requested tour could not be loaded.'}</p>
        </div>
      </div>
    )
  }

  // If tour has embed code, render it directly
  if (tour.tourEmbed) {
    return (
      <div
        style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
        dangerouslySetInnerHTML={{ __html: tour.tourEmbed }}
      />
    )
  }

  // If tour has a URL, show it in an iframe
  if (tour.tourUrl) {
    return (
      <iframe
        src={tour.tourUrl}
        style={{
          width: '100vw',
          height: '100vh',
          border: 'none',
        }}
        allowFullScreen
        allow="xr-spatial-tracking; gyroscope; accelerometer"
        title={tour.title}
      />
    )
  }

  // Fallback if no tour content
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0D1B2A',
      backgroundImage: tour.coverImage ? `url(${tour.coverImage})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        textAlign: 'center',
        background: 'rgba(13, 27, 42, 0.9)',
        padding: '40px',
        borderRadius: '12px',
        maxWidth: '500px',
      }}>
        <h2 style={{ color: '#C9A962', marginBottom: '10px' }}>{tour.title}</h2>
        <p style={{ color: '#888' }}>Virtual tour coming soon</p>
      </div>
    </div>
  )
}
