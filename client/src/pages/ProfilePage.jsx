import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";
import { getUserStats } from "../services/api";

export default function ProfilePage() {
  const { user, login, isAuthenticated, loading: authLoading } = useAuth();
  const { includeAdult, toggleAdultContent } = useSettings();
  const [userStats, setUserStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    setStatsLoading(true);
    setStatsError(null);

    getUserStats()
      .then((data) => {
        setUserStats(data?.user || null);
      })
      .catch((err) => {
        console.error("Failed to load stats:", err);
        setStatsError(err.message);
      })
      .finally(() => setStatsLoading(false));
  }, [isAuthenticated]);

  return (
    <div id="profile-page" className="pt-24 px-5 lg:px-24 pb-16 min-h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-black text-text-primary mb-2">
          Profile & Settings
        </h1>
        <p className="text-text-muted text-sm">Manage your account preferences</p>
      </div>

      {/* Not logged in */}
      {!authLoading && !isAuthenticated && (
        <div className="text-center py-20 space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-surface-base border-2 border-dashed border-surface-border flex items-center justify-center">
            <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-text-muted text-lg mb-2">Sign in to access your profile</p>
            <p className="text-text-muted text-sm">Connect your AniList account to sync your lists and customize settings.</p>
          </div>
          <button
            onClick={login}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-netflix-red hover:bg-netflix-red-hover text-white transition-colors shadow-lg shadow-netflix-red/20"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.625 21.75a.75.75 0 00.75-.75V3.375a1.5 1.5 0 00-3 0V21a.75.75 0 00.75.75zm5.625 0a.75.75 0 00.75-.75V3.375a1.5 1.5 0 00-3 0V21a.75.75 0 00.75.75zm5.625.75a.75.75 0 00.75-.75V3.375a1.5 1.5 0 00-3 0V21a.75.75 0 00.75.75z" />
            </svg>
            Sign in with AniList
          </button>
        </div>
      )}

      {/* Authenticated content */}
      {isAuthenticated && user && (
        <div className="space-y-8">
          {/* User Info Card */}
          <div className="bg-surface-base/80 border border-surface-border rounded-2xl overflow-hidden shadow-xl shadow-black/20">
            {/* Banner */}
            <div className="h-32 lg:h-40 bg-gradient-to-r from-netflix-red/20 via-purple-500/20 to-blue-500/20 relative">
              {user.bannerImage && (
                <img
                  src={user.bannerImage}
                  alt=""
                  className="w-full h-full object-cover opacity-50"
                />
              )}
            </div>

            {/* Avatar & Name */}
            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
                <div className="shrink-0">
                  <img
                    src={user.avatar?.large || user.avatar?.medium || "/favicon.svg"}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-surface-base shadow-xl"
                  />
                </div>
                <div className="text-center sm:text-left flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-text-primary">{user.name}</h2>
                  <p className="text-sm text-text-muted">AniList Account</p>
                </div>
                <a
                  href={`https://anilist.co/user/${user.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-surface-raised border border-surface-border text-text-secondary hover:text-text-primary hover:border-text-muted transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.625 21.75a.75.75 0 00.75-.75V3.375a1.5 1.5 0 00-3 0V21a.75.75 0 00.75.75zm5.625 0a.75.75 0 00.75-.75V3.375a1.5 1.5 0 00-3 0V21a.75.75 0 00.75.75zm5.625.75a.75.75 0 00.75-.75V3.375a1.5 1.5 0 00-3 0V21a.75.75 0 00.75.75z" />
                  </svg>
                  View on AniList
                </a>
              </div>

              {/* Bio */}
              {user.about && (
                <div className="mt-4 text-sm text-text-secondary leading-relaxed max-w-2xl mx-auto sm:mx-0 text-center sm:text-left" dangerouslySetInnerHTML={{ __html: user.about }} />
              )}
            </div>
          </div>

          {/* Stats */}
          {statsLoading ? (
            <div className="bg-surface-base/80 border border-surface-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-5 h-5 border-2 border-netflix-red border-t-transparent rounded-full animate-spin" />
                <p className="text-text-muted text-sm">Loading stats...</p>
              </div>
            </div>
          ) : statsError ? (
            <div className="bg-surface-base/80 border border-surface-border rounded-2xl p-6">
              <p className="text-red-400 text-sm">Failed to load stats: {statsError}</p>
            </div>
          ) : userStats?.statistics?.anime ? (
            <div className="bg-surface-base/80 border border-surface-border rounded-2xl p-6 shadow-xl shadow-black/20">
              <h3 className="text-lg font-bold text-text-primary mb-4">Anime Statistics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-surface-raised/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-netflix-red">{userStats.statistics.anime.count}</p>
                  <p className="text-xs text-text-muted mt-1">Total Anime</p>
                </div>
                <div className="bg-surface-raised/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-netflix-red">{userStats.statistics.anime.episodesWatched}</p>
                  <p className="text-xs text-text-muted mt-1">Episodes Watched</p>
                </div>
                <div className="bg-surface-raised/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-netflix-red">
                    {Math.floor(userStats.statistics.anime.minutesWatched / 60)}h
                  </p>
                  <p className="text-xs text-text-muted mt-1">Hours Watched</p>
                </div>
                <div className="bg-surface-raised/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-netflix-red">
                    {userStats.statistics.anime.meanScore
                      ? (userStats.statistics.anime.meanScore / 10).toFixed(1)
                      : "—"}
                  </p>
                  <p className="text-xs text-text-muted mt-1">Mean Score</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Settings */}
          <div className="bg-surface-base/80 border border-surface-border rounded-2xl p-6 shadow-xl shadow-black/20">
            <h3 className="text-lg font-bold text-text-primary mb-4">Preferences</h3>

            {/* Adult Content Toggle */}
            <div className="flex items-center justify-between py-4 px-4 bg-surface-raised/30 rounded-xl border border-surface-border/50">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <svg className="w-5 h-5 text-red-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">Show Adult Content</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    When enabled, 18+ and mature-rated anime will appear in search results, browse, and home page collections.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
                <input
                  type="checkbox"
                  checked={includeAdult}
                  onChange={toggleAdultContent}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-raised rounded-full peer peer-checked:bg-red-500/40 peer-checked:border-red-500/50 border border-surface-border transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-text-muted after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:bg-red-400" />
              </label>
            </div>

            <p className="text-xs text-text-muted mt-3 ml-1">
              This setting is saved locally and will apply across all pages.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
