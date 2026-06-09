import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/ui/ScrollToTop";
import HomePage from "./pages/HomePage";
import BrowsePage from "./pages/BrowsePage";
import SearchResultsPage from "./pages/SearchResultsPage";
import AnimeDetailPage from "./pages/AnimeDetailPage";
import WatchPage from "./pages/WatchPage";
import SchedulePage from "./pages/SchedulePage";
import MyListPage from "./pages/MyListPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
	return (
		<div className="min-h-screen bg-surface-deep text-text-primary">
			<ScrollToTop />
			<Navbar />
			<main>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/browse" element={<BrowsePage />} />
					<Route path="/search" element={<SearchResultsPage />} />
					<Route path="/anime/:id" element={<AnimeDetailPage />} />
					<Route path="/watch/*" element={<WatchPage />} />
					<Route path="/schedule" element={<SchedulePage />} />
					<Route path="/my-list" element={<MyListPage />} />
					<Route path="*" element={<NotFoundPage />} />
					<Route path="/test" element={<h1 className="text-red-600">test</h1>} />
				</Routes>
			</main>
			<Footer />
		</div>
	);
}
