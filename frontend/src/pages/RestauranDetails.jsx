import { useState, useEffect, useCallback } from "react";
import "./RestaurantDetails.css";
import { Link, useParams } from "react-router-dom";
import { restaurantApi } from "../services/api";
import staticRestaurants from "../data/restaurantData";
import staticMenu from "../data/menuData";
import { FaStar } from "react-icons/fa";
import {
  FiClock,
  FiSearch,
} from "react-icons/fi";
import { useScrollReveal } from "../hooks/useScrollReveal";

function RestaurantDetails({ addToCart }) {
  const { id } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVegFilter, setIsVegFilter] = useState(false);
  const [dishSearch, setDishSearch] = useState("");

  useScrollReveal([menu, filteredMenu, dishSearch]);

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
        console.warn("Using local restaurant fallback:", err.message);
        const localRest = staticRestaurants.find(
          (r) =>
            String(r.id) === String(id) ||
            r.name.toLowerCase().includes(id.toLowerCase())
        );
        setRestaurant(localRest || staticRestaurants[0]);
        const localMenu = staticMenu.filter(
          (m) => String(m.restaurantId) === String(id)
        );
        setMenu(localMenu.length > 0 ? localMenu : staticMenu.slice(0, 6));
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="detailsLoadingContainer">
        <div className="spinner"></div>
        <p>Loading restaurant menu...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="detailsNotFound">
        <h2>Restaurant Not Found</h2>
        <Link to="/" className="backHomeBtn">
          Back to Restaurants
        </Link>
      </div>
    );
  }

  const isClosed = restaurant.isOpen === false;

  // Filter menu items
  const filteredMenu = menu.filter((dish) => {
    if (isVegFilter && !dish.isVeg) return false;
    if (dishSearch && !dish.name.toLowerCase().includes(dishSearch.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="restaurantDetailsPage">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <span>Madurai</span> / <strong>{restaurant.name}</strong>
      </div>

      {/* Hero Header Card */}
      <div className={`restHeroCard ${isClosed ? "heroClosed" : ""}`}>
        <div className="restHeroInfo">
          <div className="titleWithStatus">
            <h1 className="restTitle">{restaurant.name}</h1>
            {isClosed && <span className="closedStatusPill">CLOSED NOW</span>}
          </div>

          <p className="restCuisines">
            {Array.isArray(restaurant.cuisines)
              ? restaurant.cuisines.join(", ")
              : restaurant.food}
          </p>
          <p className="restAddress">
            📍 {restaurant.address || `${restaurant.place}, Madurai`}
          </p>

          <div className="restMetaRow">
            <div className="metaItem">
              <span className="ratingPill">
                <FaStar /> {restaurant.rating}
              </span>
              <small>100+ ratings</small>
            </div>

            <div className="metaDivider"></div>

            <div className="metaItem">
              <span className="metaVal">
                <FiClock /> {restaurant.deliveryTime || "25-30 mins"}
              </span>
              <small>Delivery Time</small>
            </div>

            <div className="metaDivider"></div>

            <div className="metaItem">
              <span className="metaVal">
                ₹{restaurant.costForTwo || restaurant.price}
              </span>
              <small>Cost for two</small>
            </div>
          </div>

          {restaurant.offer && !isClosed && (
            <div className="heroOffer">
              🎉 <span>{restaurant.offer}</span>
            </div>
          )}
        </div>

        <div className="restHeroImage">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            onError={(e) => {
              e.target.src = "/restaurants/pizza.jpg";
            }}
          />
        </div>
      </div>

      {/* Menu Filter Controls */}
      <div className="menuControls">
        <div className="menuSearchBox">
          <FiSearch className="menuSearchIcon" />
          <input
            type="text"
            placeholder={`Search dishes in ${restaurant.name}...`}
            value={dishSearch}
            onChange={(e) => setDishSearch(e.target.value)}
          />
          {dishSearch && (
            <button onClick={() => setDishSearch("")} className="clearDishBtn">
              ✕
            </button>
          )}
        </div>

        <button
          className={`vegToggleBtn ${isVegFilter ? "active" : ""}`}
          onClick={() => setIsVegFilter(!isVegFilter)}
        >
          <span className="badge-veg"></span> Pure Veg
        </button>

        <Link to={`/restaurant/${restaurant._id || restaurant.id}/menu`}>
          <button className="fullMenuLinkBtn">View Full Screen Menu</button>
        </Link>
      </div>

      {/* Menu Items List */}
      <div className="menuSection">
        <div className="menuHeader">
          <div>
            <h2>Menu ({filteredMenu.length} items)</h2>
            <p className="menuHeaderSub">Freshly prepared authentic delicacies</p>
          </div>
        </div>

        <div className="dishesList">
          {filteredMenu.length > 0 ? (
            filteredMenu.map((item, idx) => {
              const isItemOutOfStock = item.inStock === false;
              return (
                <div
                  className={`dishCard ${isItemOutOfStock ? "dishOutOfStock" : ""} reveal-on-scroll`}
                  data-reveal="fade-up"
                  data-reveal-delay={(idx % 4) * 60}
                  key={item._id || item.id}
                >
                  <div className="dishInfo">
                    <div className="dishBadgeRow">
                      <span className={item.isVeg ? "badge-veg" : "badge-nonveg"}></span>
                      {item.isBestSeller && (
                        <span className="bestsellerBadge">⭐ Bestseller</span>
                      )}
                      {isItemOutOfStock && (
                        <span className="outOfStockBadge">Out of Stock</span>
                      )}
                    </div>

                    <h3 className="dishName">{item.name}</h3>

                    <div className="dishPrice">₹{item.price}</div>

                    <p className="dishDesc">
                      {item.description ||
                        "Prepared fresh with authentic ingredients and delicious spices."}
                    </p>
                  </div>

                  <div className="dishImageContainer">
                    <img
                      src={item.image || "/restaurants/pizza.jpg"}
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = "/restaurants/pizza.jpg";
                      }}
                    />
                    <button
                      className="dishAddBtn"
                      disabled={isItemOutOfStock || isClosed}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                    >
                      {isItemOutOfStock ? "UNAVAILABLE" : "ADD +"}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="emptyMenu">
              <p>No dishes match your search or filter.</p>
              <button
                onClick={() => {
                  setDishSearch("");
                  setIsVegFilter(false);
                }}
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RestaurantDetails;
