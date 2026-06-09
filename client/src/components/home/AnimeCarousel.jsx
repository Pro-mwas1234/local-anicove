import { useRef, useState } from "react";
import AnimeCard from "../anime/AnimeCard";

export default function AnimeCarousel({ title, anime = [], loading = false }) {
	const scrollRef = useRef(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(true);

	const checkScroll = () => {
		const el = scrollRef.current;
		if (!el) return;
		setCanScrollLeft(el.scrollLeft > 10);
		setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
	};

	const scroll = (direction) => {
		const el = scrollRef.current;
		if (!el) return;
		const cardWidth = el.firstChild?.offsetWidth || 200;
		const scrollAmount = cardWidth * 3;
		el.scrollBy({
			left: direction === "left" ? -scrollAmount : scrollAmount,
			behavior: "smooth",
		});
	};

	if (loading) {
		return (
			<div className="space-y-4">
				<div className="skeleton h-7 w-48 rounded" />
				<div className="flex gap-4">
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className="shrink-0 w-40 lg:w-48">
							<div className="skeleton rounded-lg aspect-2/3" />
							<div className="mt-2 skeleton h-4 w-3/4 rounded" />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (!anime.length) return null;

	return (
		<div className="space-y-4 group/carousel">
			{/* Title */}
			<h2 className="text-xl lg:text-2xl font-bold text-text-primary px-1">
				{title}
			</h2>

			{/* Carousel wrapper */}
			<div className="relative">
				{/* Left scroll button */}
				{canScrollLeft && (
					<button
						onClick={() => scroll("left")}
						className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-linear-to-r from-surface-deep to-transparent flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
						aria-label="Scroll left"
					>
						<svg
							className="w-8 h-8 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>
				)}

				{/* Scrollable row */}
				<div
					ref={scrollRef}
					onScroll={checkScroll}
					className="flex gap-3 lg:gap-4 overflow-x-auto hide-scrollbar scroll-smooth pb-2"
				>
					{anime.map((item) => (
						<div
							key={item.id}
							className="shrink-0 w-40 sm:w-48 lg:w-60"
						>
							<AnimeCard anime={item} />
						</div>
					))}
				</div>

				{/* Right scroll button */}
				{canScrollRight && (
					<button
						onClick={() => scroll("right")}
						className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-linear-to-l from-surface-deep to-transparent flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
						aria-label="Scroll right"
					>
						<svg
							className="w-8 h-8 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
				)}
			</div>
		</div>
	);
}
