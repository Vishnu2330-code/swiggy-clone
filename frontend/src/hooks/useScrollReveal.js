import { useEffect } from "react";

/**
 * Automatically observes elements matching selector or with data-reveal attribute.
 * Adds the 'revealed' class once they intersect with the viewport.
 */
export function useScrollReveal(dependencies = []) {
  useEffect(() => {
    const selector = "[data-reveal], .reveal-on-scroll";
    const elements = document.querySelectorAll(selector);

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            // Unobserve once revealed for optimal memory and 60fps performance
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -60px 0px", // Trigger slightly before it hits bottom of viewport
        threshold: 0.12,
      }
    );

    elements.forEach((el) => {
      if (!el.classList.contains("revealed")) {
        observer.observe(el);
      }
    });

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, dependencies);
}
