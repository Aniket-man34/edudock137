export default function PdfsListSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="skeleton h-8 w-44 mb-3" />
        <div className="skeleton h-4 w-72" />
      </div>
      <div className="skeleton h-10 w-44 mb-6 rounded-lg" />
      <div className="flex flex-col md:flex-row md:flex-wrap gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-row gap-4 items-center w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
          >
            <div className="skeleton w-24 md:w-28 aspect-[2/3] rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-1/2" />
              <div className="skeleton h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
