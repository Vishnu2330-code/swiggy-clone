import "./RestaurantCard.css";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function RestaurantCard({ item, favorites = [], toggleFavorite, revealDelay = 50 }) {
  const navigate = useNavigate();

  const itemId = item._id || item.id;
  const isFavorite = favorites.includes(itemId);

  const handleCardClick = () => {
    navigate(`/restaurant/${itemId}`);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (toggleFavorite) {
      toggleFavorite(itemId);
    }
  };

  const isClosed = item.isOpen === false;

  return (
    <div
      className={`restaurantCard ${isClosed ? "restaurantClosed" : ""} reveal-on-scroll`}
      data-reveal="scale-up"
      data-reveal-delay={revealDelay}
      onClick={handleCardClick}
    >
      <div className="imageContainer">
        <img
          src={item.image}
          alt={item.name}
          onError={(e) => {
            e.target.src = "/restaurants/pizza.jpg";
          }}
        />

        <div className="imageOverlay"></div>

        {isClosed && (
          <div className="closedBadgeOverlay">
            <span>CLOSED FOR ORDERS</span>
          </div>
        )}

        {item.offer && !isClosed && <div className="offerBadge">{item.offer}</div>}

        <button
          className={`favoriteBtn ${isFavorite ? "active" : ""}`}
          onClick={handleFavoriteClick}
          aria-label="Toggle Favorite"
        >
          {isFavorite ? (
            <FaHeart className="heartIcon filled" />
          ) : (
            <FaRegHeart className="heartIcon" />
          )}
        </button>
      </div>

      <div className="cardInfo">
        <h3 className="restaurantName">{item.name}</h3>

        <div className="ratingTimeRow">
          <span className="ratingBadge">
            <FaStar className="starIcon" /> {item.rating}
          </span>
          <span className="dotSeparator">•</span>
          <span className="deliveryTime">{item.deliveryTime || `${item.timeMinutes || 25} mins`}</span>
        </div>

        <p className="cuisines">
          {Array.isArray(item.cuisines) ? item.cuisines.join(", ") : item.food}
        </p>

        <div className="bottomRow">
          <span className="place">{item.place}</span>
          <span className="price">₹{item.costForTwo || item.price} for two</span>
        </div>
      </div>
    </div>
  );
}

export default RestaurantCard;
