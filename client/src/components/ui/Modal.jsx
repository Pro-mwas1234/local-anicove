import { useEffect } from "react";

export default function Modal({ isOpen, onClose, children, title }) {
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-20 flex items-center justify-center"
			onClick={onClose}
		>
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

			{/* Modal content */}
			<div
				className="relative bg-surface-base rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
				onClick={(e) => e.stopPropagation()}
			>
				{title && (
					<div className="flex items-center justify-between p-6 border-b border-surface-border">
						<h2 className="text-xl font-bold text-text-primary">{title}</h2>
						<button
							onClick={onClose}
							className="text-text-muted hover:text-text-primary transition-colors text-2xl leading-none"
							aria-label="Close modal"
						>
							×
						</button>
					</div>
				)}
				<div className="p-6">{children}</div>
			</div>
		</div>
	);
}
