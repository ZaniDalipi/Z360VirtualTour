import { Skeleton } from '@/components/ui'

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-navy pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-gold/10 to-transparent pt-8 pb-12 px-4">
        <div className="max-w-lg mx-auto text-center">
          {/* Avatar */}
          <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
          {/* Name */}
          <Skeleton className="h-7 w-40 mx-auto mb-2" />
          {/* Email */}
          <Skeleton className="h-5 w-56 mx-auto" />
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-lg mx-auto px-4 -mt-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-gold/10 p-4">
              <Skeleton className="h-8 w-12 mx-auto mb-2" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          ))}
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl border border-gold/10 p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-28 mb-1" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
