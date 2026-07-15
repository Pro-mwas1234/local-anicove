import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "anicove_mylist";

/**
 * Hook to manage a user's personal watchlist in localStorage.
 * Stores an array of anime objects { id, title, coverImage, format, status, episodes }.
 */
export function useMyList() {
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

  const addToList = useCallback((anime) => {
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
  }, []);

  const removeFromList = useCallback((animeId) => {
    setMyList((prev) => prev.filter((item) => item.id !== animeId));
  }, []);

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
