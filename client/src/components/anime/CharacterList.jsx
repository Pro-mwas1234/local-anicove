export default function CharacterList({ characters = [] }) {
	if (!characters || characters.length === 0) return null;

	return (
		<div className="space-y-4">
			<h3 className="text-xl font-bold text-text-primary">Characters</h3>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
				{characters.slice(0, 12).map((char, idx) => (
					<div
						key={idx}
						className="flex items-center gap-3 bg-surface-base rounded-lg p-3 border border-surface-border"
					>
						<img
							src={char.image || "/placeholder.svg"}
							alt={char.name}
							className="w-12 h-12 rounded-full object-cover shrink-0"
							loading="lazy"
						/>
						<div className="min-w-0 flex-1">
							<p className="text-sm font-medium text-text-primary truncate">
								{char.name}
							</p>
							<p className="text-xs text-text-muted">{char.role || ""}</p>
						</div>
						{/* Voice actor */}
						{char.voiceActor && (
							<div className="flex items-center gap-2 shrink-0">
								<div className="text-right">
									<p className="text-xs text-text-secondary truncate max-w-25">
										{char.voiceActor.name}
									</p>
								</div>
								{char.voiceActor.image && (
									<img
										src={char.voiceActor.image}
										alt={char.voiceActor.name}
										className="w-10 h-10 rounded-full object-cover"
										loading="lazy"
									/>
								)}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
