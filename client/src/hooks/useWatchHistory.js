import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "anicove_watch_history";
const MAX_HISTORY = 50;

/**
 * Hook to manage watch history and continue-watching progress in localStorage.
 * Stores: { animeId, episodeId, episodeNumber, progress (seconds), duration, timestamp, animeTitle, coverImage }
 */
export function useWatchHistory() {
  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const updateProgress = useCallback((entry) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.animeId !== entry.animeId);
      const updated = [
        {
          animeId: entry.animeId,
          episodeId: entry.episodeId,
          episodeNumber: entry.episodeNumber,
          progress: entry.progress,
          duration: entry.duration,
          timestamp: Date.now(),
          animeTitle: entry.animeTitle,
          coverImage: entry.coverImage,
        },
        ...filtered,
      ].slice(0, MAX_HISTORY);
      return updated;
    });
  }, []);

  const getProgress = useCallback(
    (episodeId) => {
      const entry = history.find((h) => h.episodeId === episodeId);
      return entry ? entry.progress : 0;
    },
    [history]
  );

  const getContinueWatching = useCallback(() => {
    // Return items where progress is between 5% and 90% of duration
    const valid = history.filter((h) => {
      if (!h.duration || h.duration === 0) return false;
      const pct = h.progress / h.duration;
      return pct > 0.05 && pct < 0.9;
    });
    const seen = new Set();
    return valid.filter((h) => {
      if (seen.has(h.animeId)) return false;
      seen.add(h.animeId);
      return true;
    });
  }, [history]);

  const removeFromHistory = useCallback((episodeId) => {
    setHistory((prev) => prev.filter((h) => h.episodeId !== episodeId));
  }, []);

  return { history, updateProgress, getProgress, getContinueWatching, removeFromHistory };
}
