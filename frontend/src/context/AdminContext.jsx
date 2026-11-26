import { createContext, useContext, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { adminApi } from "../services/api";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  // Modal states
  const [restaurantModal, setRestaurantModal] = useState({
    isOpen: false,
    restaurant: null, // null for create, object for edit
  });

  const [dishModal, setDishModal] = useState({
    isOpen: false,
    dish: null, // null for create, object for edit
    restaurantId: null,
  });

  const [categoryModal, setCategoryModal] = useState({
    isOpen: false,
    category: null,
  });

  const [userModal, setUserModal] = useState({
    isOpen: false,
    user: null,
  });

  const [orderModal, setOrderModal] = useState({
    isOpen: false,
    order: null,
  });

  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    type: "", // "restaurant" | "dish" | "user" | "category" | "order"
    id: null,
    title: "",
    onConfirm: null,
  });

  // Global counter to notify components when data changes
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Modal Open / Close helpers
  const openAddRestaurant = () => {
    setRestaurantModal({ isOpen: true, restaurant: null });
  };

  const openEditRestaurant = (restaurant) => {
    setRestaurantModal({ isOpen: true, restaurant });
  };

  const closeRestaurantModal = () => {
    setRestaurantModal({ isOpen: false, restaurant: null });
  };

  const openAddDish = (restaurantId = null) => {
    setDishModal({ isOpen: true, dish: null, restaurantId });
  };

  const openEditDish = (dish) => {
    setDishModal({
      isOpen: true,
      dish,
      restaurantId: dish.restaurant?._id || dish.restaurant || null,
    });
  };

  const closeDishModal = () => {
    setDishModal({ isOpen: false, dish: null, restaurantId: null });
  };

  const openAddCategory = () => {
    setCategoryModal({ isOpen: true, category: null });
  };

  const openEditCategory = (category) => {
    setCategoryModal({ isOpen: true, category });
  };

  const closeCategoryModal = () => {
    setCategoryModal({ isOpen: false, category: null });
  };

  const openAddUser = () => {
    setUserModal({ isOpen: true, user: null });
  };

  const openEditUser = (user) => {
    setUserModal({ isOpen: true, user });
  };

  const closeUserModal = () => {
    setUserModal({ isOpen: false, user: null });
  };

  const openOrderDetails = (order) => {
    setOrderModal({ isOpen: true, order });
  };

  const closeOrderModal = () => {
    setOrderModal({ isOpen: false, order: null });
  };

  // Delete Confirmation Helper
  const confirmDelete = (type, id, title, customAction = null) => {
    setDeleteConfirm({
      isOpen: true,
      type,
      id,
      title,
      onConfirm: customAction,
    });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({
      isOpen: false,
      type: "",
      id: null,
      title: "",
      onConfirm: null,
    });
  };

  // Direct Admin Action Handlers
  const handleToggleRestaurant = async (id) => {
    try {
      const updated = await adminApi.toggleRestaurant(id);
      toast.success(
        `${updated.name} is now ${updated.isOpen ? "OPEN 🟢" : "CLOSED 🔴"}`
      );
      triggerRefresh();
      return updated;
    } catch (err) {
      toast.error(err.message || "Failed to toggle restaurant status");
      throw err;
    }
  };

  const handleToggleDishStock = async (id) => {
    try {
      const updated = await adminApi.toggleMenuItemStock(id);
      toast.success(
        `${updated.name} is now ${updated.inStock ? "IN STOCK" : "OUT OF STOCK"}`
      );
      triggerRefresh();
      return updated;
    } catch (err) {
      toast.error(err.message || "Failed to toggle dish stock");
      throw err;
    }
  };

  const handleDeleteConfirmed = async () => {
    const { type, id, onConfirm } = deleteConfirm;
    if (!id) return;

    try {
      if (onConfirm) {
        await onConfirm(id);
      } else {
        switch (type) {
          case "restaurant":
            await adminApi.deleteRestaurant(id);
            toast.success("Restaurant deleted successfully");
            break;
          case "dish":
            await adminApi.deleteMenuItem(id);
            toast.success("Dish deleted successfully");
            break;
          case "user":
            await adminApi.deleteUser(id);
            toast.success("User deleted successfully");
            break;
          case "category":
            await adminApi.deleteCategory(id);
            toast.success("Category deleted successfully");
            break;
          case "order":
            await adminApi.deleteOrder(id);
            toast.success("Order deleted successfully");
            break;
          default:
            break;
        }
      }
      triggerRefresh();
    } catch (err) {
      toast.error(err.message || `Failed to delete ${type}`);
    } finally {
      closeDeleteConfirm();
    }
  };

  return (
    <AdminContext.Provider
      value={{
        refreshTrigger,
        triggerRefresh,
        // Restaurant
        restaurantModal,
        openAddRestaurant,
        openEditRestaurant,
        closeRestaurantModal,
        handleToggleRestaurant,
        // Dish
        dishModal,
        openAddDish,
        openEditDish,
        closeDishModal,
        handleToggleDishStock,
        // Category
        categoryModal,
        openAddCategory,
        openEditCategory,
        closeCategoryModal,
        // User
        userModal,
        openAddUser,
        openEditUser,
        closeUserModal,
        // Order
        orderModal,
        openOrderDetails,
        closeOrderModal,
        // Delete Confirmation
        deleteConfirm,
        confirmDelete,
        closeDeleteConfirm,
        handleDeleteConfirmed,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
