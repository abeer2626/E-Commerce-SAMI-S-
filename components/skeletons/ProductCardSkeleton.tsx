export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="aspect-square bg-gray-200 animate-pulse relative">
        <div className="absolute top-3 right-3 w-10 h-10 bg-gray-300 rounded-full" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
          ))}
          <div className="h-4 bg-gray-200 rounded w-8 ml-2 animate-pulse" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
