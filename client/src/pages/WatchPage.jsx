import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { getStreams, getEpisodes, getAnimeInfo, getSkipTimes, getRecommendations, getTrending, getPopular, getRecent } from "../services/api";
import VideoPlayer from "../components/player/VideoPlayer";
import EpisodeList from "../components/anime/EpisodeList";
import RelatedAnime from "../components/anime/RelatedAnime";
import TopRankingsAside from "../components/home/TopRankingsAside";
import { useWatchHistory } from "../hooks/useWatchHistory";
import { getTitle, getCoverImage } from "../utils/helpers";
import { findCurrentEpisodeIndex } from "../utils/episodeMatching";
import { Star } from "lucide-react";

export default function WatchPage() {
  const params = useParams();
  const location = useLocation();
  const watchId = params["*"] || ""; // splat route
  const [streamData, setStreamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allEpisodes, setAllEpisodes] = useState([]);
  const [currentEpIndex, setCurrentEpIndex] = useState(-1);
  const [currentProviderName, setCurrentProviderName] = useState(null);
  const [currentAudioType, setCurrentAudioType] = useState(null);
  const { updateProgress, getProgress } = useWatchHistory();
  const navigate = useNavigate();
  const [providersData, setProvidersData] = useState(null);
  const [skipTimes, setSkipTimes] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [animeInfo, setAnimeInfo] = useState(location.state?.anime || null);
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [recent, setRecent] = useState([]);
  const [isTheater, setIsTheater] = useState(false);

  // Info from navigation state
  const animeState = location.state || {};
  const animeTitle = animeState.anime ? getTitle(animeState.anime) : "";
  const episodeNumber = animeState.episodeNumber || "";
  const episodeTitle = animeState.episodeTitle || "";
  const animeCover = animeState.anime ? getCoverImage(animeState.anime) : "";
  const animeId = animeState.anime?.id;

  useEffect(() => {
    if (animeId) {
      getAnimeInfo(animeId)
        .then((data) => {
          if (data) setAnimeInfo(data);
        })
        .catch(() => {});
    }
  }, [animeId]);

  useEffect(() => {
    Promise.allSettled([
      getTrending(1, 10),
      getPopular(1, 10),
      getRecent(1, 10),
    ]).then(([trendRes, popRes, recRes]) => {
      if (trendRes.status === "fulfilled") setTrending(trendRes.value.results || []);
      if (popRes.status === "fulfilled") setPopular(popRes.value.results || []);
      if (recRes.status === "fulfilled") setRecent(recRes.value.results || []);
    });
  }, []);

  useEffect(() => {
    if (!animeId) return;
    getRecommendations(animeId)
      .then((data) => {
        const recs = data?.recommendations || [];
        setRecommendations(recs.map((r) => r.mediaRecommendation).filter(Boolean));
      })
      .catch((err) => console.error("Failed to fetch watch recommendations:", err));
  }, [animeId]);

  useEffect(() => {
    if (!watchId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getStreams(watchId)
      .then((data) => {
        if (!cancelled) {
          let unwrapped = data;
          if (data && data.ssub) unwrapped = data.ssub;
          else if (data && data.dub) unwrapped = data.dub;
          setStreamData(unwrapped);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [watchId]);

  // Load all episodes for next/prev navigation
  useEffect(() => {
    if (!animeId) return;

    getEpisodes(animeId)
      .then((data) => {
        if (data.providers) {
          setProvidersData(data.providers);
          // Find the provider/audio that matches our watchId
          for (const [provName, provData] of Object.entries(data.providers)) {
            for (const [audioType, eps] of Object.entries(provData.episodes || {})) {
              // Sort numerically to prevent bugs like 44 -> 6
              const sortedEps = [...eps].sort((a, b) => a.number - b.number);
              const idx = findCurrentEpisodeIndex(sortedEps, watchId);
              if (idx !== -1) {
                setAllEpisodes(sortedEps);
                setCurrentEpIndex(idx);
                setCurrentProviderName(provName);
                setCurrentAudioType(audioType);
                return;
              }
            }
          }
        }
      })
      .catch(() => {});
  }, [animeId, watchId]);

  // Fetch AniSkip times when episode is identified
  useEffect(() => {
    if (!animeId) return;

    let cancelled = false;

    const fetchSkips = async () => {
      try {
        let malId = animeState.anime?.idMal;
        if (!malId) {
          const info = await getAnimeInfo(animeId);
          malId = info.idMal;
        }
        if (!malId || cancelled) return;

        let currentNumber = episodeNumber;
        if (currentEpIndex >= 0 && allEpisodes[currentEpIndex]) {
          currentNumber = allEpisodes[currentEpIndex].number;
        }
        if (currentNumber === undefined || currentNumber === null || currentNumber === "") return;

        const data = await getSkipTimes(malId, currentNumber);
        if (!cancelled) {
          if (data && data.found) {
            setSkipTimes(data);
          } else {
            setSkipTimes(null);
          }
        }
      } catch (err) {
        if (!cancelled) setSkipTimes(null);
      }
    };

    fetchSkips();

    return () => {
      cancelled = true;
    };
  }, [animeId, currentEpIndex, allEpisodes, episodeNumber, animeState.anime]);

  const handleTimeUpdate = useCallback(
    ({ currentTime, duration }) => {
      if (animeId && watchId && duration > 0) {
        // Throttle to every 5 seconds
        if (Math.round(currentTime) % 5 === 0) {
          updateProgress({
            animeId,
            episodeId: watchId,
            episodeNumber,
            progress: currentTime,
            duration,
            animeTitle,
            coverImage: animeCover,
          });
        }
      }
    },
    [animeId, watchId, episodeNumber, animeTitle, animeCover, updateProgress]
  );

  const navigateEpisode = useCallback((ep) => {
    navigate(`/watch/${ep.id}`, {
      state: {
        anime: animeState.anime,
        episodeNumber: ep.number,
        episodeTitle: ep.title,
      }
    });
  }, [navigate, animeState.anime]);

  const hasPrev = currentEpIndex > 0;
  const hasNext = currentEpIndex >= 0 && currentEpIndex < allEpisodes.length - 1;

  const handlePrevEpisode = useCallback(() => {
    if (hasPrev) navigateEpisode(allEpisodes[currentEpIndex - 1]);
  }, [hasPrev, navigateEpisode, allEpisodes, currentEpIndex]);

  const handleNextEpisode = useCallback(() => {
    if (hasNext) navigateEpisode(allEpisodes[currentEpIndex + 1]);
  }, [hasNext, navigateEpisode, allEpisodes, currentEpIndex]);

  const displayTitle = episodeTitle
    ? `Episode ${episodeNumber}: ${episodeTitle}`
    : episodeNumber
    ? `Episode ${episodeNumber}`
    : "Playing...";

  const initialTime = getProgress(watchId);

  return (
    <div id="watch-page" className="pt-20 px-4 lg:px-16 pb-16 min-h-screen max-w-7xl mx-auto">
      {/* Back to anime */}
      {animeId && (
        <Link
          to={`/anime/${animeId}`}
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {animeTitle || "Details"}
        </Link>
      )}

      {/* Title */}
      <div className="mb-6">
        {animeTitle && (
          <h2 className="text-sm text-text-muted font-medium">{animeTitle}</h2>
        )}
        <h1 className="text-xl lg:text-2xl font-bold text-text-primary">
          {loading ? "Loading..." : displayTitle}
        </h1>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-netflix-red/10 border border-netflix-red/30 text-netflix-red rounded-lg p-4 mb-6">
          <p className="font-medium">Failed to load stream</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Player & Details Container */}
      <div className={`grid grid-cols-1 ${isTheater ? "gap-6" : "lg:grid-cols-4 gap-6"} items-start`}>
        {/* Left: Video Player */}
        <div className={`${isTheater ? "w-full" : "lg:col-span-3"} flex flex-col gap-4 min-w-0`}>
          {(!error && streamData) || loading ? (
            <>
              <VideoPlayer
                streams={streamData?.streams || []}
                subtitles={streamData?.subtitles || []}
                intro={
                  skipTimes?.results?.find((s) => s.skipType === "op" || s.skipType === "mixed-op")?.interval
                    ? {
                        start: skipTimes.results.find((s) => s.skipType === "op" || s.skipType === "mixed-op").interval.startTime,
                        end: skipTimes.results.find((s) => s.skipType === "op" || s.skipType === "mixed-op").interval.endTime,
                      }
                    : streamData?.intro
                }
                outro={
                  skipTimes?.results?.find((s) => s.skipType === "ed" || s.skipType === "mixed-ed")?.interval
                    ? {
                        start: skipTimes.results.find((s) => s.skipType === "ed" || s.skipType === "mixed-ed").interval.startTime,
                        end: skipTimes.results.find((s) => s.skipType === "ed" || s.skipType === "mixed-ed").interval.endTime,
                      }
                    : streamData?.outro
                }
                onTimeUpdate={handleTimeUpdate}
                initialTime={initialTime}
                hasPrev={hasPrev}
                hasNext={hasNext}
                onPrevEpisode={handlePrevEpisode}
                onNextEpisode={handleNextEpisode}
                title={displayTitle}
                isLoading={loading}
                isTheater={isTheater}
                onToggleTheater={() => setIsTheater(!isTheater)}
              />

              {/* External Next/Prev Buttons */}
              <div className="flex items-center justify-between mt-2">
                <div>
                  {hasPrev && (
                    <div className="relative group/extbtn">
                      {/* Tooltip */}
                      {allEpisodes[currentEpIndex - 1]?.image && (
                        <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover/extbtn:opacity-100 transition-opacity pointer-events-none z-10 w-40 bg-surface-base border border-surface-border rounded-lg overflow-hidden shadow-xl shadow-black/50">
                          <img 
                            src={allEpisodes[currentEpIndex - 1].image} 
                            alt="Previous Episode" 
                            className="w-full h-24 object-cover" 
                          />
                          <div className="p-2 text-xs font-medium text-text-primary truncate">
                            Ep {allEpisodes[currentEpIndex - 1].number}
                          </div>
                        </div>
                      )}
                      <button
                        onClick={handlePrevEpisode}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-base border border-surface-border text-text-primary text-sm font-medium hover:bg-surface-raised hover:border-text-muted transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous Episode
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  {hasNext && (
                    <div className="relative group/extbtn">
                      {/* Tooltip */}
                      {allEpisodes[currentEpIndex + 1]?.image && (
                        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover/extbtn:opacity-100 transition-opacity pointer-events-none z-10 w-40 bg-surface-base border border-surface-border rounded-lg overflow-hidden shadow-xl shadow-black/50">
                          <img 
                            src={allEpisodes[currentEpIndex + 1].image} 
                            alt="Next Episode" 
                            className="w-full h-24 object-cover" 
                          />
                          <div className="p-2 text-xs font-medium text-text-primary truncate">
                            Ep {allEpisodes[currentEpIndex + 1].number}
                          </div>
                        </div>
                      )}
                      <button
                        onClick={handleNextEpisode}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-base border border-surface-border text-text-primary text-sm font-medium hover:bg-surface-raised hover:border-text-muted transition-all"
                      >
                        Next Episode
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}

          {/* Troubleshooting note */}
          <p className="text-center text-text-muted text-xs mt-4">
            If the video is blank or loading infinitely, try selecting a different provider below.
          </p>
        </div>

        {/* Right: Anime Details Aside */}
        {animeInfo && (
          <div className={`${isTheater ? "w-full bg-surface-deep/80 border border-surface-border rounded-xl p-6 space-y-4 text-sm shadow-xl" : "lg:col-span-1 bg-surface-deep/80 border border-surface-border rounded-xl p-4 lg:p-5 space-y-4 text-sm shadow-xl shrink-0"}`}>
            <div className={`flex ${isTheater ? "flex-col sm:flex-row gap-6 items-start text-left" : "sm:flex-row lg:flex-col gap-4 items-center sm:items-start lg:items-center text-center sm:text-left lg:text-center"}`}>
              <img
                src={getCoverImage(animeInfo)}
                alt={getTitle(animeInfo)}
                className={`${isTheater ? "w-32 sm:w-40 rounded-lg shadow-lg border border-surface-border object-cover shrink-0" : "w-28 sm:w-32 lg:w-40 rounded-lg shadow-lg border border-surface-border mx-auto sm:mx-0 lg:mx-auto object-cover shrink-0"}`}
              />
              <div className="space-y-2 min-w-0 flex-1">
                <h3 className="font-bold text-base lg:text-lg text-text-primary line-clamp-2 leading-snug">
                  {getTitle(animeInfo)}
                </h3>
                <div className={`flex flex-wrap items-center ${isTheater ? "justify-start" : "justify-center sm:justify-start lg:justify-center"} gap-2 text-xs`}>
                  {animeInfo.averageScore && (
                    <span className="flex items-center gap-1 text-yellow-400 font-bold bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                      <Star className="w-3.5 h-3.5 fill-current" /> {(animeInfo.averageScore / 10).toFixed(1)}
                    </span>
                  )}
                  {animeInfo.format && (
                    <span className="bg-netflix-red text-white font-bold px-2 py-0.5 rounded">
                      {animeInfo.format}
                    </span>
                  )}
                  {animeInfo.status && (
                    <span className="bg-surface-base text-text-secondary px-2 py-0.5 rounded border border-surface-border capitalize">
                      {animeInfo.status.toLowerCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {animeInfo.genres && animeInfo.genres.length > 0 && (
              <div className="pt-3 border-t border-surface-border/60">
                <div className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">Genres</div>
                <div className="flex flex-wrap gap-1.5">
                  {animeInfo.genres.slice(0, 6).map((g) => (
                    <Link
                      key={g}
                      to={`/browse?genre=${g}`}
                      className="text-[11px] bg-surface-base hover:bg-surface-raised text-text-secondary hover:text-white px-2 py-1 rounded transition-colors"
                    >
                      {g}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {animeInfo.description && (
              <div className="pt-3 border-t border-surface-border/60">
                <div className="text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">Synopsis</div>
                <p className="text-xs text-text-secondary leading-relaxed line-clamp-6" dangerouslySetInnerHTML={{ __html: animeInfo.description }} />
              </div>
            )}

            <div className="pt-3 border-t border-surface-border/60 text-center">
              <Link
                to={`/anime/${animeInfo.id}`}
                className="inline-block w-full py-2 px-4 rounded-lg bg-netflix-red/10 hover:bg-netflix-red text-netflix-red hover:text-white text-xs font-bold transition-all border border-netflix-red/30 hover:border-netflix-red"
              >
                View Full Anime Details
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Episodes List */}
      {providersData && !loading && (
        <div className="mt-8 border-t border-surface-border pt-8">
          <EpisodeList
            providers={providersData}
            onPlayEpisode={navigateEpisode}
            currentEpisodeId={watchId}
            initialProvider={currentProviderName}
            initialAudioType={currentAudioType}
          />
        </div>
      )}

      {/* Recommendations & Ranking Aside */}
      <div className="mt-12 border-t border-surface-border pt-8 flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 min-w-0 w-full">
          {recommendations.length > 0 ? (
            <RelatedAnime recommendations={recommendations} />
          ) : (
            <div className="text-text-muted text-sm py-4">No recommendations available.</div>
          )}
        </div>
        <aside className="w-full lg:w-80 shrink-0">
          <TopRankingsAside trending={trending} popular={popular} recent={recent} />
        </aside>
      </div>
    </div>
  );
}
