import { useState, useEffect } from "react";

/**
 * Tracks which section is currently active in the viewport based on scroll position.
 * @param {string[]} sectionIds - List of element IDs to track
 * @param {number} offset - Vertical offset for sticky header height compensation
 */
export function useScrollSpy(sectionIds = [], offset = 120) {
  const [activeId, setActiveId] = useState(sectionIds[0] || "");

  useEffect(() => {
    if (!sectionIds.length) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const scrollPosition = window.pageYOffset + offset;

        let currentActive = activeId;
        for (let i = 0; i < sectionIds.length; i++) {
          const id = sectionIds[i];
          const element = document.getElementById(id);
          if (element) {
            const top = element.offsetTop;
            const height = element.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
              currentActive = id;
              break;
            }
          }
        }

        if (currentActive !== activeId) {
          setActiveId(currentActive);
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sectionIds, offset, activeId]);

  return activeId;
}
