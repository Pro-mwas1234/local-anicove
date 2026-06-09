import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSchedule } from "../services/api";
import { getTitle, getCoverImage, getDayName } from "../utils/helpers";

export default function SchedulePage() {
	const [schedule, setSchedule] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getSchedule()
			.then((data) => setSchedule(data))
			.catch((err) => console.error("Schedule error:", err))
			.finally(() => setLoading(false));
	}, []);

	const today = new Date().getDay();

	// Build schedule by day
	const groupedSchedule = (schedule?.results || []).reduce((acc, anime) => {
		if (!anime.nextAiringEpisode?.airingAt) return acc;
		const date = new Date(anime.nextAiringEpisode.airingAt * 1000);
		const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

		if (!acc[dayName]) acc[dayName] = [];
		acc[dayName].push(anime);
		return acc;
	}, {});

	const days = Object.entries(groupedSchedule).sort(([a], [b]) => {
		// Sort so today comes first
		const dayOrder = (d) => {
			const idx = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].indexOf(d.toLowerCase());
			return (idx - today + 7) % 7;
		};
		return dayOrder(a) - dayOrder(b);
	});

	return (
		<div id="schedule-page" className="pt-24 px-5 lg:px-24 pb-16 min-h-screen">
			<h1 className="text-3xl lg:text-4xl font-black text-text-primary mb-8">
				Airing Schedule
			</h1>

			{loading ? (
				<div className="space-y-8">
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className="space-y-4">
							<div className="skeleton h-8 w-48 rounded" />
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
								{Array.from({ length: 5 }).map((_, j) => (
									<div key={j} className="skeleton h-48 rounded-lg" />
								))}
							</div>
						</div>
					))}
				</div>
			) : days.length > 0 ? (
				<div className="space-y-10">
					{days.map(([dayName, animeList]) => {
						const isToday =
							dayName.toLowerCase() ===
							["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][today];

						return (
							<div key={dayName}>
								<h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-3">
									<span className="capitalize">{dayName}</span>
									{isToday && (
										<span className="text-xs bg-netflix-red text-white px-3 py-1 rounded-full font-bold">
											TODAY
										</span>
									)}
								</h2>
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
									{(Array.isArray(animeList) ? animeList : []).map((anime) => (
										<Link
											key={anime.id}
											to={`/anime/${anime.id}`}
											className="group bg-surface-base rounded-lg overflow-hidden border border-surface-border hover:border-text-muted transition-all hover:scale-[1.02]"
										>
											<div className="relative aspect-2/3 overflow-hidden">
												<img
													src={getCoverImage(anime)}
													alt={getTitle(anime)}
													className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
													loading="lazy"
												/>
												{anime.nextAiringEpisode && (
													<div className="absolute top-2 left-2 bg-netflix-red text-white text-xs font-bold px-2 py-1 rounded">
														EP {anime.nextAiringEpisode.episode}
													</div>
												)}
											</div>
											<div className="p-3">
												<p className="text-sm font-medium text-text-primary line-clamp-2">
													{getTitle(anime)}
												</p>
												{anime.nextAiringEpisode?.airingAt && (
													<p className="text-xs text-text-muted mt-1">
														{new Date(anime.nextAiringEpisode.airingAt * 1000).toLocaleTimeString([], {
															hour: "2-digit",
															minute: "2-digit",
														})}
													</p>
												)}
											</div>
										</Link>
									))}
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className="text-center py-20">
					<p className="text-text-muted text-lg">No schedule data available.</p>
				</div>
			)}
		</div>
	);
}
