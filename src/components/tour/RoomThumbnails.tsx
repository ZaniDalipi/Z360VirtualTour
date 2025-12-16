'use client'

import Image from 'next/image'
import { Room } from '@/types'
import { cn } from '@/lib/utils'

interface RoomThumbnailsProps {
  rooms: Room[]
  currentRoomId: string
  onSelectRoom: (roomId: string) => void
}

export function RoomThumbnails({ rooms, currentRoomId, onSelectRoom }: RoomThumbnailsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide p-2">
      {rooms.map((room) => (
        <button
          key={room.id}
          onClick={() => onSelectRoom(room.id)}
          className={cn(
            "flex-shrink-0 w-20 rounded-lg overflow-hidden transition-all",
            "border-2",
            currentRoomId === room.id
              ? "border-gold shadow-glow"
              : "border-transparent opacity-70 hover:opacity-100"
          )}
        >
          <div className="relative h-14">
            <Image
              src={room.thumbnail}
              alt={room.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="bg-navy-dark/90 px-2 py-1">
            <p className="text-[10px] text-cream truncate text-center">{room.name}</p>
          </div>
        </button>
      ))}
    </div>
  )
}
