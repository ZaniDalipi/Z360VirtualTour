export interface Property {
  id: string
  title: string
  address: string
  price: number
  bedrooms: number
  bathrooms: number
  sqft: number
  parking: number
  image: string
  images: string[]
  has360Tour: boolean
  hasARView: boolean
  featured: boolean
  status: 'available' | 'pending' | 'sold'
  description: string
  amenities: string[]
  agent: Agent
  location: {
    lat: number
    lng: number
  }
  rooms: Room[]
}

export interface Room {
  id: string
  name: string
  panoramaUrl: string
  thumbnail: string
  hotspots: Hotspot[]
}

export interface Hotspot {
  id: string
  type: 'navigation' | 'info' | 'media'
  position: {
    pitch: number
    yaw: number
  }
  target?: string
  label: string
  icon: string
  description?: string
}

export interface Agent {
  id: string
  name: string
  avatar: string
  rating: number
  reviews: number
  phone: string
  email: string
}

export interface FilterOptions {
  propertyType: string[]
  priceRange: [number, number]
  bedrooms: number | null
  bathrooms: number | null
  sqftRange: [number, number]
  features: string[]
}
