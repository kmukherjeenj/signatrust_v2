import { SkeletonCard, SkeletonStats } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400" />
            <span className="font-semibold tracking-tight text-lg">SignaTrust</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
          </div>
        </header>

        {/* Page Title */}
        <div className="mb-6">
          <div className="h-8 w-48 bg-white/10 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-white/10 rounded animate-pulse" />
        </div>

        {/* Stats Skeleton */}
        <SkeletonStats />

        {/* Sessions List */}
        <div className="mt-8">
          <div className="h-6 w-40 bg-white/10 rounded animate-pulse mb-4" />
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    </div>
  );
}
