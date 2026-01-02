import { Skeleton } from '@/components/ui'

export default function ToursLoading() {
  return (
    <div className="min-h-screen bg-navy">
      {/* Header Skeleton */}
      <div className="h-16 bg-navy-light/50" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>

        {/* Search & Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Skeleton className="h-12 flex-1" />
          <div className="flex gap-2">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-24" />
          </div>
        </div>

        {/* Tours Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-gold/10">
              <Skeleton className="aspect-video" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
