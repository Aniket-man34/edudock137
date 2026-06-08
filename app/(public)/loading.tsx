export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="skeleton h-12 w-3/4 mx-auto rounded-xl" />
        <div className="skeleton h-12 w-1/2 mx-auto rounded-xl" />
        <div className="skeleton h-4 w-2/3 mx-auto" />
      </div>
      <div className="space-y-3">
        <div className="skeleton h-6 w-40" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="skeleton aspect-[2/3] w-[40vw] md:w-[200px] rounded-xl shrink-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
