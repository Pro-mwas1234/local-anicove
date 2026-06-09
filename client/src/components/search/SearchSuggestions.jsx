import { getTitle, getCoverImage } from "../../utils/helpers";
import { Star } from "lucide-react";

export default function SearchSuggestions({ suggestions, onSelect }) {
  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-surface-base border border-surface-border rounded-lg shadow-2xl shadow-black/50 overflow-hidden z-50 max-h-96 overflow-y-auto">
      {suggestions.map((anime) => (
        <button
          key={anime.id}
          onClick={() => onSelect(anime.id)}
          className="flex items-center gap-3 w-full px-4 py-3 hover:bg-surface-raised transition-colors text-left"
        >
          <img
            src={getCoverImage(anime)}
            alt={getTitle(anime)}
            className="w-10 h-14 rounded object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-primary truncate">
              {getTitle(anime)}
            </p>
            <div className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
              <span>{anime.format || "—"} · {anime.year || anime.seasonYear || "—"}</span>
              {anime.averageScore && (
                <>
                  <span>·</span>
                  <Star className="w-3 h-3 fill-current text-green-400" />
                  <span>{(anime.averageScore / 10).toFixed(1)}</span>
                </>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
