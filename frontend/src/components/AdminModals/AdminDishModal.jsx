import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiX, FiCheck } from "react-icons/fi";
import { useAdmin } from "../../context/AdminContext";
import { adminApi, restaurantApi } from "../../services/api";
import "./AdminModals.css";

const CATEGORY_SUGGESTIONS = [
  "Recommended",
  "Biryani",
  "Starters",
  "Main Course",
  "South Indian",
  "North Indian",
  "Chinese",
  "Tandoori",
  "Breads",
  "Desserts",
  "Beverages",
  "Snacks",
];

function AdminDishModal() {
  const { dishModal, closeDishModal, triggerRefresh } = useAdmin();
  const { isOpen, dish, restaurantId } = dishModal;

  const [restaurants, setRestaurants] = useState([]);
  const [formData, setFormData] = useState({
    restaurant: "",
    name: "",
    price: 180,
    category: "Recommended",
    image: "",
    description: "Prepared fresh with authentic spices and ingredients.",
    isVeg: false,
    inStock: true,
    isBestSeller: false,
    rating: 4.5,
    ratingCount: 25,
  });

  const [submitting, setSubmitting] = useState(false);

  // Load available restaurants for selection
  useEffect(() => {
    if (isOpen) {
      restaurantApi
        .getAll({ limit: 100 })
        .then((res) => {
          const list = Array.isArray(res) ? res : res.restaurants || [];
          setRestaurants(list);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (dish) {
      setFormData({
        restaurant: dish.restaurant?._id || dish.restaurant || restaurantId || "",
        name: dish.name || "",
        price: dish.price ?? 180,
        category: dish.category || "Recommended",
        image: dish.image || "",
        description:
          dish.description ||
          "Prepared fresh with authentic spices and ingredients.",
        isVeg: Boolean(dish.isVeg),
        inStock: dish.inStock !== false,
        isBestSeller: Boolean(dish.isBestSeller),
        rating: dish.rating ?? 4.5,
        ratingCount: dish.ratingCount ?? 25,
      });
    } else {
      setFormData({
        restaurant: restaurantId || "",
        name: "",
        price: 180,
        category: "Recommended",
        image: "",
        description: "Prepared fresh with authentic spices and ingredients.",
        isVeg: false,
        inStock: true,
        isBestSeller: false,
        rating: 4.5,
        ratingCount: 25,
      });
    }
  }, [dish, restaurantId, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.image.trim()) {
      toast.warning("Please enter dish name and image URL");
      return;
    }

    if (!formData.restaurant) {
      toast.warning("Please select a restaurant for this dish");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        rating: Number(formData.rating) || 4.5,
        ratingCount: Number(formData.ratingCount) || 25,
      };

      if (dish?._id) {
        await adminApi.updateMenuItem(dish._id, payload);
        toast.success(`Dish "${payload.name}" updated successfully! 🍲`);
      } else {
        await adminApi.createMenuItem(payload);
        toast.success(`New dish "${payload.name}" added to menu! 🍽️`);
      }

      triggerRefresh();
      closeDishModal();
    } catch (err) {
      toast.error(err.message || "Failed to save dish");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="adminModalOverlay" onClick={closeDishModal}>
      <div className="adminModalContent" onClick={(e) => e.stopPropagation()}>
        <div className="adminModalHeader">
          <div>
            <h3>{dish ? "Edit Menu Item / Dish" : "Add New Dish to Menu"}</h3>
            <p className="adminModalSub">
              {dish
                ? `Editing dish details for ${dish.name}`
                : "Add a delicious food item to the restaurant's menu"}
            </p>
          </div>
          <button className="adminModalCloseBtn" onClick={closeDishModal}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="adminModalForm">
          <div className="adminFormGroup">
            <label>Select Restaurant *</label>
            <select
              name="restaurant"
              value={formData.restaurant}
              onChange={handleChange}
              required
            >
              <option value="">-- Choose Restaurant --</option>
              {restaurants.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} ({r.place})
                </option>
              ))}
            </select>
          </div>

          <div className="adminFormRow">
            <div className="adminFormGroup flex-2">
              <label>Dish Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Special Chicken Biryani"
                required
                autoFocus
              />
            </div>

            <div className="adminFormGroup flex-1">
              <label>Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="180"
                required
              />
            </div>
          </div>

          <div className="adminFormRow">
            <div className="adminFormGroup flex-1">
              <label>Dish Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                list="dish-categories"
                placeholder="Recommended, Biryani, Starters..."
              />
              <datalist id="dish-categories">
                {CATEGORY_SUGGESTIONS.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div className="adminFormGroup flex-1">
              <label>Rating (1.0 - 5.0)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="adminFormGroup">
            <label>Dish Image URL *</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/... or /images/..."
              required
            />
            {formData.image && (
              <div className="adminImgPreview">
                <img
                  src={formData.image}
                  alt="Dish preview"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <div className="adminFormGroup">
            <label>Description</label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="Freshly prepared with aromatic spices..."
            />
          </div>

          <div className="adminCheckboxRow">
            <label className="adminCheckboxLabel">
              <input
                type="checkbox"
                name="isVeg"
                checked={formData.isVeg}
                onChange={handleChange}
              />
              <span>Pure Veg Item 🟢</span>
            </label>

            <label className="adminCheckboxLabel">
              <input
                type="checkbox"
                name="inStock"
                checked={formData.inStock}
                onChange={handleChange}
              />
              <span>In Stock & Available 📦</span>
            </label>

            <label className="adminCheckboxLabel">
              <input
                type="checkbox"
                name="isBestSeller"
                checked={formData.isBestSeller}
                onChange={handleChange}
              />
              <span>Bestseller Badge ⭐</span>
            </label>
          </div>

          <div className="adminModalFooter">
            <button
              type="button"
              className="adminModalCancelBtn"
              onClick={closeDishModal}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="adminModalSubmitBtn"
              disabled={submitting}
            >
              <FiCheck />
              <span>
                {submitting
                  ? "Saving..."
                  : dish
                  ? "Update Dish"
                  : "Add Dish to Menu"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminDishModal;
