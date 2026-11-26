import { useRef, useState, useEffect, useCallback } from "react";
import "./Categories.css";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { categoryApi } from "../../services/api";
import staticCategories from "../../data/categoryData";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const PRIORITY_ORDER = [
  "Biryani",
  "Parotta",
  "Shawarma",
  "Pizza",
  "Burger",
  "South Indian",
  "Ice Cream",
  "Chinese",
  "Fried Rice",
  "North Indian",
  "Cakes",
  "Desserts",
];

function Categories({ selectedCategory, onSelectCategory }) {
  const sliderRef = useRef(null);
  const [categories, setCategories] = useState(staticCategories);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  useScrollReveal([categories]);

  const loadCategories = useCallback(() => {
    categoryApi
      .getAll()
      .then((data) => {
        if (data && data.length > 0) {
          setCategories(data);
        }
      })
      .catch((err) => {
        console.warn("Using local categories fallback:", err.message);
      });
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCarouselScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress((scrollLeft / maxScroll) * 100);
    }
  };

  const scrollLeft = () => {
    sliderRef.current.scrollBy({
      left: -320,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    sliderRef.current.scrollBy({
      left: 320,
      behavior: "smooth",
    });
  };

  // Drag-to-scroll handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeftState(sliderRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    sliderRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleCategoryClick = (catName) => {
    if (onSelectCategory) {
      if (selectedCategory === catName) {
        onSelectCategory("");
      } else {
        onSelectCategory(catName);
        setTimeout(() => {
          const element = document.getElementById("restaurant-list-section");
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 150);
      }
    }
  };

  // Sort by priority so the top favorites are first
  const sortedCategories = [...categories].sort((a, b) => {
    const idxA = PRIORITY_ORDER.indexOf(a.name);
    const idxB = PRIORITY_ORDER.indexOf(b.name);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });

  return (
    <section className="categories reveal-on-scroll" data-reveal="fade-up">
      <div className="categoryHeader">
        <h2>What's on your mind?</h2>

        <div className="categoryHeaderRight">
          <div className="sliderButtons">
            <button onClick={scrollLeft} aria-label="Scroll Left" title="Scroll Left">
              <FiChevronLeft />
            </button>

            <button onClick={scrollRight} aria-label="Scroll Right" title="Scroll Right">
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`categoryContainer ${isDragging ? "dragging" : ""}`}
        ref={sliderRef}
        onScroll={handleCarouselScroll}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
      >
        {sortedCategories.map((item, idx) => {
          const isSelected = selectedCategory === item.name;
          return (
            <div
              className={`categoryCard ${isSelected ? "selected" : ""}`}
              key={item._id || item.id || item.name}
              onClick={() => handleCategoryClick(item.name)}
              title={item.name}
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              <div className="categoryImageWrapper">
                <img
                  src={item.image}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = "/restaurants/pizza.jpg";
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="carouselScrollIndicator" aria-hidden="true">
        <div className="carouselScrollTrack">
          <div
            className="carouselScrollThumb"
            style={{
              width: "30%",
              transform: `translateX(${scrollProgress * 2.33}%)`,
            }}
          />
        </div>
      </div>
    </section>
  );
}

export default Categories;
