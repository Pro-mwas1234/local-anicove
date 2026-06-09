import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getTitle, truncateText, getBannerImage } from "../../utils/helpers";
import { SkeletonHero } from "../ui/Skeleton";
import { Play, Info, Star } from "lucide-react";

export default function HeroBanner({ anime = [] }) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [transitioning, setTransitioning] = useState(false);

	// Only use anime that have banner images
	const bannerAnime = anime.filter((a) => getBannerImage(a));
	const current = bannerAnime[currentIndex];

	const goTo = useCallback(
		(index) => {
			if (transitioning) return;
			setTransitioning(true);
			setTimeout(() => {
				setCurrentIndex(index % bannerAnime.length);
				setTransitioning(false);
			}, 400);
		},
		[transitioning, bannerAnime.length]
	);

	// Auto-rotate every 8s
	useEffect(() => {
		if (bannerAnime.length <= 1) return;
		const interval = setInterval(() => {
			goTo(currentIndex + 1);
		}, 8000);
		return () => clearInterval(interval);
	}, [currentIndex, bannerAnime.length, goTo]);

	if (!bannerAnime.length) return <SkeletonHero />;

	const title = getTitle(current);
	const description = truncateText(current.description, 250);
	const banner = getBannerImage(current);

	return (
		<section id="hero-banner" className="relative w-full h-[70vh] lg:h-[85vh] overflow-hidden mb-10">
			{/* Background image */}
			<div
				className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${transitioning ? "opacity-0" : "opacity-100"
					}`}
				style={{ backgroundImage: `url(${banner})` }}
			/>

			{/* Gradient overlays */}
			<div className="absolute inset-0 gradient-overlay-bottom" />
			<div className="absolute inset-0 gradient-overlay-left" />

			{/* Content */}
			<div className="absolute bottom-0 left-0 right-0 p-6 lg:p-24 pb-12 lg:pb-20">
				<div className="max-w-2xl space-y-4">
					{/* Genres */}
					{current.genres && (
						<div className="flex flex-wrap gap-2">
							{current.genres.slice(0, 4).map((genre) => (
								<span
									key={genre}
									className="text-xs font-semibold text-text-secondary bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full"
								>
									{genre}
								</span>
							))}
						</div>
					)}

					{/* Title */}
					<h1
						className={`text-3xl sm:text-4xl lg:text-[56px] font-black leading-tight text-white transition-all duration-500 ${transitioning ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
							}`}
					>
						{title}
					</h1>

					{/* Meta info */}
					<div className="flex items-center gap-3 text-sm text-text-secondary">
						{current.averageScore && (
							<span className="flex items-center gap-1 text-green-400 font-bold">
								<Star className="w-4 h-4 fill-current" /> {(current.averageScore / 10).toFixed(1)}
							</span>
						)}
						{current.seasonYear && <span>{current.seasonYear}</span>}
						{current.format && <span>{current.format}</span>}
						{current.episodes && <span>{current.episodes} Episodes</span>}
					</div>

					{/* Description */}
					{description && (
						<p
							className={`text-sm lg:text-base text-text-secondary leading-relaxed max-w-xl transition-all duration-500 delay-100 ${transitioning ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
								}`}
						>
							{description}
						</p>
					)}

					{/* CTA Buttons */}
					<div className="flex items-center gap-4 pt-2">
						<Link
							to={`/anime/${current.id}`}
							className="flex items-center gap-2 bg-netflix-red hover:bg-netflix-red-hover active:bg-netflix-red-active text-white font-semibold px-6 py-3 rounded transition-colors"
						>
							<Play className="w-5 h-5 fill-current" />
							Watch Now
						</Link>
						<Link
							to={`/anime/${current.id}`}
							className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium px-6 py-3 rounded transition-colors"
						>
							<Info className="w-5 h-5" />
							More Info
						</Link>
					</div>
				</div>

				{/* Carousel dots */}
				{bannerAnime.length > 1 && (
					<div className="flex gap-2 mt-8">
						{bannerAnime.map((_, idx) => (
							<button
								key={idx}
								onClick={() => goTo(idx)}
								className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex
									? "w-8 bg-netflix-red"
									: "w-4 bg-white/30 hover:bg-white/50"
									}`}
								aria-label={`Go to slide ${idx + 1}`}
							/>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
