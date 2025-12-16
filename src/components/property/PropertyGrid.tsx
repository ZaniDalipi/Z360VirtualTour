'use client'

import { Property } from '@/types'
import { PropertyCard } from './PropertyCard'

interface PropertyGridProps {
  properties: Property[]
  columns?: 1 | 2 | 3 | 4
}

export function PropertyGrid({ properties, columns = 2 }: PropertyGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4 md:gap-6`}>
      {properties.map((property, index) => (
        <PropertyCard key={property.id} property={property} index={index} />
      ))}
    </div>
  )
}
