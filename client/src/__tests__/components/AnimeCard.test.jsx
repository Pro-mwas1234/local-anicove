import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AnimeCard from "../../components/anime/AnimeCard";

const mockAnime = {
	id: 12345,
	title: { english: "Test Anime", romaji: "Tesuto Anime" },
	coverImage: { large: "https://example.com/cover.jpg" },
	format: "TV",
	episodes: 24,
	averageScore: 85,
	status: "RELEASING",
	genres: ["Action", "Fantasy", "Adventure"],
};

function renderWithRouter(ui) {
	return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("AnimeCard", () => {
	it("renders the anime title", () => {
		renderWithRouter(<AnimeCard anime={mockAnime} />);
		expect(screen.getByText("Test Anime")).toBeInTheDocument();
	});

	it("renders the cover image", () => {
		renderWithRouter(<AnimeCard anime={mockAnime} />);
		const img = screen.getByAltText("Test Anime");
		expect(img).toBeInTheDocument();
		expect(img.src).toContain("example.com/cover.jpg");
	});

	it("renders the score badge", () => {
		renderWithRouter(<AnimeCard anime={mockAnime} />);
		expect(screen.getByText("8.5")).toBeInTheDocument();
	});

	it("renders genre tags", () => {
		renderWithRouter(<AnimeCard anime={mockAnime} />);
		expect(screen.getByText("Action · Fantasy · Adventure")).toBeInTheDocument();
	});

	it("links to the anime detail page", () => {
		renderWithRouter(<AnimeCard anime={mockAnime} />);
		const link = screen.getByRole("link");
		expect(link.getAttribute("href")).toBe("/anime/12345");
	});

	it("falls back to romaji title when english is missing", () => {
		const animeNoEnglish = { ...mockAnime, title: { romaji: "Tesuto Anime" } };
		renderWithRouter(<AnimeCard anime={animeNoEnglish} />);
		expect(screen.getByText("Tesuto Anime")).toBeInTheDocument();
	});
});
