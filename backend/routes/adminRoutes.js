import express from "express";
import {
  getAdminDashboard,
  // Restaurants
  getAllRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  toggleRestaurantStatus,
  // Menu items
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemStock,
  // Orders
  getAllOrders,
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
  deleteOrder,
  // Users
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  // Categories
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// Dashboard
router.get("/dashboard", getAdminDashboard);

// Restaurant routes
router.get("/restaurants", getAllRestaurants);
router.post("/restaurants", createRestaurant);
router.put("/restaurants/:id", updateRestaurant);
router.delete("/restaurants/:id", deleteRestaurant);
router.patch("/restaurants/:id/toggle", toggleRestaurantStatus);

// Menu item / dish routes
router.get("/menu", getAllMenuItems);
router.post("/menu", createMenuItem);
router.put("/menu/:id", updateMenuItem);
router.delete("/menu/:id", deleteMenuItem);
router.patch("/menu/:id/toggle-stock", toggleMenuItemStock);

// Order routes
router.get("/orders", getAllOrders);
router.patch("/orders/:id/status", updateAdminOrderStatus);
router.patch("/orders/:id/payment", updateAdminPaymentStatus);
router.delete("/orders/:id", deleteOrder);

// User routes
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Category routes
router.get("/categories", getAllCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

export default router;
