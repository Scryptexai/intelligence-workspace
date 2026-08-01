export default function ProjectLoading() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex items-center gap-4">
        <div className="shimmer h-14 w-14 rounded-xl" />
        <div className="space-y-2">
          <div className="shimmer h-5 w-48 rounded" />
          <div className="shimmer h-3 w-72 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="shimmer h-[120px] rounded-lg border border-border" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="shimmer h-40 rounded-lg border border-border" />
        ))}
      </div>
    </div>
  );
}
