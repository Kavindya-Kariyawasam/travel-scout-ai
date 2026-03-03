"use client";

import { useState, KeyboardEvent } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const EXAMPLE_QUERIES = [
  "chilled beach weekend with surfing vibes under $100",
  "something adventurous and wild",
  "history and culture on a tight budget",
  "dramatic views and climbing under $120",
];

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim() && !isLoading) onSearch(query.trim());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Describe your ideal trip... e.g. "beach weekend under $100"'
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-500 focus:border-transparent transition text-sm"
          maxLength={300}
          disabled={isLoading}
        />
        <button
          onClick={handleSearch}
          disabled={!query.trim() || isLoading}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 text-white font-semibold rounded-xl shadow-sm transition text-sm whitespace-nowrap"
        >
          {isLoading ? "Searching..." : "Find Experiences"}
        </button>
      </div>

      {/* Example query chips */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 self-center">
          Try:
        </span>
        {EXAMPLE_QUERIES.map((example) => (
          <button
            key={example}
            onClick={() => {
              setQuery(example);
              onSearch(example);
            }}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-400 text-gray-600 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition disabled:opacity-50"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
