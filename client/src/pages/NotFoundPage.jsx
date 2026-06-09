import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div id="not-found-page" className="pt-24 px-5 lg:px-24 min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-8xl lg:text-9xl font-black text-netflix-red">404</h1>
        <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">
          Lost in the Void
        </h2>
        <p className="text-text-secondary max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved to another dimension.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-netflix-red hover:bg-netflix-red-hover text-white font-semibold px-8 py-3 rounded transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Go Home
        </Link>
      </div>
    </div>
  );
}
