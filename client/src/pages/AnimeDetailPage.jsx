import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAnimeInfo, getEpisodes, getRelations, getRecommendations, getAnimeList, saveAnimeListEntry } from "../services/api";
import {
  getTitle, truncateText, getBannerImage, getCoverImage,
  formatScore, formatStatus, formatDate, formatEpisodes, capitalize,
} from "../utils/helpers";
import CharacterList from "../components/anime/CharacterList";
import RelatedAnime from "../components/anime/RelatedAnime";
import Badge from "../components/ui/Badge";
import { SkeletonDetail } from "../components/ui/Skeleton";
import { useMyList } from "../hooks/useMyList";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { Star, Home, ChevronRight } from "lucide-react";
import TrailerModal from "../components/ui/TrailerModal";
import { ANILIST_MEDIA_STATUS, ANILIST_LIST_STATUS_MAP } from "../utils/constants";

export default function AnimeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [anime, setAnime] = useState(null);
  const [providers, setProviders] = useState(null);
  const [relations, setRelations] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const { isInList, toggleList } = useMyList();
  const { showToast } = useToast();

  // AniList tracking state
  const [listEntry, setListEntry] = useState(null);
  const [entryLoading, setEntryLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedScore, setSelectedScore] = useState(0);
  const [selectedProgress, setSelectedProgress] = useState(0);
  const [showTrackingPanel, setShowTrackingPanel] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setAnime(null);
    setProviders(null);

    Promise.allSettled([
      getAnimeInfo(id),
      getEpisodes(id),
      getRelations(id),
      getRecommendations(id),
    ]).then(([infoRes, epRes, relRes, recRes]) => {
      if (cancelled) return;

      if (infoRes.status === "fulfilled") setAnime(infoRes.value);
      if (epRes.status === "fulfilled") setProviders(epRes.value.providers || null);
      if (relRes.status === "fulfilled") {
        const rels = relRes.value?.relations || [];
        setRelations(rels.map(r => ({ ...r.node, relationType: r.relationType })));
      }
      if (recRes.status === "fulfilled") {
        const recs = recRes.value?.recommendations || [];
        setRecommendations(recs.map(r => r.mediaRecommendation).filter(Boolean));
      }
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [id]);

  // Fetch AniList entry for this anime if authenticated
  useEffect(() => {
    if (!isAuthenticated || !id || loading) return;

    let cancelled = false;
    setEntryLoading(true);

    getAnimeList({})
      .then((data) => {
        if (cancelled) return;
        // Search through all lists for our media
        const lists = data?.lists || [];
        for (const list of lists) {
          const entry = list?.entries?.find((e) => e.media?.id === parseInt(id));
          if (entry) {
            setListEntry(entry);
            setSelectedStatus(entry.status || "");
            setSelectedScore(entry.score || 0);
            setSelectedProgress(entry.progress || 0);
            return;
          }
        }
        // No entry found
        setListEntry(null);
        setSelectedStatus("");
        setSelectedScore(0);
        setSelectedProgress(0);
      })
      .catch(() => {
        if (!cancelled) {
          setListEntry(null);
        }
      })
      .finally(() => {
        if (!cancelled) setEntryLoading(false);
      });

    return () => { cancelled = true; };
  }, [isAuthenticated, id, loading]);

  const handleSaveListEntry = async () => {
    if (!selectedStatus) return;

    setEntryLoading(true);
    try {
      const result = await saveAnimeListEntry({
        mediaId: parseInt(id),
        status: selectedStatus,
        score: selectedScore || 0,
        progress: selectedProgress || 0,
      });

      if (result?.entry) {
        setListEntry(result.entry);
        setShowTrackingPanel(false);
      }
    } catch (err) {
      console.error("Failed to save AniList entry:", err);
    } finally {
      setEntryLoading(false);
    }
  };

  const handleRemoveFromList = async () => {
    setEntryLoading(true);
    try {
      const result = await saveAnimeListEntry({ mediaId: parseInt(id), status: null });
      if (result) {
        setListEntry(null);
        setSelectedStatus("");
        setSelectedScore(0);
        setSelectedProgress(0);
        setShowTrackingPanel(false);
      }
    } catch (err) {
      console.error("Failed to remove AniList entry:", err);
    } finally {
      setEntryLoading(false);
    }
  };

  if (loading) return <SkeletonDetail />;
  if (!anime) {
    return (
      <div className="pt-24 px-5 lg:px-24 text-center">
        <p className="text-text-muted text-lg">Anime not found.</p>
        <Link to="/" className="text-netflix-red mt-4 inline-block">Go Home</Link>
      </div>
    );
  }

  const title = getTitle(anime);
  const banner = getBannerImage(anime);
  const cover = getCoverImage(anime);
  const description = anime.description?.replace(/<[^>]*>/g, "") || "";

  // Get current status badge info
  const currentStatusInfo = ANILIST_MEDIA_STATUS.find((s) => s.value === selectedStatus);
  const currentEntryLabel = listEntry ? ANILIST_LIST_STATUS_MAP[listEntry.status] || listEntry.status : null;

  const handleWatchNow = () => {
    const provKeys = Object.keys(providers || {});
    const kiwiKey = provKeys.find((k) => k.toLowerCase() === "kiwi");
    const chosenProvKey = kiwiKey || provKeys[0];
    const chosenProv = providers?.[chosenProvKey];
    const firstAudioKey = Object.keys(chosenProv?.episodes || {})[0];
    const eps = chosenProv?.episodes?.[firstAudioKey] || [];
    const sorted = [...eps].sort((a, b) => a.number - b.number);
    const firstEp = sorted[0];
    if (firstEp) {
      navigate(`/watch/${firstEp.id}`, {
        state: { anime, episodeNumber: firstEp.number, episodeTitle: firstEp.title },
      });
    }
  };

  return (
    <div id="anime-detail-page">
      {/* Banner */}
      {banner && (
        <div className="relative w-full h-[40vh] lg:h-[50vh]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${banner})` }}
          />
          <div className="absolute inset-0 gradient-overlay-bottom" />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}

      {/* Breadcrumbs */}
      <div className={`relative z-10 px-5 lg:px-24 ${banner ? "-mt-32 pt-8" : "pt-24"}`}>
        <nav className="flex items-center gap-2 text-xs text-text-muted mb-6" aria-label="Breadcrumb">
          <Link to="/" className="flex items-center gap-1 hover:text-text-primary transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/browse" className="hover:text-text-primary transition-colors">Browse</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-text-secondary truncate max-w-[200px] sm:max-w-xs">{title}</span>
        </nav>
      </div>

      {/* Content */}
      <div className={`relative z-10 px-5 lg:px-24 pb-16 ${banner ? "-mt-16" : ""}`}>
        <div className="flex flex-col md:flex-row gap-8 mb-10">
          {/* Cover */}
          <div className="shrink-0">
            <img
              src={cover}
              alt={title}
              className="w-48 lg:w-56 rounded-lg shadow-2xl shadow-black/60 border border-surface-border"
            />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl lg:text-4xl font-black text-text-primary leading-tight">
              {title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {anime.averageScore && (
                <span className="flex items-center gap-1 text-yellow-400 font-bold">
                  <Star className="w-4 h-4 fill-current" /> {formatScore(anime.averageScore)}
                </span>
              )}
              {anime.format && (
                <Badge variant="outline">{anime.format}</Badge>
              )}
              {anime.status && (
                <Badge variant={anime.status === "RELEASING" ? "red" : "outline"}>
                  {formatStatus(anime.status)}
                </Badge>
              )}
              {anime.episodes && (
                <span className="text-text-secondary">{formatEpisodes(anime.episodes)}</span>
              )}
              {anime.duration && (
                <span className="text-text-secondary">{anime.duration} min</span>
              )}
              {anime.seasonYear && (
                <span className="text-text-secondary">{anime.season ? capitalize(anime.season) + " " : ""}{anime.seasonYear}</span>
              )}
              {/* AniList entry badge */}
              {currentEntryLabel && (
                <span className="flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-xs font-semibold">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.625 21.75a.75.75 0 00.75-.75V3.375a1.5 1.5 0 00-3 0V21a.75.75 0 00.75.75zm5.625 0a.75.75 0 00.75-.75V3.375a1.5 1.5 0 00-3 0V21a.75.75 0 00.75.75zm5.625.75a.75.75 0 00.75-.75V3.375a1.5 1.5 0 00-3 0V21a.75.75 0 00.75.75z" />
                  </svg>
                  {currentEntryLabel}
                  {listEntry?.score > 0 && ` · ${listEntry.score}/10`}
                  {listEntry?.progress > 0 && ` · Ep ${listEntry.progress}`}
                </span>
              )}
            </div>

            {/* Genres */}
            {anime.genres && (
              <div className="flex flex-wrap gap-2">
                {anime.genres.map((genre) => (
                  <Link
                    key={genre}
                    to={`/browse?genre=${genre}`}
                    className="text-xs font-medium text-text-secondary bg-surface-base px-3 py-1.5 rounded-lg hover:bg-surface-raised hover:text-text-primary transition-colors"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            )}

            {/* Description */}
            {description && (
              <div>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {showFullDesc ? description : truncateText(description, 300)}
                </p>
                {description.length > 300 && (
                  <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="text-netflix-red text-sm mt-1 hover:underline"
                  >
                    {showFullDesc ? "Show Less" : "Read More"}
                  </button>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-2">
              {providers && (
                <button
                  onClick={handleWatchNow}
                  className="flex items-center gap-2 bg-netflix-red hover:bg-netflix-red-hover text-white font-semibold px-6 py-3 rounded transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Watch Now
                </button>
              )}
              <button
                onClick={() => {
                  const wasInList = isInList(anime.id);
                  toggleList(anime);
                  showToast(wasInList ? "Removed from My List" : "Added to My List", wasInList ? "info" : "success");
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded font-medium transition-colors ${
                  isInList(anime.id)
                    ? "bg-white/20 text-white border border-white/30"
                    : "bg-surface-base border border-surface-border text-text-primary hover:bg-surface-raised"
                }`}
              >
                {isInList(anime.id) ? (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    In My List
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    My List
                  </>
                )}
              </button>

              {/* AniList Tracking Button */}
              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setShowTrackingPanel(!showTrackingPanel)}
                    className={`flex items-center gap-2 px-4 py-3 rounded font-medium transition-colors border text-sm ${
                      listEntry
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        : "bg-surface-base border-surface-border text-text-secondary hover:text-text-primary hover:bg-surface-raised"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6.625 21.75a.75.75 0 00.75-.75V3.375a1.5 1.5 0 00-3 0V21a.75.75 0 00.75.75zm5.625 0a.75.75 0 00.75-.75V3.375a1.5 1.5 0 00-3 0V21a.75.75 0 00.75.75zm5.625.75a.75.75 0 00.75-.75V3.375a1.5 1.5 0 00-3 0V21a.75.75 0 00.75.75z" />
                    </svg>
                    {listEntry ? "Update Tracking" : "Add to List"}
                  </button>

                  {/* Tracking Panel */}
                  {showTrackingPanel && (
                    <div className="absolute left-0 mt-2 w-72 bg-surface-deep border border-surface-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-surface-border/60">
                        <h4 className="text-sm font-semibold text-text-primary">
                          {listEntry ? "Update Tracking" : "Track on AniList"}
                        </h4>
                      </div>
                      <div className="p-4 space-y-4">
                        {/* Status */}
                        <div>
                          <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Status</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {ANILIST_MEDIA_STATUS.map((s) => (
                              <button
                                key={s.value}
                                onClick={() => setSelectedStatus(s.value)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                  selectedStatus === s.value
                                    ? `${s.color} text-white border-transparent`
                                    : "border-surface-border text-text-secondary hover:border-text-muted hover:text-text-primary"
                                }`}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Score */}
                        <div>
                          <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                            Score: {selectedScore > 0 ? `${selectedScore}/10` : "—"}
                          </label>
                          <div className="flex gap-1 flex-wrap">
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                              <button
                                key={score}
                                onClick={() => setSelectedScore(score)}
                                className={`w-7 h-7 text-[10px] font-bold rounded transition-all ${
                                  selectedScore === score
                                    ? score >= 7
                                      ? "bg-green-500 text-white"
                                      : score >= 4
                                      ? "bg-yellow-500 text-black"
                                      : score > 0
                                      ? "bg-red-500 text-white"
                                      : "bg-surface-base text-text-muted border border-surface-border"
                                    : "bg-surface-base text-text-secondary border border-surface-border hover:border-text-muted"
                                }`}
                              >
                                {score || "—"}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Progress */}
                        <div>
                          <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                            Episodes Watched: {selectedProgress}{anime.episodes ? ` / ${anime.episodes}` : ""}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max={anime.episodes || 100}
                            value={selectedProgress}
                            onChange={(e) => setSelectedProgress(parseInt(e.target.value))}
                            className="w-full accent-netflix-red"
                          />
                          <div className="flex justify-between text-[10px] text-text-muted mt-0.5">
                            <span>0</span>
                            <span>{anime.episodes || "?"}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={handleSaveListEntry}
                            disabled={entryLoading || !selectedStatus}
                            className="flex-1 px-4 py-2 bg-netflix-red hover:bg-netflix-red-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                          >
                            {entryLoading ? "Saving..." : listEntry ? "Update" : "Save"}
                          </button>
                          {listEntry && (
                            <button
                              onClick={handleRemoveFromList}
                              disabled={entryLoading}
                              className="px-4 py-2 bg-surface-base border border-surface-border text-red-400 hover:text-red-300 text-sm font-medium rounded-lg transition-colors"
                            >
                              Remove
                            </button>
                          )}
                          <button
                            onClick={() => setShowTrackingPanel(false)}
                            className="px-4 py-2 bg-surface-base border border-surface-border text-text-secondary text-sm font-medium rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Studios */}
            {anime.studios && anime.studios.length > 0 && (
              <p className="text-xs text-text-muted">
                Studio: {anime.studios.map((s) => s.name || s).join(", ")}
              </p>
            )}

            {/* Trailer */}
            {anime.trailer && anime.trailer.id && (
              <button
                onClick={() => setShowTrailer(true)}
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-netflix-red transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Watch Trailer
              </button>
            )}
          </div>
        </div>


        {/* Characters */}
        {anime.characters && anime.characters.length > 0 && (
          <div className="mb-12">
            <CharacterList characters={anime.characters} />
          </div>
        )}

        {/* Related & Recommendations */}
        <RelatedAnime relations={relations} recommendations={recommendations} />
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        trailer={anime?.trailer}
      />
    </div>
  );
}
