export default function SkeletonCard() {
  return (
    <div className="bg-white/5 rounded-2xl p-4 animate-pulse">
      <div className="h-40 bg-white/10 rounded-lg mb-4" />
      <div className="h-4 bg-white/10 w-3/4 mb-2 rounded" />
      <div className="h-4 bg-white/10 w-1/2 rounded" />
    </div>
  )
}