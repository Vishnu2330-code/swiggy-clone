import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiX, FiCheck, FiImage } from "react-icons/fi";
import { useAdmin } from "../../context/AdminContext";
import { adminApi } from "../../services/api";
import "./AdminModals.css";

function AdminRestaurantModal() {
  const { restaurantModal, closeRestaurantModal, triggerRefresh } = useAdmin();
  const { isOpen, restaurant } = restaurantModal;

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    food: "",
    cuisines: "",
    place: "Madurai",
    address: "Main Road, Madurai",
    rating: 4.2,
    deliveryTime: "25-30 mins",
    timeMinutes: 25,
    costForTwo: 300,
    price: 299,
    offer: "60% OFF up to ₹120",
    isVegOnly: false,
    isFeatured: false,
    isOpen: true,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || "",
        image: restaurant.image || "",
        food: restaurant.food || "",
        cuisines: Array.isArray(restaurant.cuisines)
          ? restaurant.cuisines.join(", ")
          : restaurant.cuisines || "",
        place: restaurant.place || "Madurai",
        address: restaurant.address || "Main Road, Madurai",
        rating: restaurant.rating ?? 4.2,
        deliveryTime: restaurant.deliveryTime || "25-30 mins",
        timeMinutes: restaurant.timeMinutes ?? 25,
        costForTwo: restaurant.costForTwo ?? 300,
        price: restaurant.price ?? 299,
        offer: restaurant.offer || "",
        isVegOnly: Boolean(restaurant.isVegOnly),
        isFeatured: Boolean(restaurant.isFeatured),
        isOpen: restaurant.isOpen !== false,
      });
    } else {
      setFormData({
        name: "",
        image: "",
        food: "",
        cuisines: "South Indian, North Indian, Biryani",
        place: "Madurai",
        address: "Main Road, Madurai",
        rating: 4.2,
        deliveryTime: "25-30 mins",
        timeMinutes: 25,
        costForTwo: 300,
        price: 299,
        offer: "50% OFF up to ₹100",
        isVegOnly: false,
        isFeatured: false,
        isOpen: true,
      });
    }
  }, [restaurant, isOpen]);

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
      toast.warning("Please provide restaurant name and image URL");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        rating: Number(formData.rating) || 4.0,
        timeMinutes: Number(formData.timeMinutes) || 25,
        costForTwo: Number(formData.costForTwo) || 300,
        price: Number(formData.price) || 299,
        cuisines: formData.cuisines
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        food:
          formData.food.trim() ||
          formData.cuisines
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean)
            .join(", "),
      };

      if (restaurant?._id) {
        await adminApi.updateRestaurant(restaurant._id, payload);
        toast.success(`Restaurant "${payload.name}" updated successfully! 🎉`);
      } else {
        await adminApi.createRestaurant(payload);
        toast.success(`New restaurant "${payload.name}" created! 🚀`);
      }

      triggerRefresh();
      closeRestaurantModal();
    } catch (err) {
      toast.error(err.message || "Failed to save restaurant");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="adminModalOverlay" onClick={closeRestaurantModal}>
      <div className="adminModalContent" onClick={(e) => e.stopPropagation()}>
        <div className="adminModalHeader">
          <div>
            <h3>{restaurant ? "Edit Restaurant" : "Add New Restaurant"}</h3>
            <p className="adminModalSub">
              {restaurant
                ? `Update details for ${restaurant.name}`
                : "Create a new restaurant listing on Swiggy"}
            </p>
          </div>
          <button className="adminModalCloseBtn" onClick={closeRestaurantModal}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="adminModalForm">
          <div className="adminFormRow">
            <div className="adminFormGroup flex-2">
              <label>Restaurant Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Madurai Thalappakatti Biryani"
                required
                autoFocus
              />
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
            <label>Image URL *</label>
            <div className="adminImgInputWrap">
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/... or /images/..."
                required
              />
            </div>
            {formData.image && (
              <div className="adminImgPreview">
                <img
                  src={formData.image}
                  alt="Preview"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <div className="adminFormRow">
            <div className="adminFormGroup flex-1">
              <label>Cuisines (comma separated)</label>
              <input
                type="text"
                name="cuisines"
                value={formData.cuisines}
                onChange={handleChange}
                placeholder="Biryani, South Indian, Chettinad"
              />
            </div>

            <div className="adminFormGroup flex-1">
              <label>Food Summary Line</label>
              <input
                type="text"
                name="food"
                value={formData.food}
                onChange={handleChange}
                placeholder="e.g. Biryanis, Kebabs, Desserts"
              />
            </div>
          </div>

          <div className="adminFormRow">
            <div className="adminFormGroup flex-1">
              <label>City / Area</label>
              <input
                type="text"
                name="place"
                value={formData.place}
                onChange={handleChange}
                placeholder="e.g. KK Nagar, Madurai"
              />
            </div>

            <div className="adminFormGroup flex-1">
              <label>Street Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. 12, South Veli St"
              />
            </div>
          </div>

          <div className="adminFormRow">
            <div className="adminFormGroup flex-1">
              <label>Delivery Time Label</label>
              <input
                type="text"
                name="deliveryTime"
                value={formData.deliveryTime}
                onChange={handleChange}
                placeholder="25-30 mins"
              />
            </div>

            <div className="adminFormGroup flex-1">
              <label>Minutes (approx)</label>
              <input
                type="number"
                name="timeMinutes"
                value={formData.timeMinutes}
                onChange={handleChange}
                placeholder="25"
              />
            </div>

            <div className="adminFormGroup flex-1">
              <label>Cost for Two (₹)</label>
              <input
                type="number"
                name="costForTwo"
                value={formData.costForTwo}
                onChange={handleChange}
                placeholder="300"
              />
            </div>
          </div>

          <div className="adminFormGroup">
            <label>Promo Offer Badge</label>
            <input
              type="text"
              name="offer"
              value={formData.offer}
              onChange={handleChange}
              placeholder="e.g. 60% OFF up to ₹120 or FLAT ₹150 OFF"
            />
          </div>

          <div className="adminCheckboxRow">
            <label className="adminCheckboxLabel">
              <input
                type="checkbox"
                name="isVegOnly"
                checked={formData.isVegOnly}
                onChange={handleChange}
              />
              <span>Pure Veg Restaurant 🌱</span>
            </label>

            <label className="adminCheckboxLabel">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
              />
              <span>Featured Restaurant ⭐</span>
            </label>

            <label className="adminCheckboxLabel">
              <input
                type="checkbox"
                name="isOpen"
                checked={formData.isOpen}
                onChange={handleChange}
              />
              <span>Currently Open 🟢</span>
            </label>
          </div>

          <div className="adminModalFooter">
            <button
              type="button"
              className="adminModalCancelBtn"
              onClick={closeRestaurantModal}
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
                  : restaurant
                  ? "Update Restaurant"
                  : "Create Restaurant"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminRestaurantModal;
