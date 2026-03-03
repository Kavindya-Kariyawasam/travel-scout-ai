export default function LoadingSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 sm:p-5 space-y-3 animate-pulse"
        >
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="flex gap-2 sm:gap-3 flex-1">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded w-1/3" />
              </div>
            </div>
            <div className="w-14 sm:w-16 h-7 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded-lg sm:rounded-xl flex-shrink-0" />
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <div className="h-6 w-14 sm:w-16 bg-gray-100 dark:bg-gray-700/50 rounded-full" />
            <div className="h-6 w-16 sm:w-20 bg-gray-100 dark:bg-gray-700/50 rounded-full" />
            <div className="h-6 w-12 sm:w-14 bg-gray-100 dark:bg-gray-700/50 rounded-full" />
          </div>
          <div className="h-9 sm:h-10 bg-gray-50 dark:bg-gray-700/30 rounded-lg sm:rounded-xl" />
        </div>
      ))}
    </div>
  );
}
