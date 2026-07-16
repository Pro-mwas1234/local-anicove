import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMyList } from "../../hooks/useMyList";

// Mock the AuthContext
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: false }),
}));

const mockAnime = {
  id: 12345,
  title: { english: "Test Anime" },
  coverImage: { large: "test.jpg" },
  format: "TV",
  status: "RELEASING",
  episodes: 24,
  averageScore: 85,
  genres: ["Action"],
};

beforeEach(() => {
  localStorage.clear();
});

describe("useMyList", () => {
  it("starts with an empty list", () => {
    const { result } = renderHook(() => useMyList());
    expect(result.current.myList).toEqual([]);
  });

  it("adds anime to the list", () => {
    const { result } = renderHook(() => useMyList());
    act(() => result.current.addToList(mockAnime));
    expect(result.current.myList).toHaveLength(1);
    expect(result.current.myList[0].id).toBe(12345);
  });

  it("prevents duplicate additions", () => {
    const { result } = renderHook(() => useMyList());
    act(() => result.current.addToList(mockAnime));
    act(() => result.current.addToList(mockAnime));
    expect(result.current.myList).toHaveLength(1);
  });

  it("removes anime from the list", () => {
    const { result } = renderHook(() => useMyList());
    act(() => result.current.addToList(mockAnime));
    act(() => result.current.removeFromList(12345));
    expect(result.current.myList).toHaveLength(0);
  });

  it("checks if anime is in the list", () => {
    const { result } = renderHook(() => useMyList());
    expect(result.current.isInList(12345)).toBe(false);
    act(() => result.current.addToList(mockAnime));
    expect(result.current.isInList(12345)).toBe(true);
  });

  it("toggles anime in the list", () => {
    const { result } = renderHook(() => useMyList());
    act(() => result.current.toggleList(mockAnime));
    expect(result.current.myList).toHaveLength(1);
    act(() => result.current.toggleList(mockAnime));
    expect(result.current.myList).toHaveLength(0);
  });

  it("persists to localStorage", () => {
    const { result } = renderHook(() => useMyList());
    act(() => result.current.addToList(mockAnime));

    const stored = JSON.parse(localStorage.getItem("anicove_mylist"));
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(12345);
  });
});
