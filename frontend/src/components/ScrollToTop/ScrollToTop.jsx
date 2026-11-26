import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FiArrowUp } from "react-icons/fi";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import "./ScrollToTop.css";

export function ScrollResetOnNav() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

export default function ScrollToTop() {
  const { scrollProgress, isScrolled } = useScrollProgress();

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // SVG circular gauge calculation (radius = 18, circumference ≈ 113.1)
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <button
      className={`scrollToTopBtn ${isScrolled ? "visible" : ""}`}
      onClick={handleScrollToTop}
      aria-label="Scroll back to top"
      title={`Back to top (${Math.round(scrollProgress)}%)`}
    >
      <svg className="scrollProgressSvg" width="46" height="46" viewBox="0 0 46 46">
        <circle
          className="scrollProgressCircleBg"
          cx="23"
          cy="23"
          r={radius}
        />
        <circle
          className="scrollProgressCircleFill"
          cx="23"
          cy="23"
          r={radius}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
          }}
        />
      </svg>
      <FiArrowUp className="scrollToTopIcon" />
    </button>
  );
}
