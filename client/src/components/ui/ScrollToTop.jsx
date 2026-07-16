import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to top on route changes, and shows a floating back-to-top button.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [animClass, setAnimClass] = useState("");

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  // Track scroll position for floating button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        if (!visible) {
          setVisible(true);
          setAnimClass("animate-btt-in");
        }
      } else {
        if (visible) {
          setAnimClass("animate-btt-out");
          setTimeout(() => {
            setVisible(false);
            setAnimClass("");
          }, 200);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visible]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      {visible && (
        <button
          onClick={scrollToTop}
          className={`fixed bottom-6 left-6 z-[999] w-11 h-11 rounded-full bg-netflix-red hover:bg-netflix-red-hover text-white shadow-xl shadow-netflix-red/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${animClass}`}
          aria-label="Scroll to top"
          title="Back to top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </>
  );
}
