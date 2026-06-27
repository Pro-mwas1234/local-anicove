# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-27

### Added

- **Initial Release**: Launched LocalLink Anime Stream, a Netflix-inspired responsive React frontend and native Node.js proxy application.
- **YouTube-Style Theater Mode**: Added a toggleable theater mode button in the video player control bar that expands the video across the full viewport width (`w-full`) and dynamically shifts the right-side anime details box underneath into a sleek horizontal responsive card layout.
- **Interactive Carousels (`SwiperCarousel`)**: Implemented interactive Swiper carousels supporting dedicated left/right navigation arrows across all screen sizes.
- **Top Rankings Sidebar**: Integrated a responsive top rankings sidebar displaying Trending, Popular, and Recently Released anime directly alongside recommendations on the Watch Page.
- **Native HLS Stream Playback**: Added adaptive resolution switching, robust proxy-first CORS handling, subtitle track loading, keyboard media shortcuts, and next/previous episode navigation.
- **Icon Stamp Tooling (`resedit`)**: Implemented Windows executable icon stamping script (`set-icon.js`) using `resedit` to ensure clean resource injection without modifying or corrupting `pkg` virtual filesystem payloads.
- **Docker Deployment**: Added containerized multi-stage slim Docker build (`locallink-anime-stream-app:latest`) and Nginx reverse proxy configuration.

### Changed

- **UI/UX Refinements**: Compacted schedule card widths for better presentation on desktop, fixed slider navigation button state bindings, and replaced text branding with logo icons in navbar and footer.
- **Codebase Optimization**: Performed a repository audit removing ~162 lines of dead code and unused dependencies.
