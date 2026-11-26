import { useState } from "react";
import { Link } from "react-router-dom";
import Categories from "../components/Categories/Categories";
import TopRestaurants from "../components/TopRestaurants/TopRestaurants";
import RestaurantList from "../components/RestaurantList/RestaurantList";
import Footer from "../components/Footer/Footer";
import { FiArrowRight, FiPercent } from "react-icons/fi";
import { useScrollReveal } from "../hooks/useScrollReveal";

function Home({ addToCart }) {
  const [selectedCategory, setSelectedCategory] = useState("");

  useScrollReveal();

  return (
    <main className="homePage">
      <Categories
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      {!selectedCategory && <TopRestaurants addToCart={addToCart} />}

      {/* Interactive Parallax Promo Banner */}
      {!selectedCategory && (
        <div
          className="parallaxPromoBanner reveal-on-scroll"
          data-reveal="zoom-fade"
          style={{ maxWidth: "1200px", margin: "24px auto 32px", padding: "0 20px" }}
        >
          <div className="parallaxPromoContent" style={{ position: "relative", zIndex: 2, maxWidth: "600px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(252, 128, 25, 0.2)",
                color: "#ff9f43",
                padding: "4px 12px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 700,
                marginBottom: "10px",
              }}
            >
              <FiPercent /> LIMITED TIME FEAST
            </span>
            <h3 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px", color: "#ffffff" }}>
              Craving something extraordinary?
            </h3>
            <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.5", marginBottom: "16px" }}>
              Get Flat 50% discount plus zero delivery fee on top Madurai restaurants today.
            </p>
            <Link
              to="/offers"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #fc8019 0%, #ff5252 100%)",
                color: "#ffffff",
                padding: "10px 22px",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "14px",
                boxShadow: "0 4px 16px rgba(252, 128, 25, 0.4)",
                transition: "all 0.25s ease",
              }}
            >
              Claim Offers <FiArrowRight />
            </Link>
          </div>
          <div className="parallaxPromoBgCircle" />
        </div>
      )}

      <RestaurantList
        addToCart={addToCart}
        selectedCategory={selectedCategory}
        onClearCategory={() => setSelectedCategory("")}
      />
      <Footer />
    </main>
  );
}

export default Home;