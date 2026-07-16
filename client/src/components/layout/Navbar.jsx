import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SearchBar from "../search/SearchBar";
import { useAuth } from "../../contexts/AuthContext";	export default function Navbar() {
	const [scrolled, setScrolled] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();
	const { user, login, logout, isAuthenticated, loading } = useAuth();
	const userMenuRef = useRef(null);

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 50);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		setMobileOpen(false);
	}, [location.pathname]);

	// Close user menu on outside click
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
				setUserMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Keyboard shortcut: / or Ctrl+K to focus search
	useEffect(() => {
		const handleKeyDown = (e) => {
			// Don't trigger if already typing in an input
			const tag = document.activeElement?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

			// Ctrl/Cmd + K or / to focus search
			if ((e.ctrlKey || e.metaKey) && e.key === "k") {
				e.preventDefault();
				const searchInput = document.getElementById("search-input");
				if (searchInput) {
					searchInput.focus();
					searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
				}
			} else if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
				e.preventDefault();
				const searchInput = document.getElementById("search-input");
				if (searchInput) {
					searchInput.focus();
				}
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	const navLinks = [
		{ path: "/", label: "Home" },
		{ path: "/browse", label: "Browse" },
		{ path: "/schedule", label: "Schedule" },
		{ path: "/my-list", label: "My List" },
	];

	const isActive = (path) => location.pathname === path;

	const handleLogin = () => {
		login();
	};

	const handleLogout = async () => {
		setUserMenuOpen(false);
		await logout();
		navigate("/");
	};

	return (
		<nav
			id="main-navbar"
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || mobileOpen
				? "bg-surface-deep/95 backdrop-blur-md shadow-lg shadow-black/20"
				: "bg-linear-to-b from-black/60 to-transparent"
				}`}
		>
			<div className="flex items-center justify-between h-16 px-5 lg:px-24">
				{/* Left Section: Logo + Links */}
				<div className="flex items-center gap-8">
					{/* Logo */}
					<Link
						to="/"
						className="flex items-center gap-2.5 shrink-0 group"
						id="navbar-logo"
					>
						<img src="/favicon.svg" alt="Anicove Logo" className="h-9 w-9 rounded object-contain shadow-md group-hover:scale-105 transition-transform" />
						<span className="text-xl font-black tracking-tight text-white hidden sm:inline">
							ANI<span className="text-netflix-red font-light">COVE</span>
						</span>
					</Link>

					{/* Desktop Nav Links */}
					<div className="hidden lg:flex items-center gap-1">
						{navLinks.map((link) => (
							<Link
								key={link.path}
								to={link.path}
								className={`px-4 py-2 text-sm font-medium rounded transition-colors ${isActive(link.path)
									? "text-text-primary"
									: "text-text-secondary hover:text-text-primary"
									}`}
							>
								{link.label}
								{isActive(link.path) && (
									<div className="h-0.5 bg-netflix-red mt-0.5 rounded-full" />
								)}
							</Link>
						))}
					</div>
				</div>

				{/* Right Section: Search + Auth + Hamburger */}
				<div className="flex items-center gap-3">
					{/* Search Bar (Desktop) */}
					<div className="hidden lg:block w-72">
						<SearchBar />
					</div>

					{/* AniList Auth */}
					{!loading && (
						<>
							{isAuthenticated && user ? (
								<div className="relative" ref={userMenuRef}>
									<div className="flex items-center gap-1">
										<Link
											to="/profile"
											className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/10 transition-colors group/avatar"
										>
											<img
												src={user.avatar?.medium || user.avatar?.large || "/favicon.svg"}
												alt={user.name}
												className="w-8 h-8 rounded-full object-cover border-2 border-white/20 ring-2 ring-transparent group-hover/avatar:ring-netflix-red/50 transition-all"
											/>
											<span className="hidden lg:block text-sm font-medium text-text-primary max-w-[100px] truncate group-hover/avatar:text-netflix-red transition-colors">
												{user.name}
											</span>
										</Link>
										<button
											onClick={() => setUserMenuOpen(!userMenuOpen)}
											className="p-1 rounded-full hover:bg-white/10 transition-colors text-text-muted hover:text-text-primary"
											aria-label="Open user menu"
										>
											<svg className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
											</svg>
										</button>
									</div>

									{/* Dropdown Menu */}
									{userMenuOpen && (
										<div className="absolute right-0 mt-2 w-56 bg-surface-deep border border-surface-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50">
											{/* User info header */}
											<div className="px-4 py-3 border-b border-surface-border/60">
												<p className="text-sm font-semibold text-text-primary truncate">
													{user.name}
												</p>
												<p className="text-xs text-text-muted mt-0.5">
													AniList Account
												</p>
											</div>

											{/* Menu items */}
											<div className="py-1">
												<Link
													to="/profile"
													onClick={() => setUserMenuOpen(false)}
													className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-base transition-colors"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
													</svg>
													Profile & Settings
												</Link>
												<Link
													to="/my-list"
													onClick={() => setUserMenuOpen(false)}
													className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-base transition-colors"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
													</svg>
													My Anime List
												</Link>
												<a
													href={`https://anilist.co/user/${user.name}`}
													target="_blank"
													rel="noopener noreferrer"
													onClick={() => setUserMenuOpen(false)}
													className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-base transition-colors"
												>
													<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
														<path d="M6.625 21.75a.75.75 0 00.75-.75V3.375a1.5 1.5 0 00-3 0V21a.75.75 0 00.75.75zm5.625 0a.75.75 0 00.75-.75V3.375a1.5 1.5 0 00-3 0V21a.75.75 0 00.75.75zm5.625.75a.75.75 0 00.75-.75V3.375a1.5 1.5 0 00-3 0V21a.75.75 0 00.75.75z" />
													</svg>
													AniList Profile
												</a>
											</div>

											{/* Logout */}
											<div className="border-t border-surface-border/60 py-1">
												<button
													onClick={handleLogout}
													className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-surface-base transition-colors"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
													</svg>
													Sign Out
												</button>
											</div>
										</div>
									)}
								</div>
							) : (
								<button
									onClick={handleLogin}
									className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-netflix-red hover:bg-netflix-red-hover text-white transition-colors shadow-lg shadow-netflix-red/20"
								>
									<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
										<path d="M6.625 21.75a.75.75 0 00.75-.75V3.375a1.5 1.5 0 00-3 0V21a.75.75 0 00.75.75zm5.625 0a.75.75 0 00.75-.75V3.375a1.5 1.5 0 00-3 0V21a.75.75 0 00.75.75zm5.625.75a.75.75 0 00.75-.75V3.375a1.5 1.5 0 00-3 0V21a.75.75 0 00.75.75z" />
									</svg>
									Sign in with AniList
								</button>
							)}
						</>
					)}

					{/* Mobile hamburger */}
					<button
						onClick={() => setMobileOpen(!mobileOpen)}
						className="lg:hidden text-text-primary p-2"
						aria-label="Toggle menu"
						id="mobile-menu-toggle"
					>
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							{mobileOpen ? (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							) : (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							)}
						</svg>
					</button>
				</div>
			</div>

			{/* Mobile menu */}
			{mobileOpen && (
				<div className="lg:hidden bg-surface-deep/98 backdrop-blur-md border-t border-surface-border px-5 pb-5">
					<div className="py-4">
						<SearchBar />
					</div>
					<div className="flex flex-col gap-1">
						{navLinks.map((link) => (
							<Link
								key={link.path}
								to={link.path}
								className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive(link.path)
									? "text-text-primary bg-surface-base"
									: "text-text-secondary hover:text-text-primary hover:bg-surface-base"
									}`}
							>
								{link.label}
							</Link>
						))}
						{/* Mobile user area */}
						{!loading && isAuthenticated && user && (
							<>
								<div className="flex items-center gap-3 px-4 py-3 mt-2 border-t border-surface-border/60 pt-4">
									<img
										src={user.avatar?.medium || user.avatar?.large || "/favicon.svg"}
										alt={user.name}
										className="w-8 h-8 rounded-full object-cover border border-white/20"
									/>
									<span className="text-sm font-medium text-text-primary">{user.name}</span>
								</div>
								<button
									onClick={() => { handleLogout(); setMobileOpen(false); }}
									className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-surface-base rounded-lg transition-colors"
								>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
									</svg>
									Sign Out
								</button>
							</>
						)}
					</div>
				</div>
			)}
		</nav>
	);
}
