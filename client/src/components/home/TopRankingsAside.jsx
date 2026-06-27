import { useState } from "react";
import { Link } from "react-router-dom";
import { getTitle } from "../../utils/helpers";
import { Trophy, Flame, Star, Clock } from "lucide-react";

export default function TopRankingsAside({ trending = [], popular = [], recent = [] }) {
  const [tab, setTab] = useState("daily");

  const tabs = [
    { id: "daily", label: "Daily", icon: Flame, data: trending },
    { id: "weekly", label: "Weekly", icon: Trophy, data: popular },
    { id: "monthly", label: "Monthly", icon: Clock, data: recent },
    { id: "alltime", label: "All Time", icon: Star, data: [...popular].sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0)) },
  ];

  const currentTab = tabs.find((t) => t.id === tab) || tabs[0];
  const items = (currentTab.data || []).slice(0, 10);

  return (
    <div className="bg-surface-deep/80 border border-surface-border rounded-xl p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-netflix-red" />
        <h3 className="text-lg font-bold text-text-primary">Top Rankings</h3>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 bg-black/40 p-1 rounded-lg mb-4">
        {tabs.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center justify-center py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? "bg-netflix-red text-white shadow"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Ranking List */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-6">No ranking data</p>
        ) : (
          items.map((anime, idx) => {
            const rank = idx + 1;
            const rankColor =
              rank === 1
                ? "bg-yellow-500 text-black font-extrabold"
                : rank === 2
                ? "bg-gray-300 text-black font-bold"
                : rank === 3
                ? "bg-amber-700 text-white font-bold"
                : "bg-surface-border text-text-muted font-medium";

            return (
              <Link
                key={anime.id}
                to={`/anime/${anime.id}`}
                className="flex items-center gap-3 group p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <span className={`w-6 h-6 rounded flex items-center justify-center text-xs shrink-0 ${rankColor}`}>
                  {rank}
                </span>
                <img
                  src={anime.coverImage?.large || anime.coverImage?.extraLarge}
                  alt={getTitle(anime)}
                  className="w-10 h-14 object-cover rounded shrink-0 shadow"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-text-primary truncate group-hover:text-netflix-red transition-colors">
                    {getTitle(anime)}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                    {anime.format && <span>{anime.format}</span>}
                    {anime.averageScore && (
                      <span className="flex items-center gap-0.5 text-yellow-400">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        {anime.averageScore / 10}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
