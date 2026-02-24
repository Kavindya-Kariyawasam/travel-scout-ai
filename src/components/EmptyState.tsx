import { SearchX } from "lucide-react";

interface EmptyStateProps {
  query: string;
}

export default function EmptyState({ query }: EmptyStateProps) {
  return (
    <div className="text-center py-12 space-y-3">
      <SearchX className="w-10 h-10 text-gray-300 mx-auto" strokeWidth={1.5} />
      <h3 className="font-semibold text-gray-700">
        No matching experiences found
      </h3>
      <p className="text-sm text-gray-400 max-w-sm mx-auto">
        We couldn&apos;t find anything in our inventory that matches{" "}
        <span className="font-medium text-gray-600">&quot;{query}&quot;</span>.
        Try different keywords, or broaden your budget and activity preferences.
      </p>
    </div>
  );
}
