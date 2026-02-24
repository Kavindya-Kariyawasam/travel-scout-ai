"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import ResultCard from "@/components/ResultCard";
import EmptyState from "@/components/EmptyState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
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
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Compass
            className="w-10 h-10 text-emerald-500 mx-auto"
            strokeWidth={1.5}
          />
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Travel Scout
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Describe your ideal trip in plain English. Our AI will find the best
            matching experiences from our curated collection.
          </p>
        </div>

        {/* Search */}
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && <LoadingSkeleton />}

        {/* Results */}
        {!isLoading && response && (
          <div className="space-y-4">
            {response.totalFound > 0 ? (
              <>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
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
        <p className="text-center text-xs text-gray-300 pt-4">
          Results are strictly limited to our curated inventory · Powered by
          Gemini AI
        </p>
      </div>
    </main>
  );
}
