import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SearchBar from "../search/SearchBar";

export default function Navbar() {
	const [scrolled, setScrolled] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 50);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		setMobileOpen(false);
	}, [location.pathname]);

	const navLinks = [
		{ path: "/", label: "Home" },
		{ path: "/browse", label: "Browse" },
		{ path: "/schedule", label: "Schedule" },
		{ path: "/my-list", label: "My List" },
	];

	const isActive = (path) => location.pathname === path;

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

				{/* Right Section: Search + Hamburger */}
				<div className="flex items-center gap-4">
					{/* Search Bar (Desktop) */}
					<div className="hidden lg:block w-80">
						<SearchBar />
					</div>

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
					</div>
				</div>
			)}
		</nav>
	);
}
