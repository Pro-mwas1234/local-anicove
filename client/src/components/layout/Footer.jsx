import { Link } from "react-router-dom";
import pkg from "../../../package.json";

export default function Footer() {
  return (
    <footer className="bg-surface-deep border-t border-surface-border mt-16">
      <div className="max-w-7xl mx-auto px-5 lg:px-24 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-text-primary font-semibold mb-4">Navigate</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-text-secondary text-sm hover:text-text-primary transition-colors">Home</Link>
              <Link to="/browse" className="text-text-secondary text-sm hover:text-text-primary transition-colors">Browse</Link>
              <Link to="/schedule" className="text-text-secondary text-sm hover:text-text-primary transition-colors">Schedule</Link>
              <Link to="/my-list" className="text-text-secondary text-sm hover:text-text-primary transition-colors">My List</Link>
            </div>
          </div>
          <div>
            <h4 className="text-text-primary font-semibold mb-4">Browse</h4>
            <div className="flex flex-col gap-2">
              <Link to="/browse?genre=Action" className="text-text-secondary text-sm hover:text-text-primary transition-colors">Action</Link>
              <Link to="/browse?genre=Romance" className="text-text-secondary text-sm hover:text-text-primary transition-colors">Romance</Link>
              <Link to="/browse?genre=Comedy" className="text-text-secondary text-sm hover:text-text-primary transition-colors">Comedy</Link>
              <Link to="/browse?genre=Fantasy" className="text-text-secondary text-sm hover:text-text-primary transition-colors">Fantasy</Link>
            </div>
          </div>
          <div>
            <h4 className="text-text-primary font-semibold mb-4">Info</h4>
            <div className="flex flex-col gap-2">
              <span className="text-text-secondary text-sm">Powered by Miruro API</span>
              <span className="text-text-secondary text-sm">Data from AniList</span>
            </div>
          </div>
          <div>
            <h4 className="text-text-primary font-semibold mb-4">LocalLink</h4>
            <p className="text-text-secondary text-sm leading-relaxed">
              Your personal anime streaming companion. Discover, track, and watch your favorite anime all in one place.
            </p>
          </div>
        </div>
        
        <div className="border-t border-surface-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="LocalLink Logo" className="h-7 w-7 rounded object-contain shadow" />
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black tracking-tight text-white">
                LOCAL<span className="text-netflix-red font-light">LINK</span>
              </span>
              <span className="text-[11px] font-mono text-text-muted bg-surface-card px-1.5 py-0.5 rounded border border-surface-border">v{pkg.version}</span>
            </div>
          </div>
          <p className="text-text-muted text-xs">
            © {new Date().getFullYear()} LocalLink - Anime Stream. For educational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
