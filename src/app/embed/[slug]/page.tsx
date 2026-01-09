'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Home, Grid3X3, Calendar, CreditCard, Menu, X, ExternalLink, Play } from 'lucide-react'
import { sanitizeEmbedHTML } from '@/lib/utils'

interface Tour {
  id: string
  title: string
  slug: string
  tourUrl: string | null
  tourEmbed: string | null
  coverImage: string | null
  location?: string | null
}

const baseUrl = 'https://z360-virtual-tour.vercel.app'

export default function EmbedTourPage() {
  const params = useParams()
  const slug = params.slug as string
  const [tour, setTour] = useState<Tour | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNav, setShowNav] = useState(false)

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

  const navLinks = [
    { name: 'Home', href: `${baseUrl}/`, icon: Home },
    { name: 'All Tours', href: `${baseUrl}/tours`, icon: Grid3X3 },
    { name: 'Availability', href: `${baseUrl}/schedule`, icon: Calendar },
    { name: 'Get a Quote', href: `${baseUrl}/pricing`, icon: CreditCard },
  ]

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
          <a
            href={`${baseUrl}/tours`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              marginTop: '20px',
              padding: '12px 24px',
              background: '#C9A962',
              color: '#0D1B2A',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            Browse All Tours
          </a>
        </div>
      </div>
    )
  }

  // Render tour content with navigation overlay
  const renderTourContent = () => {
    if (tour.tourEmbed) {
      // Sanitize the embed HTML to prevent XSS attacks
      const sanitizedEmbed = sanitizeEmbedHTML(tour.tourEmbed)
      return (
        <div
          style={{ width: '100%', height: '100%', overflow: 'hidden' }}
          dangerouslySetInnerHTML={{ __html: sanitizedEmbed }}
        />
      )
    }

    if (tour.tourUrl) {
      return (
        <iframe
          src={tour.tourUrl}
          style={{
            width: '100%',
            height: '100%',
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
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0D1B2A',
        backgroundImage: tour.coverImage ? `url(${tour.coverImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#fff',
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

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Tour Content */}
      {renderTourContent()}

      {/* Floating Menu Button */}
      <button
        onClick={() => setShowNav(!showNav)}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'rgba(13, 27, 42, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(201, 169, 98, 0.3)',
          color: '#C9A962',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          transition: 'all 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(201, 169, 98, 0.2)'
          e.currentTarget.style.borderColor = 'rgba(201, 169, 98, 0.6)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(13, 27, 42, 0.9)'
          e.currentTarget.style.borderColor = 'rgba(201, 169, 98, 0.3)'
        }}
      >
        {showNav ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Navigation Sidebar */}
      <div style={{
        position: 'absolute',
        top: '0',
        right: showNav ? '0' : '-320px',
        width: '300px',
        height: '100%',
        background: 'rgba(13, 27, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(201, 169, 98, 0.2)',
        transition: 'right 0.3s ease',
        zIndex: 99,
        display: 'flex',
        flexDirection: 'column',
        padding: '80px 20px 20px',
      }}>
        {/* Tour Info */}
        <div style={{
          marginBottom: '24px',
          paddingBottom: '24px',
          borderBottom: '1px solid rgba(201, 169, 98, 0.2)',
        }}>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '8px',
          }}>
            Currently Viewing
          </p>
          <h3 style={{
            color: '#fff',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '4px',
          }}>
            {tour.title}
          </h3>
          {tour.location && (
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
              📍 {tour.location}
            </p>
          )}
        </div>

        {/* Branding */}
        <div style={{
          marginBottom: '24px',
          paddingBottom: '24px',
          borderBottom: '1px solid rgba(201, 169, 98, 0.2)',
        }}>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '12px',
            marginBottom: '8px',
          }}>
            Powered by
          </p>
          <a
            href={baseUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#C9A962',
              fontSize: '20px',
              fontWeight: 'bold',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Z360 Virtual Tours
            <ExternalLink size={16} />
          </a>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1 }}>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '12px',
          }}>
            Explore
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(201, 169, 98, 0.1)',
                    color: '#fff',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(201, 169, 98, 0.15)'
                    e.currentTarget.style.borderColor = 'rgba(201, 169, 98, 0.4)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    e.currentTarget.style.borderColor = 'rgba(201, 169, 98, 0.1)'
                  }}
                >
                  <Icon size={20} style={{ color: '#C9A962' }} />
                  <span style={{ fontSize: '15px' }}>{link.name}</span>
                  <ExternalLink size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                </a>
              )
            })}
          </div>
        </nav>

        {/* View Full Tour Button */}
        <a
          href={`${baseUrl}/tour/${tour.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '16px',
            borderRadius: '12px',
            background: '#C9A962',
            color: '#0D1B2A',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '15px',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#dbbe75'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#C9A962'
          }}
        >
          <Play size={18} />
          View Full Tour Page
        </a>
      </div>

      {/* Overlay when nav is open */}
      {showNav && (
        <div
          onClick={() => setShowNav(false)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: '300px',
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            zIndex: 98,
          }}
        />
      )}
    </div>
  )
}
