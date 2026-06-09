import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SearchBar from "../../components/search/SearchBar";

// Mock the API module
vi.mock("../../services/api", () => ({
  getSuggestions: vi.fn().mockResolvedValue({ results: [] }),
}));

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("SearchBar", () => {
  it("renders the search input", () => {
    renderWithRouter(<SearchBar />);
    const input = screen.getByPlaceholderText("Search anime...");
    expect(input).toBeInTheDocument();
  });

  it("accepts user input", () => {
    renderWithRouter(<SearchBar />);
    const input = screen.getByPlaceholderText("Search anime...");
    fireEvent.change(input, { target: { value: "Naruto" } });
    expect(input.value).toBe("Naruto");
  });

  it("has the correct id for testing", () => {
    renderWithRouter(<SearchBar />);
    expect(document.getElementById("search-input")).toBeInTheDocument();
  });
});
