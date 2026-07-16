import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
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
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
	const location = useLocation();
	const [displayLocation, setDisplayLocation] = useState(location);
	const [transitionStage, setTransitionStage] = useState("animate-page-enter");
	const prevPathRef = useRef(location.pathname);

	useEffect(() => {
		if (location.pathname !== prevPathRef.current) {
			prevPathRef.current = location.pathname;
			setTransitionStage("opacity-0");
			const timeout = setTimeout(() => {
				setDisplayLocation(location);
				setTransitionStage("animate-page-enter");
			}, 150);
			return () => clearTimeout(timeout);
		} else {
			setDisplayLocation(location);
		}
	}, [location]);

	return (
		<div className="min-h-screen bg-surface-deep text-text-primary">
			<ScrollToTop />
			<Navbar />
			<main className={transitionStage}>
				<Routes location={displayLocation}>
					<Route path="/" element={<HomePage />} />
					<Route path="/browse" element={<BrowsePage />} />
					<Route path="/search" element={<SearchResultsPage />} />
					<Route path="/anime/:id" element={<AnimeDetailPage />} />
					<Route path="/watch/*" element={<WatchPage />} />
					<Route path="/schedule" element={<SchedulePage />} />
					<Route path="/my-list" element={<MyListPage />} />
					<Route path="/profile" element={<ProfilePage />} />
					<Route path="*" element={<NotFoundPage />} />
					<Route path="/test" element={<h1 className="text-red-600">test</h1>} />
				</Routes>
			</main>
			<Footer />
		</div>
	);
}
