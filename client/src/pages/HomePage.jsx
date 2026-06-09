import { useState, useEffect } from "react";
import HeroBanner from "../components/home/HeroBanner";
import AnimeCarousel from "../components/home/AnimeCarousel";
import { getTrending, getPopular, getRecent, getUpcoming, getSpotlight } from "../services/api";
import { useWatchHistory } from "../hooks/useWatchHistory";
import { Link } from "react-router-dom";
import { getTitle, getCoverImage, formatTime } from "../utils/helpers";

export default function HomePage() {
  const [spotlight, setSpotlight] = useState([]);
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [recent, setRecent] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getContinueWatching } = useWatchHistory();

  useEffect(() => {
    const load = async () => {
      try {
        const [spotRes, trendRes, popRes, recRes, upRes] = await Promise.allSettled([
          getSpotlight(1, 8),
          getTrending(1, 20),
          getPopular(1, 20),
          getRecent(1, 20),
          getUpcoming(1, 20),
        ]);

        if (spotRes.status === "fulfilled") setSpotlight(spotRes.value.results || []);
        if (trendRes.status === "fulfilled") setTrending(trendRes.value.results || []);
        if (popRes.status === "fulfilled") setPopular(popRes.value.results || []);
        if (recRes.status === "fulfilled") setRecent(recRes.value.results || []);
        if (upRes.status === "fulfilled") setUpcoming(upRes.value.results || []);
      } catch (err) {
        console.error("Failed to load home data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const continueWatching = getContinueWatching();

  return (
    <div id="home-page">
      {/* Hero Banner */}
      <HeroBanner anime={spotlight.length > 0 ? spotlight : trending} />

      {/* Content rows */}
      <div className="relative z-10 -mt-16 lg:-mt-24 space-y-10 lg:space-y-14 px-5 lg:px-24 pb-16">
        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl lg:text-2xl font-bold text-text-primary">
              Continue Watching
            </h2>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              {continueWatching.map((item) => (
                <Link
                  key={item.episodeId}
                  to={`/anime/${item.animeId}`}
                  className="shrink-0 w-60 bg-surface-base rounded-lg overflow-hidden border border-surface-border hover:border-text-muted transition-colors group"
                >
                  <div className="relative">
                    <img
                      src={item.coverImage || "/placeholder.svg"}
                      alt={item.animeTitle}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-border">
                      <div
                        className="h-full bg-netflix-red"
                        style={{
                          width: `${Math.min((item.progress / item.duration) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {item.animeTitle}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      EP {item.episodeNumber} · {formatTime(item.progress)} left
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <AnimeCarousel title="🔥 Trending Now" anime={trending} loading={loading} />
        <AnimeCarousel title="⭐ Most Popular" anime={popular} loading={loading} />
        <AnimeCarousel title="📺 Recently Updated" anime={recent} loading={loading} />
        <AnimeCarousel title="🔜 Upcoming" anime={upcoming} loading={loading} />
      </div>
    </div>
  );
}
