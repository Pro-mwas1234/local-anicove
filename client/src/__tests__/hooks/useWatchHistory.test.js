import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWatchHistory } from "../../hooks/useWatchHistory";

beforeEach(() => {
  localStorage.clear();
});

describe("useWatchHistory", () => {
  it("starts with empty history", () => {
    const { result } = renderHook(() => useWatchHistory());
    expect(result.current.history).toEqual([]);
  });

  it("updates progress for an episode", () => {
    const { result } = renderHook(() => useWatchHistory());
    act(() => {
      result.current.updateProgress({
        animeId: 1,
        episodeId: "watch/kiwi/1/sub/ep-1",
        episodeNumber: 1,
        progress: 120,
        duration: 1400,
        animeTitle: "Test",
        coverImage: "test.jpg",
      });
    });
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].progress).toBe(120);
  });

  it("gets progress for a specific episode", () => {
    const { result } = renderHook(() => useWatchHistory());
    act(() => {
      result.current.updateProgress({
        animeId: 1,
        episodeId: "ep-1",
        episodeNumber: 1,
        progress: 500,
        duration: 1400,
        animeTitle: "Test",
        coverImage: "test.jpg",
      });
    });
    expect(result.current.getProgress("ep-1")).toBe(500);
    expect(result.current.getProgress("ep-2")).toBe(0);
  });

  it("returns continue watching items (5-90% progress)", () => {
    const { result } = renderHook(() => useWatchHistory());
    
    // Item at 50% progress (should be in continue watching)
    act(() => {
      result.current.updateProgress({
        animeId: 1,
        episodeId: "ep-1",
        episodeNumber: 1,
        progress: 700,
        duration: 1400,
        animeTitle: "Test",
        coverImage: "test.jpg",
      });
    });

    // Item at 95% progress (should NOT be in continue watching)
    act(() => {
      result.current.updateProgress({
        animeId: 2,
        episodeId: "ep-2",
        episodeNumber: 1,
        progress: 1330,
        duration: 1400,
        animeTitle: "Test 2",
        coverImage: "test2.jpg",
      });
    });

    const continueWatching = result.current.getContinueWatching();
    expect(continueWatching).toHaveLength(1);
    expect(continueWatching[0].episodeId).toBe("ep-1");
  });

  it("persists to localStorage", () => {
    const { result } = renderHook(() => useWatchHistory());
    act(() => {
      result.current.updateProgress({
        animeId: 1,
        episodeId: "ep-1",
        episodeNumber: 1,
        progress: 100,
        duration: 1400,
        animeTitle: "Test",
        coverImage: "test.jpg",
      });
    });

    const stored = JSON.parse(localStorage.getItem("locallink_watch_history"));
    expect(stored).toHaveLength(1);
  });
});
