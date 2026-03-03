"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import ResultCard from "@/components/ResultCard";
import EmptyState from "@/components/EmptyState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ThemeToggle from "@/components/ThemeToggle";
import { Compass } from "lucide-react";
import { ScoutResponse } from "@/lib/types";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ScoutResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setResponse(data);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-12 space-y-5 sm:space-y-6 md:space-y-8">
        {/* Theme Toggle */}
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <Compass
            className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500 dark:text-emerald-400 mx-auto"
            strokeWidth={1.5}
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Travel Scout
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Describe your ideal trip in plain English. Our AI will find the best
            matching experiences from our curated collection.
          </p>
        </div>

        {/* Search */}
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900 text-red-700 dark:text-red-400 text-xs sm:text-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && <LoadingSkeleton />}

        {/* Results */}
        {!isLoading && response && (
          <div className="space-y-3 sm:space-y-4 md:space-y-5">
            {response.totalFound > 0 ? (
              <>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                  {response.totalFound} experience
                  {response.totalFound !== 1 ? "s" : ""} matched for &quot;
                  {response.queryEcho}&quot;
                </p>
                {response.results.map((result, i) => (
                  <ResultCard
                    key={result.item.id}
                    result={result}
                    rank={i + 1}
                  />
                ))}
              </>
            ) : (
              <EmptyState query={response.queryEcho} />
            )}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 pt-4">
          Results are strictly limited to our curated inventory · Powered by
          Gemini AI
        </p>
      </div>
    </main>
  );
}
