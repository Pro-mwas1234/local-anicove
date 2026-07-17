import { useState, useEffect } from "react";
import HeroBanner from "../components/home/HeroBanner";
import SwiperCarousel from "../components/home/SwiperCarousel";
import TopRankingsAside from "../components/home/TopRankingsAside";
import { getTrending, getPopular, getRecent, getUpcoming, getSpotlight } from "../services/api";
import { useWatchHistory } from "../hooks/useWatchHistory";
import { useSettings } from "../contexts/SettingsContext";
import { Link } from "react-router-dom";
import { formatTime } from "../utils/helpers";
import { Flame, Star, Tv, CalendarClock } from "lucide-react";

export default function HomePage() {
  const [spotlight, setSpotlight] = useState([]);
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [recent, setRecent] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getContinueWatching, removeFromHistory } = useWatchHistory();
  const { includeAdult } = useSettings();

  useEffect(() => {
    const load = async () => {
      try {
        const [spotRes, trendRes, popRes, recRes, upRes] = await Promise.allSettled([
          getSpotlight(includeAdult),
          getTrending(1, 20, includeAdult),
          getPopular(1, 20, includeAdult),
          getRecent(1, 20, includeAdult),
          getUpcoming(1, 20, includeAdult),
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
                <div
                  key={item.episodeId}
                  className="shrink-0 w-60 bg-surface-base rounded-lg overflow-hidden border border-surface-border hover:border-text-muted transition-colors group relative"
                >
                  <Link
                    to={`/anime/${item.animeId}`}
                    className="block"
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

                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromHistory(item.episodeId);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/70 text-white/80 hover:bg-netflix-red hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 backdrop-blur-sm shadow-lg"
                    title="Remove from Continue Watching"
                    aria-label={`Remove ${item.animeTitle} from continue watching`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main carousels */}
          <div className="flex-1 w-full min-w-0 space-y-10">
            <SwiperCarousel 
              title={<span className="flex items-center gap-2"><Flame className="text-orange-500 w-6 h-6 lg:w-7 lg:h-7" /> Trending Now</span>} 
              anime={trending} 
              loading={loading} 
            />
            <SwiperCarousel 
              title={<span className="flex items-center gap-2"><Star className="text-yellow-400 w-6 h-6 lg:w-7 lg:h-7" /> Most Popular</span>} 
              anime={popular} 
              loading={loading} 
            />
            <SwiperCarousel 
              title={<span className="flex items-center gap-2"><Tv className="text-blue-400 w-6 h-6 lg:w-7 lg:h-7" /> Recently Updated</span>} 
              anime={recent} 
              loading={loading} 
            />
            <SwiperCarousel 
              title={<span className="flex items-center gap-2"><CalendarClock className="text-purple-400 w-6 h-6 lg:w-7 lg:h-7" /> Upcoming</span>} 
              anime={upcoming} 
              loading={loading} 
            />
          </div>

          {/* Aside Rankings */}
          <aside className="w-full lg:w-80 shrink-0 sticky top-24">
            <TopRankingsAside trending={trending} popular={popular} recent={recent} />
          </aside>
        </div>
      </div>
    </div>
  );
}
