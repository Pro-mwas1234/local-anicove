export function SkeletonCard() {
	return (
		<div className="animate-pulse">
			<div className="skeleton rounded-lg aspect-2/3 w-full" />
			<div className="mt-3 space-y-2">
				<div className="skeleton h-4 w-3/4 rounded" />
				<div className="skeleton h-3 w-1/2 rounded" />
			</div>
		</div>
	);
}

export function SkeletonRow({ count = 6 }) {
	return (
		<div className="space-y-6">
			<div className="skeleton h-7 w-48 rounded" />
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
				{Array.from({ length: count }).map((_, i) => (
					<SkeletonCard key={i} />
				))}
			</div>
		</div>
	);
}

export function SkeletonHero() {
	return (
		<div className="relative w-full h-[70vh] lg:h-[85vh] skeleton">
			<div className="absolute bottom-0 left-0 right-0 p-6 lg:p-24 space-y-4">
				<div className="skeleton h-12 w-2/3 rounded" />
				<div className="skeleton h-5 w-1/2 rounded" />
				<div className="skeleton h-5 w-1/3 rounded" />
				<div className="flex gap-4 mt-6">
					<div className="skeleton h-14 w-36 rounded" />
					<div className="skeleton h-14 w-36 rounded" />
				</div>
			</div>
		</div>
	);
}

export function SkeletonDetail() {
	return (
		<div className="pt-20 px-5 lg:px-24 space-y-8 animate-pulse">
			<div className="skeleton w-full h-[40vh] rounded-lg" />
			<div className="flex gap-8">
				<div className="skeleton w-48 h-72 rounded-lg shrink-0" />
				<div className="flex-1 space-y-4">
					<div className="skeleton h-10 w-2/3 rounded" />
					<div className="skeleton h-5 w-full rounded" />
					<div className="skeleton h-5 w-3/4 rounded" />
					<div className="skeleton h-5 w-1/2 rounded" />
				</div>
			</div>
		</div>
	);
}
