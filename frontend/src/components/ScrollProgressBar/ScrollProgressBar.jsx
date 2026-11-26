import { useScrollProgress } from "../../hooks/useScrollProgress";
import "./ScrollProgressBar.css";

export default function ScrollProgressBar() {
  const { scrollProgress } = useScrollProgress();

  return (
    <div
      className="globalScrollProgressBarContainer"
      role="progressbar"
      aria-valuenow={Math.round(scrollProgress)}
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        className="globalScrollProgressBarFill"
        style={{ width: `${scrollProgress}%` }}
      >
        <span className="globalScrollProgressBarGlow" />
      </div>
    </div>
  );
}
