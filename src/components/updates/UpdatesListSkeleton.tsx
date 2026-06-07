export default function UpdatesListSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="skeleton h-8 w-48 mb-3" />
        <div className="skeleton h-4 w-72" />
      </div>
      <div className="flex flex-col gap-5 max-w-4xl mx-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card-static rounded-2xl p-4">
            <div className="flex gap-4 items-center">
              <div className="skeleton w-32 sm:w-44 aspect-video rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-5/6" />
                <div className="skeleton h-3 w-2/3" />
                <div className="skeleton h-3 w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
