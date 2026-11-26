import "./TopRestaurants.css";
import { useRef, useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { restaurantApi } from "../../services/api";
import staticRestaurants from "../../data/restaurantData";
import RestaurantCard from "../RestaurantCard/RestaurantCard";
import { useAdmin } from "../../context/AdminContext";
import { useScrollReveal } from "../../hooks/useScrollReveal";

function TopRestaurants({ addToCart }) {
  const { refreshTrigger } = useAdmin();
  const sliderRef = useRef(null);
  const [restaurants, setRestaurants] = useState(staticRestaurants);
  const [favorites, setFavorites] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  useScrollReveal([restaurants]);

  useEffect(() => {
    restaurantApi
      .getAll({ sortBy: "rating_desc" })
      .then((data) => {
        if (data && data.length > 0) {
          setRestaurants(data);
        }
      })
      .catch((err) => {
        console.warn("Using local top restaurants fallback:", err.message);
      });
  }, [refreshTrigger]);

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
      left: -350,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    sliderRef.current.scrollBy({
      left: 350,
      behavior: "smooth",
    });
  };

  // Drag-to-scroll
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

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((item) => item !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  return (
    <section className="topRestaurants reveal-on-scroll" data-reveal="fade-up">
      <div className="topHeader">
        <h2>Top restaurant chains in Madurai</h2>

        <div className="sliderButtons">
          <button onClick={scrollLeft} aria-label="Scroll Left">
            <FiChevronLeft />
          </button>

          <button onClick={scrollRight} aria-label="Scroll Right">
            <FiChevronRight />
          </button>
        </div>
      </div>

      <div
        className={`restaurantSlider ${isDragging ? "dragging" : ""}`}
        ref={sliderRef}
        onScroll={handleCarouselScroll}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
      >
        {restaurants.map((item, idx) => (
          <div
            className="topRestItemWrapper"
            key={item._id || item.id}
          >
            <RestaurantCard
              item={item}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              addToCart={addToCart}
              revealDelay={(idx % 5) * 60}
            />
          </div>
        ))}
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

export default TopRestaurants;