'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { X, Maximize2, Settings, Share2, Info, Map } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { TourViewer, RoomThumbnails } from '@/components/tour'
import { getPropertyById } from '@/data/properties'
import { motion, AnimatePresence } from 'framer-motion'

export default function TourPage() {
  const params = useParams()
  const property = getPropertyById(params.id as string)
  const [currentRoomId, setCurrentRoomId] = useState(property?.rooms[0]?.id || '')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showFloorPlan, setShowFloorPlan] = useState(false)

  if (!property) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <p className="text-cream">Property not found</p>
      </div>
    )
  }

  const currentRoom = property.rooms.find(r => r.id === currentRoomId)

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div className="h-screen bg-navy flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4">
        <Link href={`/property/${property.id}`}>
          <Button variant="icon" className="bg-navy-dark/60 backdrop-blur-sm">
            <X className="w-5 h-5" />
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-h4 font-semibold text-cream">{property.title}</h1>
          <p className="text-caption text-cream-muted">
            Room: {currentRoom?.name || 'Loading...'}
          </p>
        </motion.div>

        <div className="flex gap-2">
          <Button
            variant="icon"
            className="bg-navy-dark/60 backdrop-blur-sm"
            onClick={() => setShowInfo(!showInfo)}
          >
            <Info className="w-5 h-5" />
          </Button>
          <Button
            variant="icon"
            className="bg-navy-dark/60 backdrop-blur-sm"
            onClick={handleFullscreen}
          >
            <Maximize2 className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* 360 Viewer */}
      <div className="flex-1 relative">
        {property.rooms.length > 0 ? (
          <TourViewer
            rooms={property.rooms}
            initialRoom={currentRoomId}
            onRoomChange={setCurrentRoomId}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-navy-dark">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                <Map className="w-8 h-8 text-gold" />
              </div>
              <h2 className="text-h3 font-semibold text-cream mb-2">Tour Coming Soon</h2>
              <p className="text-body text-cream-muted max-w-xs mx-auto">
                The 360° virtual tour for this property is being prepared.
              </p>
              <Link href={`/property/${property.id}`}>
                <Button className="mt-4">Back to Property</Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-16 right-4 bottom-28 w-72 z-40"
          >
            <Card className="h-full p-4 overflow-y-auto bg-navy-dark/95 backdrop-blur-xl">
              <h2 className="text-h4 font-semibold text-cream mb-4">Property Info</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-caption text-cream-muted mb-1">Address</h3>
                  <p className="text-body text-cream">{property.address}</p>
                </div>

                <div>
                  <h3 className="text-caption text-cream-muted mb-1">Price</h3>
                  <p className="text-h3 font-bold text-gold">${property.price.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h3 className="text-caption text-cream-muted mb-1">Bedrooms</h3>
                    <p className="text-body text-cream">{property.bedrooms}</p>
                  </div>
                  <div>
                    <h3 className="text-caption text-cream-muted mb-1">Bathrooms</h3>
                    <p className="text-body text-cream">{property.bathrooms}</p>
                  </div>
                  <div>
                    <h3 className="text-caption text-cream-muted mb-1">Area</h3>
                    <p className="text-body text-cream">{property.sqft.toLocaleString()} sqft</p>
                  </div>
                  <div>
                    <h3 className="text-caption text-cream-muted mb-1">Parking</h3>
                    <p className="text-body text-cream">{property.parking} spots</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-caption text-cream-muted mb-2">Rooms in Tour</h3>
                  <div className="space-y-2">
                    {property.rooms.map((room) => (
                      <button
                        key={room.id}
                        onClick={() => setCurrentRoomId(room.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          currentRoomId === room.id
                            ? 'bg-gold/20 text-gold'
                            : 'bg-navy-medium text-cream-soft hover:bg-gold/10'
                        }`}
                      >
                        {room.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Link href={`/property/${property.id}`} className="block mt-6">
                <Button className="w-full">View Full Details</Button>
              </Link>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-40">
        {/* Room Thumbnails */}
        {property.rooms.length > 0 && (
          <div className="bg-navy-dark/80 backdrop-blur-xl border-t border-gold/10">
            <RoomThumbnails
              rooms={property.rooms}
              currentRoomId={currentRoomId}
              onSelectRoom={setCurrentRoomId}
            />

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 p-4 border-t border-gold/10">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFloorPlan(!showFloorPlan)}
              >
                <Map className="w-4 h-4 mr-2" />
                Floor Plan
              </Button>
              <Button variant="secondary" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Link href={`/property/${property.id}`}>
                <Button size="sm">
                  Schedule Visit
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
