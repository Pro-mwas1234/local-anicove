import { useState, useEffect } from "react";
import AnimeGrid from "../components/anime/AnimeGrid";
import { useMyList } from "../hooks/useMyList";
import { useAuth } from "../contexts/AuthContext";
import { getAnimeList } from "../services/api";
import { ANILIST_LIST_STATUS_MAP } from "../utils/constants";

export default function MyListPage() {
  const { myList } = useMyList();
  const { isAuthenticated, user } = useAuth();
  const [anilistLists, setAnilistLists] = useState([]);
  const [anilistLoading, setAnilistLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("local");
  const [anilistError, setAnilistError] = useState(null);

  // Load AniList data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    setAnilistLoading(true);
    setAnilistError(null);

    getAnimeList({ perPage: 100 })
      .then((data) => {
        const lists = data?.lists || [];
        setAnilistLists(lists);
      })
      .catch((err) => {
        console.error("Failed to load AniList:", err);
        setAnilistError(err.message);
      })
      .finally(() => setAnilistLoading(false));
  }, [isAuthenticated]);

  const tabs = [
    { id: "local", label: "My List", count: myList.length },
  ];

  // Add AniList tabs if authenticated
  if (isAuthenticated) {
    tabs.push({ id: "anilist", label: "AniList", count: anilistLists.reduce((sum, l) => sum + (l.entries?.length || 0), 0) });
  }

  return (
    <div id="mylist-page" className="pt-24 px-5 lg:px-24 pb-16 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-text-primary mb-2">
            My List
          </h1>
          {isAuthenticated && user && (
            <p className="text-text-muted text-sm flex items-center gap-2">
              <img
                src={user.avatar?.medium || user.avatar?.large || "/favicon.svg"}
                alt={user.name}
                className="w-5 h-5 rounded-full"
              />
              Synced with <span className="font-semibold text-text-secondary">{user.name}</span>'s AniList
            </p>
          )}
        </div>

        {/* Tab Switcher */}
        {tabs.length > 1 && (
          <div className="flex bg-surface-base rounded-lg overflow-hidden border border-surface-border self-start">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-netflix-red text-white"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-surface-border text-text-muted"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Local List Tab */}
      {activeTab === "local" && (
        <>
          {myList.length > 0 ? (
            <>
              <p className="text-text-secondary mb-6">
                {myList.length} anime saved to your personal list
              </p>
              <AnimeGrid anime={myList} />
            </>
          ) : (
            <div className="text-center py-20 space-y-4">
              <svg className="w-16 h-16 text-text-muted mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-text-muted text-lg">
                Start adding anime to your list by clicking the "My List" button on any anime page.
              </p>
              {isAuthenticated && (
                <p className="text-text-muted text-sm">
                  Or switch to the "AniList" tab to see your synced list.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* AniList Tab */}
      {activeTab === "anilist" && (
        <>
          {anilistLoading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-2 border-netflix-red border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-text-muted">Loading your AniList...</p>
            </div>
          ) : anilistError ? (
            <div className="text-center py-20">
              <p className="text-red-400">Failed to load AniList: {anilistError}</p>
            </div>
          ) : anilistLists.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <svg className="w-16 h-16 text-text-muted mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-text-muted text-lg">
                Your AniList is empty.
              </p>
              <p className="text-text-muted text-sm">
                Start tracking anime from their detail pages!
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {anilistLists.map((list) => {
                const entries = list?.entries || [];
                if (entries.length === 0) return null;

                const animeItems = entries.map((entry) => ({
                  ...entry.media,
                  anilistEntry: entry,
                  anilistStatus: entry.status,
                  anilistProgress: entry.progress,
                  anilistScore: entry.score,
                }));

                const listName = ANILIST_LIST_STATUS_MAP[list.status] || list.name || "Custom List";

                return (
                  <div key={list.name + list.status}>
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-xl font-bold text-text-primary">{listName}</h2>
                      <span className="text-xs text-text-muted bg-surface-base px-2 py-0.5 rounded-full border border-surface-border">
                        {entries.length}
                      </span>
                    </div>
                    <AnimeGrid anime={animeItems} />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
