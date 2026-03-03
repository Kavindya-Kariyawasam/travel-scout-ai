import { MapPin, Sparkles } from "lucide-react";
import { MatchedResult } from "@/lib/types";

interface ResultCardProps {
  result: MatchedResult;
  rank: number;
}

const TAG_COLORS: Record<string, string> = {
  beach: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  surfing: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  "young-vibe":
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  history:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  culture:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  walking: "bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300",
  animals:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  adventure: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  photography:
    "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  cold: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  nature:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  hiking: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  climbing: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  view: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  default: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
};

function getTagColor(tag: string): string {
  return TAG_COLORS[tag] ?? TAG_COLORS.default;
}

export default function ResultCard({ result, rank }: ResultCardProps) {
  const { item, reason, similarity } = result;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition p-5 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center">
            {rank}
          </span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug">
              {item.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {item.location}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-xl">
            ${item.price}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {Math.round(similarity * 100)}% match
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${getTagColor(tag)}`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* AI Reasoning */}
      <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 rounded-xl px-3 py-2.5">
        <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
          {reason}
        </p>
      </div>
    </div>
  );
}
