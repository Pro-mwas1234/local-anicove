import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { saveAnimeListEntry, deleteAnimeListEntry } from "../services/api";

const STORAGE_KEY = "anicove_mylist";

/**
 * Hook to manage a user's personal watchlist.
 * Syncs with AniList when user is authenticated, otherwise uses localStorage.
 */
export function useMyList() {
  const { isAuthenticated } = useAuth();
  const [myList, setMyList] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(myList));
  }, [myList]);

  const addToList = useCallback(
    (anime) => {
      setMyList((prev) => {
        if (prev.some((item) => item.id === anime.id)) return prev;
        return [
          ...prev,
          {
            id: anime.id,
            title: anime.title,
            coverImage: anime.coverImage,
            format: anime.format,
            status: anime.status,
            episodes: anime.episodes,
            averageScore: anime.averageScore,
            genres: anime.genres,
          },
        ];
      });

      // Sync with AniList if authenticated
      if (isAuthenticated && anime.id) {
        saveAnimeListEntry({
          mediaId: anime.id,
          status: "PLANNING",
        }).catch((err) => console.error("Failed to sync with AniList:", err));
      }
    },
    [isAuthenticated]
  );

  const removeFromList = useCallback(
    (animeId) => {
      setMyList((prev) => prev.filter((item) => item.id !== animeId));

      // Sync with AniList if authenticated
      if (isAuthenticated && animeId) {
        deleteAnimeListEntry(animeId).catch((err) =>
          console.error("Failed to remove from AniList:", err)
        );
      }
    },
    [isAuthenticated]
  );

  const isInList = useCallback(
    (animeId) => myList.some((item) => item.id === animeId),
    [myList]
  );

  const toggleList = useCallback(
    (anime) => {
      if (isInList(anime.id)) {
        removeFromList(anime.id);
      } else {
        addToList(anime);
      }
    },
    [isInList, removeFromList, addToList]
  );

  return { myList, addToList, removeFromList, isInList, toggleList };
}
