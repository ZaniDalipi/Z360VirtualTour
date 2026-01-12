import { Skeleton } from '@/components/ui'

export default function ProfileToursLoading() {
  return (
    <div className="min-h-screen bg-navy pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-navy border-b border-gold/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="h-7 w-32" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Booking Cards */}
      <div className="max-w-4xl mx-auto px-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-gold/10 p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-3" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
