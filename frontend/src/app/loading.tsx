export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      {/* Hero skeleton */}
      <div className="text-center mb-12">
        <div className="skeleton h-8 w-48 mx-auto mb-4 rounded-full" />
        <div className="skeleton h-16 w-[500px] max-w-full mx-auto mb-4 rounded-xl" />
        <div className="skeleton h-6 w-96 max-w-full mx-auto mb-8 rounded-lg" />
        <div className="flex justify-center gap-4">
          <div className="skeleton h-12 w-36 rounded-xl" />
          <div className="skeleton h-12 w-40 rounded-xl" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="skeleton h-8 w-48 mb-6 rounded-lg" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="skeleton aspect-video rounded-2xl" />
            <div className="skeleton h-4 w-3/4 rounded-lg" />
            <div className="flex gap-2">
              <div className="skeleton h-3 w-12 rounded-md" />
              <div className="skeleton h-3 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
