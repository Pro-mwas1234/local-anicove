import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";

// Mock the AuthContext
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: false,
    loading: false,
  }),
}));

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("Navbar", () => {
  it("renders the logo", () => {
    renderWithRouter(<Navbar />);
    expect(screen.getByText("ANI")).toBeInTheDocument();
    expect(screen.getByText("COVE")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    renderWithRouter(<Navbar />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Browse")).toBeInTheDocument();
    expect(screen.getByText("Schedule")).toBeInTheDocument();
    expect(screen.getByText("My List")).toBeInTheDocument();
  });

  it("renders the mobile menu toggle", () => {
    renderWithRouter(<Navbar />);
    expect(screen.getByLabelText("Toggle menu")).toBeInTheDocument();
  });
});
