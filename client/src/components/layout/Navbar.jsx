import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SearchBar from "../search/SearchBar";
import { useAuth } from "../../contexts/AuthContext";
import { getNotifications } from "../../services/api";	export default function Navbar() {
	const [scrolled, setScrolled] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const [notifOpen, setNotifOpen] = useState(false);
	const [notifications, setNotifications] = useState([]);
	const [notifLoading, setNotifLoading] = useState(false);
	const [notifError, setNotifError] = useState(null);
	const location = useLocation();
	const navigate = useNavigate();
	const { user, login, logout, isAuthenticated, loading, unreadNotificationCount, refreshUser } = useAuth();
	const userMenuRef = useRef(null);
	const notifRef = useRef(null);

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

	// Close notification panel on outside click
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (notifRef.current && !notifRef.current.contains(e.target)) {
				setNotifOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Fetch notifications when panel opens
	useEffect(() => {
		if (!notifOpen || !isAuthenticated) return;

		let cancelled = false;
		setNotifLoading(true);
		setNotifError(null);

		getNotifications({ page: 1, perPage: 15, reset: true })
			.then((data) => {
				if (!cancelled) {
					setNotifications(data.notifications || []);
					// Refresh the user to get updated unread count
					refreshUser();
				}
			})
			.catch((err) => {
				if (!cancelled) {
					console.error("Failed to load notifications:", err);
					setNotifError(err.message);
				}
			})
			.finally(() => {
				if (!cancelled) setNotifLoading(false);
			});

		return () => { cancelled = true; };
	}, [notifOpen, isAuthenticated, refreshUser]);

	// Poll for unread notification count every 60 seconds
	useEffect(() => {
		if (!isAuthenticated) return;
		const interval = setInterval(() => refreshUser(), 60000);
		return () => clearInterval(interval);
	}, [isAuthenticated, refreshUser]);

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

	const handleNotifToggle = () => {
		setNotifOpen((prev) => !prev);
		if (userMenuOpen) setUserMenuOpen(false);
	};

	const formatRelativeTime = (unixTimestamp) => {
		const now = Date.now();
		const diff = now - unixTimestamp * 1000;
		const minutes = Math.floor(diff / 60000);
		if (minutes < 1) return "Just now";
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		if (days < 7) return `${days}d ago`;
		const weeks = Math.floor(days / 7);
		if (weeks < 4) return `${weeks}w ago`;
		const months = Math.floor(days / 30);
		return `${months}mo ago`;
	};

	const getNotifIcon = (type) => {
		switch (type) {
			case "AIRING":
				return (
					<svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				);
			case "FOLLOWING":
				return (
					<svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
					</svg>
				);
			case "ACTIVITY_LIKE":
			case "ACTIVITY_REPLY_LIKE":
			case "THREAD_LIKE":
			case "THREAD_COMMENT_LIKE":
				return (
					<svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
					</svg>
				);
			case "ACTIVITY_MESSAGE":
			case "ACTIVITY_MENTION":
			case "ACTIVITY_REPLY":
			case "ACTIVITY_REPLY_SUBSCRIBED":
			case "THREAD_COMMENT_MENTION":
			case "THREAD_COMMENT_REPLY":
			case "THREAD_COMMENT_SUBSCRIBED":
				return (
					<svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
					</svg>
				);
			case "MEDIA_DATA_CHANGE":
			case "MEDIA_MERGE":
			case "MEDIA_DELETION":
				return (
					<svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				);
			default:
				return (
					<svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
					</svg>
				);
		}
	};

	const getNotifMessage = (n) => {
		switch (n.type) {
			case "AIRING":
				return `Episode ${n.episode} of ${n.media?.title?.romaji || n.media?.title?.english || "Unknown"} is now airing`;
			case "FOLLOWING":
				return `${n.user?.name || "Someone"} started following you`;
			case "ACTIVITY_LIKE":
				return `${n.user?.name || "Someone"} liked your activity`;
			case "ACTIVITY_REPLY_LIKE":
				return `${n.user?.name || "Someone"} liked your reply`;
			case "ACTIVITY_MESSAGE":
				return `${n.user?.name || "Someone"} sent you a message`;
			case "ACTIVITY_MENTION":
				return `${n.user?.name || "Someone"} mentioned you`;
			case "ACTIVITY_REPLY":
			case "ACTIVITY_REPLY_SUBSCRIBED":
				return `${n.user?.name || "Someone"} replied to your activity`;
			case "THREAD_LIKE":
				return `${n.user?.name || "Someone"} liked your thread${n.thread?.title ? ` "${n.thread.title}"` : ""}`;
			case "THREAD_COMMENT_LIKE":
				return `${n.user?.name || "Someone"} liked your comment${n.thread?.title ? ` in "${n.thread.title}"` : ""}`;
			case "THREAD_COMMENT_MENTION":
				return `${n.user?.name || "Someone"} mentioned you in a comment${n.thread?.title ? ` in "${n.thread.title}"` : ""}`;
			case "THREAD_COMMENT_REPLY":
			case "THREAD_COMMENT_SUBSCRIBED":
				return `${n.user?.name || "Someone"} replied to a thread${n.thread?.title ? ` "${n.thread.title}"` : ""}`;
			case "MEDIA_DATA_CHANGE":
				return `Media data updated: ${n.media?.title?.romaji || n.media?.title?.english || "Unknown"}`;
			case "MEDIA_MERGE":
				return `Media merged: ${n.media?.title?.romaji || n.media?.title?.english || "Unknown"}`;
			case "MEDIA_DELETION":
				return `Media deleted: ${n.deletedMediaTitle || "Unknown"}`;
			default:
				return `New notification (${n.type})`;
		}
	};

	const getNotifLink = (n) => {
		switch (n.type) {
			case "AIRING":
				return n.media?.id ? `/info/${n.media.id}` : null;
			case "FOLLOWING":
				return n.user?.name ? `https://anilist.co/user/${n.user.name}` : null;
			case "ACTIVITY_LIKE":
			case "ACTIVITY_REPLY_LIKE":
			case "ACTIVITY_MESSAGE":
			case "ACTIVITY_MENTION":
			case "ACTIVITY_REPLY":
			case "ACTIVITY_REPLY_SUBSCRIBED":
				return n.activityId ? `https://anilist.co/activity/${n.activityId}` : null;
			case "THREAD_LIKE":
			case "THREAD_COMMENT_LIKE":
			case "THREAD_COMMENT_MENTION":
			case "THREAD_COMMENT_REPLY":
			case "THREAD_COMMENT_SUBSCRIBED":
				return n.threadId ? `https://anilist.co/forum/thread/${n.threadId}` : null;
			case "MEDIA_DATA_CHANGE":
			case "MEDIA_MERGE":
				return n.media?.id ? `/info/${n.media.id}` : null;
			case "MEDIA_DELETION":
				return null;
			default:
				return null;
		}
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
								<>
									{/* Notification Bell */}
									<div className="relative" ref={notifRef}>
										<button
											onClick={handleNotifToggle}
											className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-text-muted hover:text-text-primary"
											aria-label={`Notifications${unreadNotificationCount > 0 ? ` (${unreadNotificationCount} unread)` : ""}`}
										>
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
											</svg>
											{unreadNotificationCount > 0 && (
												<span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-netflix-red rounded-full shadow-lg shadow-netflix-red/40 animate-dropdown-open">
													{unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
												</span>
											)}
										</button>

										{/* Notification Dropdown */}
										{notifOpen && (
											<div className="absolute right-0 mt-2 w-[380px] max-w-[90vw] max-h-[70vh] bg-surface-deep border border-surface-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-dropdown-open">
												{/* Header */}
												<div className="flex items-center justify-between px-4 py-3 border-b border-surface-border/60">
													<h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
													<a
														href="https://anilist.co/notifications"
														target="_blank"
														rel="noopener noreferrer"
														className="text-xs text-netflix-red hover:text-netflix-red-hover transition-colors"
													>
														View all
													</a>
												</div>

												{/* Content */}
												<div className="overflow-y-auto max-h-[calc(70vh-53px)]">
													{notifLoading ? (
														<div className="flex flex-col gap-3 p-4">
															{[...Array(5)].map((_, i) => (
																<div key={i} className="flex items-start gap-3">
																	<div className="w-8 h-8 rounded-full skeleton shrink-0" />
																	<div className="flex-1 space-y-2">
																		<div className="h-3 skeleton rounded w-3/4" />
																		<div className="h-2 skeleton rounded w-1/4" />
																	</div>
																</div>
															))}
														</div>
													) : notifError ? (
														<div className="flex flex-col items-center justify-center py-12 px-4 text-center">
															<svg className="w-10 h-10 text-red-400/60 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
															</svg>
															<p className="text-sm text-text-muted">Failed to load notifications</p>
														</div>
													) : notifications.length === 0 ? (
														<div className="flex flex-col items-center justify-center py-12 px-4 text-center">
															<svg className="w-10 h-10 text-text-muted/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
															</svg>
															<p className="text-sm text-text-muted">No notifications yet</p>
															<p className="text-xs text-text-muted/60 mt-1">Activity and updates will appear here</p>
														</div>
													) : (
														<div>
															{notifications.map((n) => {
																const link = getNotifLink(n);
																const itemContent = (
																	<div
																		key={n.id}
																		className="flex items-start gap-3 px-4 py-3 hover:bg-surface-base transition-colors cursor-pointer border-b border-surface-border/30 last:border-b-0"
																	>
																		<div className="shrink-0 mt-0.5">
																			{n.user?.avatar?.medium ? (
																				<img
																					src={n.user.avatar.medium}
																					alt={n.user.name || ""}
																					className="w-8 h-8 rounded-full object-cover"
																				/>
																			) : n.media?.coverImage?.large ? (
																				<img
																					src={n.media.coverImage.large}
																					alt=""
																					className="w-8 h-8 rounded object-cover"
																				/>
																			) : (
																				<div className="w-8 h-8 rounded-full bg-surface-raised flex items-center justify-center">
																					{getNotifIcon(n.type)}
																				</div>
																			)}
																		</div>
																		<div className="flex-1 min-w-0">
																			<p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
																				{getNotifMessage(n)}
																			</p>
																			<p className="text-[10px] text-text-muted/60 mt-1">
																				{formatRelativeTime(n.createdAt)}
																			</p>
																		</div>
																	</div>
																);

																if (link && (link.startsWith("http://") || link.startsWith("https://"))) {
																	return (
																		<a key={n.id} href={link} target="_blank" rel="noopener noreferrer">
																			{itemContent}
																		</a>
																	);
																}
																if (link) {
																	return (
																		<Link key={n.id} to={link} onClick={() => setNotifOpen(false)}>
																			{itemContent}
																		</Link>
																	);
																}
																return itemContent;
															})}
														</div>
													)}
												</div>
											</div>
										)}
									</div>

									{/* User Avatar + Menu */}
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
								</>
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
