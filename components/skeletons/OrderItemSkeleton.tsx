export default function OrderItemSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
        <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
      </div>
      <div className="flex items-center space-x-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="flex justify-between pt-4 border-t">
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
        <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
      </div>
    </div>
  );
}
