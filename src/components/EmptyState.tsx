import { SearchX } from "lucide-react";

interface EmptyStateProps {
  query: string;
}

export default function EmptyState({ query }: EmptyStateProps) {
  return (
    <div className="text-center py-8 sm:py-12 space-y-2 sm:space-y-3">
      <SearchX
        className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 dark:text-gray-500 mx-auto"
        strokeWidth={1.5}
      />
      <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base">
        No matching experiences found
      </h3>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-xs sm:max-w-sm mx-auto">
        We couldn&apos;t find anything in our inventory that matches{" "}
        <span className="font-medium text-gray-700 dark:text-gray-300">
          &quot;{query}&quot;
        </span>
        . Try different keywords, or broaden your budget and activity
        preferences.
      </p>
    </div>
  );
}
