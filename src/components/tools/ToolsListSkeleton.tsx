export default function ToolsListSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="skeleton h-8 w-48 mb-3" />
        <div className="skeleton h-4 w-72" />
      </div>
      <div className="skeleton h-10 w-44 mb-6 rounded-lg" />
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-9px)] lg:w-[calc(16.666%-10px)]"
          >
            <div className="skeleton aspect-square rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
