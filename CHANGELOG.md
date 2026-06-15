# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-26

### Added

- Created complete CI/CD workflow via GitHub Actions for automated testing and release generation.
- Added executable bundling for Windows and Linux platforms using `pkg`.
- Implemented fully integrated native Node.js proxy to Anilist and Miruro pipe endpoints.
- Developed beautiful, Netflix-inspired responsive React frontend using Tailwind CSS v4.
- Added comprehensive search, dynamic filtering, and categorized discovery grids.
- Added native HLS stream playback with adaptive resolution switching.
- Included API and Setup Documentation in `docs/` folder.
- Configured automated semantic versioning and changelog generation workflow.

## [1.1.0] - 2026-06-16

### Fixed

- **HLS Playback Fix**: Resolved "video not loading" issues by implementing a robust proxy-first URL strategy. The player now automatically rewrites M3U8 source URLs to go through the Node.js proxy, ensuring correct CORS handling and reliable stream initialization.
- **Subtitle Loading**: Fixed an issue where subtitle tracks were not loading by explicitly waiting for the HLS manifest to parse before injecting track data.
- **Error Handling**: Improved HLS error recovery to prevent infinite "blinking" loops by limiting recovery attempts and providing clearer console warnings.

### Added

- **Title Overlay**: Added a non-intrusive title overlay that appears at the top of the video during the first few seconds of playback.
- **UX Improvements**:
  - Added a "Play" button overlay on the video thumbnail.
  - Implemented "Next" and "Previous" episode navigation buttons.
  - Added keyboard shortcut support for common media keys (Space, Left/Right Arrows, F).

### Changed

- **UI/UX**: Redesigned the player interface for a more premium, full-screen experience.
- **Controls**: Updated `PlayerControls` component to integrate with the new UX features.
