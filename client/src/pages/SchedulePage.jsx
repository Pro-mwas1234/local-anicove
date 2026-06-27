import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getWeeklySchedule } from "../services/api";
import { getTitle, getCoverImage } from "../utils/helpers";
import { Clock, Calendar, Tv } from "lucide-react";

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CountdownBadge({ targetTime }) {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, Math.floor((targetTime - Date.now()) / 1000)));

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  if (timeLeft <= 0) {
    return <span className="bg-surface-border text-text-muted px-2 py-0.5 rounded text-xs font-semibold">Aired</span>;
  }

  const d = Math.floor(timeLeft / 86400);
  const h = Math.floor((timeLeft % 86400) / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;

  return (
    <span className="bg-netflix-red text-white font-mono text-xs px-2 py-0.5 rounded shadow font-bold tracking-tight">
      {d > 0 ? `${d}d ` : ""}{h > 0 ? `${h}h ` : ""}{m}m {s}s
    </span>
  );
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState("all");

  useEffect(() => {
    getWeeklySchedule()
      .then((data) => setSchedule(data))
      .catch((err) => console.error("Schedule error:", err))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().getDay();
  const todayName = DAY_NAMES[today];

  // Build schedule grouped by day
  const groupedSchedule = (schedule?.results || []).reduce((acc, anime) => {
    const airingAt = anime.airingAt;
    if (!airingAt) return acc;
    const date = new Date(airingAt * 1000);
    const dayName = DAY_NAMES[date.getDay()];

    if (!acc[dayName]) acc[dayName] = [];
    if (!acc[dayName].some((a) => a.id === anime.id)) {
      acc[dayName].push(anime);
    }
    return acc;
  }, {});

  // Sort days starting from today
  const sortedDays = [...DAY_NAMES].sort((a, b) => {
    const dayOrder = (d) => {
      const idx = DAY_NAMES.indexOf(d);
      return (idx - today + 7) % 7;
    };
    return dayOrder(a) - dayOrder(b);
  });

  const visibleDays = activeDay === "all" ? sortedDays : sortedDays.filter((d) => d === activeDay);

  return (
    <div id="schedule-page" className="pt-24 px-5 lg:px-24 pb-16 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-text-primary flex items-center gap-3">
            <Calendar className="w-8 h-8 text-netflix-red" />
            Airing Schedule
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Track weekly anime episode release times and live countdowns
          </p>
        </div>
      </div>

      {/* Day tabs */}
      <div className="flex items-center gap-2 mb-10 overflow-x-auto hide-scrollbar pb-2 border-b border-surface-border">
        <button
          onClick={() => setActiveDay("all")}
          className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all whitespace-nowrap cursor-pointer border-b-2 ${
            activeDay === "all"
              ? "bg-netflix-red/10 border-netflix-red text-netflix-red"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          All Days
        </button>
        {sortedDays.map((dayName) => {
          const dayIdx = DAY_NAMES.indexOf(dayName);
          const isToday = dayName === todayName;
          const label = DAY_LABELS[dayIdx];

          return (
            <button
              key={dayName}
              onClick={() => setActiveDay(dayName)}
              className={`relative px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all whitespace-nowrap cursor-pointer border-b-2 ${
                activeDay === dayName
                  ? "bg-netflix-red/10 border-netflix-red text-netflix-red"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              {label}
              {isToday && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-netflix-red text-white rounded text-[10px] uppercase font-extrabold">
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-8">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-4">
              <div className="skeleton h-8 w-48 rounded" />
              <div className="space-y-4 pl-6 border-l-2 border-surface-border">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="skeleton h-24 w-full rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-14">
          {visibleDays.map((dayName) => {
            const animeList = groupedSchedule[dayName] || [];
            const isToday = dayName === todayName;

            // Sort anime by airing time chronologically
            const sortedAnime = [...animeList].sort((a, b) => (a.airingAt || 0) - (b.airingAt || 0));

            return (
              <div key={dayName} className="relative">
                {/* Day Header */}
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-black text-text-primary capitalize flex items-center gap-2.5">
                    {dayName}
                  </h2>
                  {isToday && (
                    <span className="bg-netflix-red text-white text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
                      Active Today
                    </span>
                  )}
                  <span className="text-sm font-medium text-text-muted bg-surface-base px-2.5 py-1 rounded-md border border-surface-border">
                    {sortedAnime.length} {sortedAnime.length === 1 ? "show" : "shows"}
                  </span>
                </div>

                {sortedAnime.length > 0 ? (
                  /* Vertical Timeline Layout with Exact Alignment & Responsive Cards */
                  <div className="relative flex gap-4 sm:gap-6 ml-2">
                    {/* Continuous Vertical Timeline Line */}
                    <div className="absolute left-[7px] top-2 bottom-0 w-[2px] bg-netflix-red/40" />

                    <div className="flex-1 space-y-8 min-w-0">
                      {(() => {
                        const timeGroups = [];
                        const groupMap = {};

                        sortedAnime.forEach((anime) => {
                          const targetTime = (anime.airingAt || 0) * 1000;
                          const dateObj = new Date(targetTime);
                          const timeString = dateObj.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                          if (!groupMap[timeString]) {
                            groupMap[timeString] = { timeString, targetTime, animeList: [] };
                            timeGroups.push(groupMap[timeString]);
                          }
                          groupMap[timeString].animeList.push(anime);
                        });

                        return timeGroups.map((group) => (
                          <div key={group.timeString} className="relative flex items-start gap-4 sm:gap-6 group">
                            {/* Timeline dot (16px wide, center at 8px, perfectly concentric with left-[7px] 2px line) */}
                            <div className="w-4 h-4 rounded-full bg-surface-deep border-4 border-netflix-red shrink-0 z-10 mt-1.5 group-hover:scale-125 transition-transform" />

                            <div className="flex-1 min-w-0">
                              {/* Time Header & Countdown */}
                              <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="flex items-center gap-1.5 text-sm font-bold text-netflix-red bg-netflix-red/10 px-3 py-1 rounded-md border border-netflix-red/20 shadow-sm">
                                  <Clock className="w-4 h-4" />
                                  {group.timeString}
                                </span>
                                <CountdownBadge targetTime={group.targetTime} />
                              </div>

                              {/* Responsive Cards Container */}
                              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                                {group.animeList.map((anime) => (
                                  <div key={`${anime.id}-${anime.airingAt}`} className="w-full sm:w-32 md:w-36 shrink-0">
                                    {/* Mobile Landscape Card (< 640px) */}
                                    <Link
                                      to={`/anime/${anime.id}`}
                                      className="flex sm:hidden items-center justify-between gap-3 p-2.5 rounded-lg bg-surface-base border border-surface-border hover:border-text-muted transition-all shadow-md group/mcard"
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        <img
                                          src={getCoverImage(anime)}
                                          alt={getTitle(anime)}
                                          className="w-14 h-18 rounded object-cover shrink-0 shadow"
                                          loading="lazy"
                                        />
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            {anime.next_episode && (
                                              <span className="text-[10px] font-bold text-text-primary bg-surface-border px-1.5 py-0.5 rounded">
                                                Ep {anime.next_episode}
                                              </span>
                                            )}
                                            <span className="text-[10px] font-bold text-white bg-netflix-red px-1.5 py-0.5 rounded">
                                              {anime.format || "TV"}
                                            </span>
                                          </div>
                                          <h4 className="text-xs font-bold text-text-primary truncate group-hover/mcard:text-netflix-red transition-colors">
                                            {getTitle(anime)}
                                          </h4>
                                          <div className="text-[11px] text-text-muted mt-0.5 font-medium">
                                            {group.timeString}
                                          </div>
                                        </div>
                                      </div>
                                    </Link>

                                    {/* Desktop Vertical Poster Card (>= 640px) */}
                                    <Link
                                      to={`/anime/${anime.id}`}
                                      className="hidden sm:flex group/card bg-surface-base rounded-lg overflow-hidden border border-surface-border hover:border-text-muted transition-all hover:scale-[1.03] flex-col shadow-md h-full w-full"
                                    >
                                      <div className="relative aspect-2/3 overflow-hidden bg-surface-deep">
                                        <img
                                          src={getCoverImage(anime)}
                                          alt={getTitle(anime)}
                                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                                          loading="lazy"
                                        />
                                        {anime.next_episode && (
                                          <div className="absolute top-1.5 left-1.5 bg-netflix-red text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                                            EP {anime.next_episode}
                                          </div>
                                        )}
                                        {anime.airingAt && (
                                          <div className={`absolute top-1.5 right-1.5 text-[8px] font-bold px-1 py-0.5 rounded shadow ${
                                            anime.airingAt * 1000 < Date.now() ? "bg-black/80 text-text-muted" : "bg-green-600 text-white"
                                          }`}>
                                            {anime.airingAt * 1000 < Date.now() ? "AIRED" : "UPCOMING"}
                                          </div>
                                        )}
                                      </div>
                                      <div className="p-2 flex-1 flex flex-col justify-between">
                                        <h4 className="text-[11px] font-medium text-text-primary line-clamp-2 group-hover/card:text-netflix-red transition-colors leading-tight">
                                          {getTitle(anime)}
                                        </h4>
                                        <div className="flex items-center justify-between text-[9px] text-text-muted mt-1.5 pt-1 border-t border-surface-border/50">
                                          <span>{anime.format || "TV"}</span>
                                          {anime.duration && <span>{anime.duration}m</span>}
                                        </div>
                                      </div>
                                    </Link>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center rounded-xl border border-dashed border-surface-border bg-surface-base/30">
                    <Tv className="w-10 h-10 text-text-muted mx-auto mb-2 opacity-50" />
                    <p className="text-text-muted text-sm font-medium">No anime broadcasts scheduled for this day.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
