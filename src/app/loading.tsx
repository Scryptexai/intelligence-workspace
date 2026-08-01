export default function RootLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 lg:p-6">
      <div className="flex items-center gap-4">
        <div className="shimmer h-12 w-12 rounded-xl" />
        <div className="space-y-2">
          <div className="shimmer h-5 w-56 rounded" />
          <div className="shimmer h-3 w-80 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="shimmer h-64 rounded-xl border border-border" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="shimmer h-20 rounded-lg border border-border" />
        ))}
      </div>
    </div>
  );
}
