import { describe, it, expect, vi, beforeEach } from "vitest";
import * as api from "../../services/api";

beforeEach(() => {
  vi.restoreAllMocks();
});

function expectFetchCalledWith(url) {
  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining(url),
    expect.objectContaining({
      credentials: "include",
      headers: expect.objectContaining({ "Content-Type": "application/json" }),
    })
  );
}

describe("API Service", () => {
  it("searchAnime calls /api/search with query", async () => {
    const mockData = { results: [{ id: 1 }] };
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await api.searchAnime("naruto");
    expectFetchCalledWith("/api/search?query=naruto&page=1");
    expect(result.results).toHaveLength(1);
  });

  it("getSuggestions calls /api/suggestions", async () => {
    const mockData = { results: [] };
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    await api.getSuggestions("test");
    expectFetchCalledWith("/api/suggestions?query=test");
  });

  it("getTrending calls /api/trending with pagination", async () => {
    const mockData = { results: [], page: 1 };
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    await api.getTrending(2, 10);
    expectFetchCalledWith("/api/trending?page=2&per_page=10");
  });

  it("getAnimeInfo calls /api/info/:id", async () => {
    const mockData = { id: 12345 };
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    await api.getAnimeInfo(12345);
    expectFetchCalledWith("/api/info/12345");
  });

  it("getEpisodes calls /api/episodes/:id", async () => {
    const mockData = { providers: {} };
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    await api.getEpisodes(12345);
    expectFetchCalledWith("/api/episodes/12345");
  });

  it("filterAnime constructs correct query string", async () => {
    const mockData = { results: [] };
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    await api.filterAnime({ genre: "Action", sort: "SCORE_DESC" });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/filter?genre=Action&sort=SCORE_DESC"),
      expect.any(Object)
    );
  });

  it("throws on non-ok response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: () => Promise.resolve("Not Found"),
    });

    await expect(api.searchAnime("test")).rejects.toThrow("API error 404");
  });
});
