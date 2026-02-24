'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Room, Hotspot } from '@/types'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, ArrowRight, X } from 'lucide-react'

interface TourViewerProps {
  rooms: Room[]
  initialRoom?: string
  onRoomChange?: (roomId: string) => void
}

export function TourViewer({ rooms, initialRoom, onRoomChange }: TourViewerProps) {
  const [currentRoomId, setCurrentRoomId] = useState(initialRoom || rooms[0]?.id)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentRoom = rooms.find(r => r.id === currentRoomId)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartPos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - startPos.x
    const deltaY = e.clientY - startPos.y

    setRotation(prev => ({
      x: Math.max(-85, Math.min(85, prev.x - deltaY * 0.2)),
      y: prev.y + deltaX * 0.3,
    }))

    setStartPos({ x: e.clientX, y: e.clientY })
  }, [isDragging, startPos])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setStartPos({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - startPos.x
    const deltaY = touch.clientY - startPos.y

    setRotation(prev => ({
      x: Math.max(-85, Math.min(85, prev.x - deltaY * 0.2)),
      y: prev.y + deltaX * 0.3,
    }))

    setStartPos({ x: touch.clientX, y: touch.clientY })
  }, [isDragging, startPos])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp, handleTouchMove])

  const navigateToRoom = (roomId: string) => {
    setCurrentRoomId(roomId)
    setActiveHotspot(null)
    onRoomChange?.(roomId)
  }

  const getHotspotPosition = (hotspot: Hotspot) => {
    // Convert pitch/yaw to screen position
    const yaw = hotspot.position.yaw - rotation.y
    const pitch = hotspot.position.pitch + rotation.x

    // Normalize yaw to -180 to 180
    let normalizedYaw = yaw % 360
    if (normalizedYaw > 180) normalizedYaw -= 360
    if (normalizedYaw < -180) normalizedYaw += 360

    // Only show if in front of camera (within ~100 degrees)
    if (Math.abs(normalizedYaw) > 100) return null

    const x = 50 + (normalizedYaw / 100) * 50
    const y = 50 - (pitch / 85) * 40

    return { x, y }
  }

  if (!currentRoom) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-navy-dark">
        <p className="text-cream">No rooms available</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-navy-dark cursor-grab active:cursor-grabbing select-none touch-none"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Panorama Image with CSS 3D transform simulation */}
      <div
        className="absolute inset-0 transition-transform duration-100"
        style={{
          transform: `rotateX(${rotation.x}deg)`,
        }}
      >
        <div
          className="absolute inset-[-50%] w-[200%] h-[200%]"
          style={{
            transform: `translateX(${-rotation.y * 2}px)`,
          }}
        >
          <Image
            src={currentRoom.panoramaUrl}
            alt={currentRoom.name}
            fill
            className="object-cover"
            priority
            draggable={false}
          />
        </div>
      </div>

      {/* Hotspots */}
      {currentRoom.hotspots.map((hotspot) => {
        const position = getHotspotPosition(hotspot)
        if (!position) return null

        return (
          <motion.button
            key={hotspot.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              "absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 z-10",
              "flex items-center justify-center",
              "bg-gold/30 border-2 border-gold rounded-full",
              "shadow-hotspot animate-pulse-glow",
              "hover:scale-110 transition-transform"
            )}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
            }}
            onClick={(e) => {
              e.stopPropagation()
              if (hotspot.type === 'navigation' && hotspot.target) {
                navigateToRoom(hotspot.target)
              } else {
                setActiveHotspot(hotspot)
              }
            }}
          >
            {hotspot.type === 'navigation' ? (
              <ArrowRight className="w-5 h-5 text-cream" />
            ) : (
              <Info className="w-5 h-5 text-cream" />
            )}
          </motion.button>
        )
      })}

      {/* Hotspot Info Panel */}
      <AnimatePresence>
        {activeHotspot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 sm:bottom-24 left-2 right-2 sm:left-4 sm:right-4 z-20 max-w-lg mx-auto"
          >
            <div className="bg-navy-dark/95 backdrop-blur-xl border border-gold/20 rounded-xl p-3 sm:p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-body-lg sm:text-h4 font-semibold text-cream">{activeHotspot.label}</h3>
                <button
                  onClick={() => setActiveHotspot(null)}
                  className="p-1.5 text-cream-muted hover:text-cream -mr-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {activeHotspot.description && (
                <p className="text-caption sm:text-body text-cream-soft">{activeHotspot.description}</p>
              )}
              {activeHotspot.type === 'navigation' && activeHotspot.target && (
                <button
                  onClick={() => navigateToRoom(activeHotspot.target!)}
                  className="mt-3 w-full bg-gold text-navy font-medium py-2.5 rounded-lg hover:bg-gold-soft transition-colors text-sm"
                >
                  Go to {activeHotspot.label}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compass / Rotation Indicator */}
      <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-navy-dark/60 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-cream text-caption">
          {Math.round(rotation.y % 360)}°
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-3 sm:top-4 right-2 sm:right-4 z-10">
        <div className="bg-navy-dark/60 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-cream-muted text-overline sm:text-caption">
          <span className="hidden sm:inline">Drag to look around</span>
          <span className="sm:hidden">Swipe to explore</span>
        </div>
      </div>
    </div>
  )
}
