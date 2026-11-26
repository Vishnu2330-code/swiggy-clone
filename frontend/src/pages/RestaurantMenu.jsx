import { useState, useEffect, useCallback, useMemo } from "react";
import "./RestaurantMenu.css";
import { Link, useParams } from "react-router-dom";
import { restaurantApi } from "../services/api";
import staticRestaurants from "../data/restaurantData";
import staticMenu from "../data/menuData";
import {
  FiArrowLeft,
  FiSearch,
  FiBookOpen,
  FiX,
  FiChevronRight,
} from "react-icons/fi";
import { useScrollSpy } from "../hooks/useScrollSpy";
import { useScrollReveal } from "../hooks/useScrollReveal";

function RestaurantMenu({ addToCart }) {
  const { id } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isVeg, setIsVeg] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    restaurantApi
      .getById(id)
      .then((data) => {
        setRestaurant(data);
        if (data.menu && data.menu.length > 0) {
          setMenu(data.menu);
        } else {
          restaurantApi.getMenu(id).then((m) => setMenu(m));
        }
      })
      .catch((err) => {
        console.warn("Using local fallback:", err.message);
        const rest = staticRestaurants.find((r) => String(r.id) === String(id));
        setRestaurant(rest || staticRestaurants[0]);
        const m = staticMenu.filter((it) => String(it.restaurantId) === String(id));
        setMenu(m.length > 0 ? m : staticMenu.slice(0, 8));
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Distinct categories
  const categories = useMemo(() => {
    return ["All", ...new Set(menu.map((item) => item.category || "Dishes"))];
  }, [menu]);

  // Section IDs for ScrollSpy
  const sectionIds = useMemo(() => {
    return categories
      .filter((cat) => cat !== "All")
      .map((cat) => `menu-cat-${cat.replace(/\s+/g, "-").toLowerCase()}`);
  }, [categories]);

  const activeSpyId = useScrollSpy(sectionIds, 180);

  // Derive active category from scrollspy when viewing all
  const activeCategory = useMemo(() => {
    if (selectedCategory !== "All") return selectedCategory;
    if (!activeSpyId) return "All";
    const found = categories.find(
      (cat) => `menu-cat-${cat.replace(/\s+/g, "-").toLowerCase()}` === activeSpyId
    );
    return found || "All";
  }, [activeSpyId, selectedCategory, categories]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menu.filter((item) => {
      if (isVeg && !item.isVeg) return false;
      if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [menu, isVeg, selectedCategory, search]);

  useScrollReveal([filteredItems, selectedCategory]);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setShowCategoryDrawer(false);

    if (cat !== "All") {
      const targetId = `menu-cat-${cat.replace(/\s+/g, "-").toLowerCase()}`;
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="menuLoading">
        <div className="spinner"></div>
        <p>Loading full menu...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="menuPage">
        <h2>Restaurant Not Found</h2>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  const isClosed = restaurant.isOpen === false;

  // Group filtered items by category if viewing all
  const groupedMenu = {};
  if (selectedCategory === "All" && !search) {
    filteredItems.forEach((item) => {
      const cat = item.category || "Dishes";
      if (!groupedMenu[cat]) groupedMenu[cat] = [];
      groupedMenu[cat].push(item);
    });
  }

  return (
    <div className="menuPage">
      <div className="menuTopBar reveal-on-scroll" data-reveal="fade-down">
        <Link to={`/restaurant/${restaurant._id || restaurant.id}`} className="backLink">
          <FiArrowLeft /> Back to Details
        </Link>
        <div className="menuHeadingRow">
          <h1>{restaurant.name} - Full Menu</h1>
          <span className="menuItemsCountBadge">{filteredItems.length} Dishes</span>
        </div>
      </div>

      {/* STICKY FILTER & SCROLLSPY BAR */}
      <div className="menuStickyContainer">
        <div className="menuFilterBar">
          <div className="menuSearchInputWrapper">
            <FiSearch className="searchIcon" />
            <input
              type="text"
              placeholder="Search within menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="clearDishBtn"
                onClick={() => setSearch("")}
                aria-label="Clear Search"
              >
                ✕
              </button>
            )}
          </div>

          <button
            className={`vegBtn ${isVeg ? "active" : ""}`}
            onClick={() => setIsVeg(!isVeg)}
          >
            <span className="badge-veg"></span> Pure Veg
          </button>
        </div>

        {/* Scrollspy Category Tabs */}
        <div className="categoryTabs" role="tablist">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                role="tab"
                aria-selected={isActive}
                className={`catTab ${isActive ? "active" : ""}`}
                onClick={() => handleCategorySelect(cat)}
              >
                {cat}
                {cat !== "All" && (
                  <span className="catCountPill">
                    {menu.filter((m) => m.category === cat).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Grid - Grouped or Flat */}
      {selectedCategory === "All" && !search && Object.keys(groupedMenu).length > 0 ? (
        <div className="groupedMenuContainer">
          {Object.entries(groupedMenu).map(([categoryName, items]) => {
            const catId = `menu-cat-${categoryName.replace(/\s+/g, "-").toLowerCase()}`;
            return (
              <section className="categorySectionBlock" id={catId} key={categoryName}>
                <div className="categorySectionHeader">
                  <h2>{categoryName}</h2>
                  <span className="categorySectionCount">{items.length} items</span>
                </div>

                <div className="menuGrid">
                  {items.map((item, idx) => {
                    const isOutOfStock = item.inStock === false;
                    return (
                      <div
                        className={`menuItemCard ${isOutOfStock ? "dishOutOfStock" : ""} reveal-on-scroll`}
                        data-reveal="fade-up"
                        data-reveal-delay={(idx % 4) * 60}
                        key={item._id || item.id}
                      >
                        <div className="menuItemContent">
                          <div className="dishBadgeRow">
                            <span className={item.isVeg ? "badge-veg" : "badge-nonveg"}></span>
                            {item.isBestSeller && (
                              <span className="bestsellerBadge">⭐ Bestseller</span>
                            )}
                            {isOutOfStock && (
                              <span className="outOfStockBadge">Out of Stock</span>
                            )}
                          </div>

                          <h3>{item.name}</h3>
                          <span className="menuPrice">₹{item.price}</span>
                          <p className="menuDesc">
                            {item.description || "Freshly cooked to order with finest spices."}
                          </p>
                        </div>

                        <div className="menuItemImgWrapper">
                          <img
                            src={item.image || "/restaurants/pizza.jpg"}
                            alt={item.name}
                            onError={(e) => {
                              e.target.src = "/restaurants/pizza.jpg";
                            }}
                          />
                          <button
                            className="addDishBtn"
                            disabled={isOutOfStock || isClosed}
                            onClick={() => addToCart(item)}
                          >
                            {isOutOfStock ? "UNAVAILABLE" : "ADD +"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="menuGrid">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const isOutOfStock = item.inStock === false;
              return (
                <div
                  className={`menuItemCard ${isOutOfStock ? "dishOutOfStock" : ""} reveal-on-scroll`}
                  data-reveal="fade-up"
                  data-reveal-delay={(idx % 4) * 60}
                  key={item._id || item.id}
                >
                  <div className="menuItemContent">
                    <div className="dishBadgeRow">
                      <span className={item.isVeg ? "badge-veg" : "badge-nonveg"}></span>
                      {item.isBestSeller && (
                        <span className="bestsellerBadge">⭐ Bestseller</span>
                      )}
                      {isOutOfStock && (
                        <span className="outOfStockBadge">Out of Stock</span>
                      )}
                    </div>

                    <h3>{item.name}</h3>
                    <span className="menuPrice">₹{item.price}</span>
                    <p className="menuDesc">
                      {item.description || "Freshly cooked to order with finest spices."}
                    </p>
                  </div>

                  <div className="menuItemImgWrapper">
                    <img
                      src={item.image || "/restaurants/pizza.jpg"}
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = "/restaurants/pizza.jpg";
                      }}
                    />
                    <button
                      className="addDishBtn"
                      disabled={isOutOfStock || isClosed}
                      onClick={() => addToCart(item)}
                    >
                      {isOutOfStock ? "UNAVAILABLE" : "ADD +"}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="noDishes">
              <h3>No dishes found</h3>
              <p>Try searching for a different dish name or changing category.</p>
            </div>
          )}
        </div>
      )}

      {/* FLOATING BROWSE MENU BUTTON */}
      <div className="browseMenuFloatingWrapper">
        <button
          className="browseMenuBtn"
          onClick={() => setShowCategoryDrawer(!showCategoryDrawer)}
          aria-label="Browse Menu Categories"
        >
          <FiBookOpen className="browseMenuIcon" />
          <span>BROWSE MENU</span>
          <span className="browseMenuBadge">{menu.length}</span>
        </button>
      </div>

      {/* CATEGORY JUMP DRAWER / MODAL */}
      {showCategoryDrawer && (
        <div
          className="categoryDrawerOverlay"
          onClick={() => setShowCategoryDrawer(false)}
        >
          <div
            className="categoryDrawerContent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawerHeader">
              <h3>Jump to Category</h3>
              <button
                className="closeDrawerBtn"
                onClick={() => setShowCategoryDrawer(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="drawerList">
              {categories.map((cat) => {
                const count =
                  cat === "All"
                    ? menu.length
                    : menu.filter((m) => m.category === cat).length;
                return (
                  <button
                    key={cat}
                    className={`drawerItemBtn ${activeCategory === cat ? "active" : ""}`}
                    onClick={() => handleCategorySelect(cat)}
                  >
                    <span>{cat}</span>
                    <span className="drawerCount">
                      {count} <FiChevronRight />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantMenu;
