import { MapPin, Sparkles } from "lucide-react";
import { MatchedResult } from "@/lib/types";

interface ResultCardProps {
  result: MatchedResult;
  rank: number;
}

const TAG_COLORS: Record<string, string> = {
  beach: "bg-blue-100 text-blue-700",
  surfing: "bg-cyan-100 text-cyan-700",
  "young-vibe": "bg-purple-100 text-purple-700",
  history: "bg-amber-100 text-amber-700",
  culture: "bg-orange-100 text-orange-700",
  walking: "bg-lime-100 text-lime-700",
  animals: "bg-green-100 text-green-700",
  adventure: "bg-red-100 text-red-700",
  photography: "bg-pink-100 text-pink-700",
  cold: "bg-sky-100 text-sky-700",
  nature: "bg-emerald-100 text-emerald-700",
  hiking: "bg-teal-100 text-teal-700",
  climbing: "bg-rose-100 text-rose-700",
  view: "bg-violet-100 text-violet-700",
  default: "bg-gray-100 text-gray-600",
};

function getTagColor(tag: string): string {
  return TAG_COLORS[tag] ?? TAG_COLORS.default;
}

export default function ResultCard({ result, rank }: ResultCardProps) {
  const { item, reason } = result;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-5 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
            {rank}
          </span>
          <div>
            <h3 className="font-semibold text-gray-900 text-base leading-snug">
              {item.title}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {item.location}
            </p>
          </div>
        </div>
        <span className="flex-shrink-0 text-base font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl">
          ${item.price}
        </span>
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
      <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
        <Sparkles className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-emerald-800 leading-relaxed">{reason}</p>
      </div>
    </div>
  );
}
