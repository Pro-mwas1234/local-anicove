import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getTitle, getCoverImage, formatScore, formatEpisodes } from "../../utils/helpers";
import { Star, Play, Plus, Check } from "lucide-react";

export default function AnimeCard({ anime, className = "" }) {
	const [imgLoaded, setImgLoaded] = useState(false);
	const title = getTitle(anime);
	const cover = getCoverImage(anime);

	const handleImgLoad = useCallback(() => {
		setImgLoaded(true);
	}, []);

	return (
		<Link
			to={`/anime/${anime.id}`}
			className={`group relative block rounded-xl overflow-hidden bg-surface-base transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/50 outline-none focus-visible:ring-2 focus-visible:ring-netflix-red ${className}`}
			id={`anime-card-${anime.id}`}
		>
			{/* Cover image with blur placeholder */}
			<div className="relative aspect-2/3 overflow-hidden bg-surface-base">
				{/* Placeholder shimmer */}
				{!imgLoaded && (
					<div className="absolute inset-0 skeleton" />
				)}

				<img
					src={cover}
					alt={title}
					loading="lazy"
					onLoad={handleImgLoad}
					className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
						imgLoaded ? "opacity-100" : "opacity-0"
					}`}
				/>

				{/* Gradient overlay on hover */}
				<div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

				{/* Play button on hover */}
				<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
					<div className="w-14 h-14 rounded-full bg-netflix-red/90 flex items-center justify-center shadow-xl shadow-netflix-red/30 transform transition-transform group-hover:scale-110">
						<Play className="w-6 h-6 text-white fill-current ml-0.5" />
					</div>
				</div>

				{/* Score badge */}
				{anime.averageScore && (
					<div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-text-primary text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg border border-white/10">
						<Star className="w-3 h-3 fill-current text-yellow-400" /> {formatScore(anime.averageScore)}
					</div>
				)}

				{/* Status badge */}
				{anime.status === "RELEASING" && (
					<div className="absolute top-2 left-2 bg-netflix-red text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-lg animate-pulse">
						Airing
					</div>
				)}

				{/* Bottom info bar */}
				<div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
					<div className="flex items-center gap-2 text-xs text-text-secondary">
						{anime.format && (
							<span className="bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded font-medium">{anime.format}</span>
						)}
						{anime.episodes && (
							<span className="bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded font-medium">{formatEpisodes(anime.episodes)}</span>
						)}
					</div>
				</div>
			</div>

			{/* Title & Info */}
			<div className="p-3 lg:p-2.5">
				<h3 className="text-sm lg:text-xs font-semibold text-text-primary line-clamp-2 leading-snug min-h-[2.75em] group-hover:text-netflix-red transition-colors duration-200">
					{title}
				</h3>
				{anime.genres && anime.genres.length > 0 && (
					<p className="text-xs text-text-muted mt-1.5 lg:mt-1 truncate">
						{anime.genres.slice(0, 3).join(" · ")}
					</p>
				)}
			</div>

			{/* Bottom accent line on hover */}
			<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-netflix-red scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
		</Link>
	);
}
