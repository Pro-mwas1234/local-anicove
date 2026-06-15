import { Settings, Check } from "lucide-react";

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function SettingsMenu({
	isOpen,
	onToggle,
	qualities,
	currentQuality,
	onQualityChange,
	playbackSpeed,
	onSpeedChange,
	autoNext,
	onAutoNextChange,
	autoSkipIntro,
	onAutoSkipIntroChange,
	autoSkipOutro,
	onAutoSkipOutroChange,
	subFontSize,
	onSubFontSizeChange,
	subBackgroundOpacity,
	onSubBackgroundOpacityChange,
	subEdgeStyle,
	onSubEdgeStyleChange,
	subEdgeThickness,
	onSubEdgeThicknessChange,
	subPosition,
	onSubPositionChange,
}) {
	if (!isOpen) {
		return (
			<button onClick={onToggle} className="player-btn" title="Settings">
				<Settings className="w-5 h-5" />
			</button>
		);
	}

	return (
		<div className="relative">
			<button onClick={onToggle} className="player-btn player-btn-active" title="Settings">
				<Settings className="w-5 h-5" />
			</button>

			{/* Settings Panel */}
			<div className="player-settings-panel animate-dropdown-open" onClick={(e) => e.stopPropagation()}>
				{/* Quality */}
				{qualities.length > 0 && (
					<div className="player-settings-section">
						<div className="player-settings-label">Quality</div>
						<div className="player-settings-options">
							{qualities.map((q) => (
								<button
									key={q.value}
									onClick={() => onQualityChange(q.value)}
									className={`player-settings-option ${
										currentQuality === q.value ? "player-settings-option-active" : ""
									}`}
								>
									<span>{q.label}</span>
									{currentQuality === q.value && <Check className="w-3.5 h-3.5" />}
								</button>
							))}
						</div>
					</div>
				)}

				{/* Playback Speed */}
				<div className="player-settings-section">
					<div className="player-settings-label">Speed</div>
					<div className="player-settings-options player-settings-speed-grid">
						{SPEEDS.map((speed) => (
							<button
								key={speed}
								onClick={() => onSpeedChange(speed)}
								className={`player-settings-speed-btn ${
									playbackSpeed === speed ? "player-settings-option-active" : ""
								}`}
							>
								{speed === 1 ? "Normal" : `${speed}x`}
							</button>
						))}
					</div>
				</div>

				{/* Toggles */}
				<div className="player-settings-section">
					<div className="player-settings-label">Playback</div>
					<div className="player-settings-options">
						<button
							onClick={() => onAutoNextChange(!autoNext)}
							className="player-settings-toggle"
						>
							<span>Auto Next</span>
							<div className={`player-toggle ${autoNext ? "player-toggle-on" : ""}`}>
								<div className="player-toggle-thumb" />
							</div>
						</button>
						<button
							onClick={() => onAutoSkipIntroChange(!autoSkipIntro)}
							className="player-settings-toggle"
						>
							<span>Auto Skip Intro</span>
							<div className={`player-toggle ${autoSkipIntro ? "player-toggle-on" : ""}`}>
								<div className="player-toggle-thumb" />
							</div>
						</button>
						<button
							onClick={() => onAutoSkipOutroChange(!autoSkipOutro)}
							className="player-settings-toggle"
						>
							<span>Auto Skip Outro</span>
							<div className={`player-toggle ${autoSkipOutro ? "player-toggle-on" : ""}`}>
								<div className="player-toggle-thumb" />
							</div>
						</button>
					</div>
				</div>

				{/* Subtitles */}
				<div className="player-settings-section">
					<div className="player-settings-label">Subtitles</div>
					
					{/* Font Size */}
					<div className="text-xs text-zinc-400 mt-2 mb-1 px-3">Font Size</div>
					<div className="player-settings-options player-settings-speed-grid px-3">
						{[
							{ label: "Small", value: 0.75 },
							{ label: "Normal", value: 1 },
							{ label: "Large", value: 1.5 },
							{ label: "X-Large", value: 2 },
						].map((opt) => (
							<button
								key={opt.value}
								onClick={() => onSubFontSizeChange(opt.value)}
								className={`player-settings-speed-btn ${
									subFontSize === opt.value ? "player-settings-option-active" : ""
								}`}
							>
								{opt.label}
							</button>
						))}
					</div>

					{/* Background */}
					<div className="text-xs text-zinc-400 mt-3 mb-1 px-3">Background</div>
					<div className="player-settings-options player-settings-speed-grid px-3">
						{[
							{ label: "None", value: 0 },
							{ label: "Dim", value: 0.25 },
							{ label: "Dark", value: 0.5 },
							{ label: "Solid", value: 1 },
						].map((opt) => (
							<button
								key={opt.value}
								onClick={() => onSubBackgroundOpacityChange(opt.value)}
								className={`player-settings-speed-btn ${
									subBackgroundOpacity === opt.value ? "player-settings-option-active" : ""
								}`}
							>
								{opt.label}
							</button>
						))}
					</div>

					{/* Edge Style */}
					<div className="text-xs text-zinc-400 mt-3 mb-1 px-3">Edge Style</div>
					<div className="player-settings-options player-settings-speed-grid px-3">
						{[
							{ label: "Uniform", value: "uniform" },
							{ label: "Shadow", value: "dropshadow" },
							{ label: "None", value: "none" },
						].map((opt) => (
							<button
								key={opt.value}
								onClick={() => onSubEdgeStyleChange(opt.value)}
								className={`player-settings-speed-btn ${
									subEdgeStyle === opt.value ? "player-settings-option-active" : ""
								}`}
							>
								{opt.label}
							</button>
						))}
					</div>

					{/* Edge Thickness */}
					<div className="text-xs text-zinc-400 mt-3 mb-1 px-3">Edge Thickness</div>
					<div className="player-settings-options player-settings-speed-grid px-3">
						{[
							{ label: "Thin", value: 1 },
							{ label: "Normal", value: 2 },
							{ label: "Thick", value: 3 },
							{ label: "Huge", value: 4 },
						].map((opt) => (
							<button
								key={opt.value}
								onClick={() => onSubEdgeThicknessChange(opt.value)}
								className={`player-settings-speed-btn ${
									subEdgeThickness === opt.value ? "player-settings-option-active" : ""
								}`}
							>
								{opt.label}
							</button>
						))}
					</div>

					{/* Vertical Position */}
					<div className="text-xs text-zinc-400 mt-3 mb-1 px-3">Vertical Position</div>
					<div className="player-settings-options player-settings-speed-grid px-3">
						{[
							{ label: "Bottom", value: 0 },
							{ label: "High", value: 30 },
							{ label: "Higher", value: 60 },
							{ label: "Highest", value: 90 },
						].map((opt) => (
							<button
								key={opt.value}
								onClick={() => onSubPositionChange(opt.value)}
								className={`player-settings-speed-btn ${
									subPosition === opt.value ? "player-settings-option-active" : ""
								}`}
							>
								{opt.label}
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
