import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";
import MenuItem from "../models/MenuItem.js";
import Category from "../models/Category.js";
import Order from "../models/Order.js";

const VALID_ORDER_STATUSES = [
  "Placed",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const VALID_PAYMENT_STATUSES = ["Pending", "Paid", "Failed"];

// @desc    Get admin dashboard stats & summary
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalRestaurants,
      openRestaurants,
      totalOrders,
      totalMenuItems,
      totalCategories,
      recentOrders,
      allOrders,
    ] = await Promise.all([
      User.countDocuments(),
      Restaurant.countDocuments(),
      Restaurant.countDocuments({ isOpen: true }),
      Order.countDocuments(),
      MenuItem.countDocuments(),
      Category.countDocuments(),
      Order.find()
        .populate("user", "name email phone")
        .sort({ createdAt: -1 })
        .limit(8),
      Order.find().select("totalAmount orderStatus"),
    ]);

    const totalRevenue = allOrders
      .filter((o) => o.orderStatus !== "Cancelled")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const activeOrders = allOrders.filter(
      (o) => !["Delivered", "Cancelled"].includes(o.orderStatus)
    ).length;

    const deliveredOrders = allOrders.filter(
      (o) => o.orderStatus === "Delivered"
    ).length;

    res.json({
      stats: {
        totalUsers,
        totalRestaurants,
        openRestaurants,
        totalOrders,
        totalMenuItems,
        totalCategories,
        activeOrders,
        deliveredOrders,
        totalRevenue,
      },
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// RESTAURANT CRUD
// ==========================================

// @desc    Get all restaurants
// @route   GET /api/admin/restaurants
// @access  Private/Admin
export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new restaurant
// @route   POST /api/admin/restaurants
// @access  Private/Admin
export const createRestaurant = async (req, res) => {
  try {
    const {
      name,
      image,
      rating = 4.2,
      deliveryTime = "25-30 mins",
      timeMinutes = 25,
      cuisines,
      food,
      place = "Madurai",
      address = "Main Road, Madurai",
      offer = "",
      costForTwo = 300,
      price = 299,
      isVegOnly = false,
      isFeatured = false,
      isOpen = true,
    } = req.body;

    if (!name || !image) {
      return res.status(400).json({ message: "Restaurant name and image URL are required" });
    }

    const cuisinesList = Array.isArray(cuisines)
      ? cuisines
      : typeof cuisines === "string"
      ? cuisines.split(",").map((c) => c.trim()).filter(Boolean)
      : ["North Indian", "South Indian"];

    const foodSummary = food || cuisinesList.join(", ");

    const restaurant = await Restaurant.create({
      name: name.trim(),
      image: image.trim(),
      rating: Number(rating) || 4.2,
      deliveryTime,
      timeMinutes: Number(timeMinutes) || 25,
      cuisines: cuisinesList,
      food: foodSummary,
      place: place.trim(),
      address: address.trim(),
      offer: offer ? offer.trim() : "",
      costForTwo: Number(costForTwo) || 300,
      price: Number(price) || 299,
      isVegOnly: Boolean(isVegOnly),
      isFeatured: Boolean(isFeatured),
      isOpen: Boolean(isOpen),
    });

    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update restaurant
// @route   PUT /api/admin/restaurants/:id
// @access  Private/Admin
export const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const {
      name,
      image,
      rating,
      deliveryTime,
      timeMinutes,
      cuisines,
      food,
      place,
      address,
      offer,
      costForTwo,
      price,
      isVegOnly,
      isFeatured,
      isOpen,
    } = req.body;

    if (name !== undefined) restaurant.name = name.trim();
    if (image !== undefined) restaurant.image = image.trim();
    if (rating !== undefined) restaurant.rating = Number(rating);
    if (deliveryTime !== undefined) restaurant.deliveryTime = deliveryTime;
    if (timeMinutes !== undefined) restaurant.timeMinutes = Number(timeMinutes);
    if (cuisines !== undefined) {
      restaurant.cuisines = Array.isArray(cuisines)
        ? cuisines
        : typeof cuisines === "string"
        ? cuisines.split(",").map((c) => c.trim()).filter(Boolean)
        : restaurant.cuisines;
    }
    if (food !== undefined) restaurant.food = food;
    if (place !== undefined) restaurant.place = place;
    if (address !== undefined) restaurant.address = address;
    if (offer !== undefined) restaurant.offer = offer;
    if (costForTwo !== undefined) restaurant.costForTwo = Number(costForTwo);
    if (price !== undefined) restaurant.price = Number(price);
    if (isVegOnly !== undefined) restaurant.isVegOnly = Boolean(isVegOnly);
    if (isFeatured !== undefined) restaurant.isFeatured = Boolean(isFeatured);
    if (isOpen !== undefined) restaurant.isOpen = Boolean(isOpen);

    const updated = await restaurant.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete restaurant & associated menu items
// @route   DELETE /api/admin/restaurants/:id
// @access  Private/Admin
export const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    await Restaurant.findByIdAndDelete(req.params.id);
    await MenuItem.deleteMany({ restaurant: req.params.id });

    res.json({ success: true, message: `Restaurant ${restaurant.name} and its menu items deleted` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle restaurant open/closed status
// @route   PATCH /api/admin/restaurants/:id/toggle
// @access  Private/Admin
export const toggleRestaurantStatus = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    restaurant.isOpen = !restaurant.isOpen;
    const updated = await restaurant.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// MENU ITEM / DISH CRUD
// ==========================================

// @desc    Get all menu items (optionally filtered by restaurant)
// @route   GET /api/admin/menu
// @access  Private/Admin
export const getAllMenuItems = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) {
      filter.restaurant = req.query.restaurantId;
    }
    const items = await MenuItem.find(filter)
      .populate("restaurant", "name place image isOpen")
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create menu item / dish
// @route   POST /api/admin/menu
// @access  Private/Admin
export const createMenuItem = async (req, res) => {
  try {
    const {
      restaurant,
      name,
      price,
      image,
      description = "Prepared fresh with top-quality ingredients.",
      isVeg = false,
      category = "Recommended",
      rating = 4.5,
      ratingCount = 25,
      inStock = true,
      isBestSeller = false,
    } = req.body;

    if (!restaurant || !name || price === undefined || !image) {
      return res.status(400).json({
        message: "Restaurant ID, dish name, price, and image are required",
      });
    }

    const restExists = await Restaurant.findById(restaurant);
    if (!restExists) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const menuItem = await MenuItem.create({
      restaurant,
      name: name.trim(),
      price: Number(price),
      image: image.trim(),
      description: description ? description.trim() : "",
      isVeg: Boolean(isVeg),
      category: category ? category.trim() : "Recommended",
      rating: Number(rating) || 4.5,
      ratingCount: Number(ratingCount) || 25,
      inStock: Boolean(inStock),
      isBestSeller: Boolean(isBestSeller),
    });

    await menuItem.populate("restaurant", "name place image");
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update menu item
// @route   PUT /api/admin/menu/:id
// @access  Private/Admin
export const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    const {
      name,
      price,
      image,
      description,
      isVeg,
      category,
      rating,
      ratingCount,
      inStock,
      isBestSeller,
      restaurant,
    } = req.body;

    if (name !== undefined) item.name = name.trim();
    if (price !== undefined) item.price = Number(price);
    if (image !== undefined) item.image = image.trim();
    if (description !== undefined) item.description = description.trim();
    if (isVeg !== undefined) item.isVeg = Boolean(isVeg);
    if (category !== undefined) item.category = category.trim();
    if (rating !== undefined) item.rating = Number(rating);
    if (ratingCount !== undefined) item.ratingCount = Number(ratingCount);
    if (inStock !== undefined) item.inStock = Boolean(inStock);
    if (isBestSeller !== undefined) item.isBestSeller = Boolean(isBestSeller);
    if (restaurant !== undefined) item.restaurant = restaurant;

    const updated = await item.save();
    await updated.populate("restaurant", "name place image");
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/admin/menu/:id
// @access  Private/Admin
export const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: `Dish ${item.name} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle inStock status for dish
// @route   PATCH /api/admin/menu/:id/toggle-stock
// @access  Private/Admin
export const toggleMenuItemStock = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    item.inStock = !item.inStock;
    const updated = await item.save();
    await updated.populate("restaurant", "name place image");
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// ORDER CRUD & CONTROLS
// ==========================================

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status as admin
// @route   PATCH /api/admin/orders/:id/status
// @access  Private/Admin
export const updateAdminOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!VALID_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${VALID_ORDER_STATUSES.join(", ")}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = status;
    if (status === "Delivered") {
      order.estimatedDeliveryMinutes = 0;
      order.paymentStatus = "Paid";
    }

    const updatedOrder = await order.save();
    await updatedOrder.populate("user", "name email phone");
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order payment status as admin
// @route   PATCH /api/admin/orders/:id/payment
// @access  Private/Admin
export const updateAdminPaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (!VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      return res.status(400).json({
        message: `Invalid payment status. Allowed: ${VALID_PAYMENT_STATUSES.join(", ")}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.paymentStatus = paymentStatus;
    const updatedOrder = await order.save();
    await updatedOrder.populate("user", "name email phone");
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete order
// @route   DELETE /api/admin/orders/:id
// @access  Private/Admin
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: `Order ${order.orderCode} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// USER CRUD & CONTROLS
// ==========================================

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role = "user", address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: password.trim(),
      phone: (phone || "").trim(),
      role: role === "admin" ? "admin" : "user",
      address: address || { street: "", city: "Madurai", pincode: "" },
    });

    const sanitized = await User.findById(user._id).select("-password");
    res.status(201).json(sanitized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email, phone, role, address, password } = req.body;

    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail !== user.email) {
        const emailTaken = await User.findOne({ email: cleanEmail });
        if (emailTaken) {
          return res.status(400).json({ message: "This email is already in use by another account" });
        }
        user.email = cleanEmail;
      }
    }
    if (phone !== undefined) user.phone = phone.trim();
    if (role !== undefined) user.role = role === "admin" ? "admin" : "user";
    if (address !== undefined) {
      user.address = { ...user.address, ...address };
    }
    if (password && password.trim().length >= 3) {
      user.password = password.trim();
    }

    await user.save();
    const updated = await User.findById(user._id).select("-password");
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "You cannot delete your own logged-in admin account" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: `User ${user.name} (${user.email}) deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// CATEGORY CRUD
// ==========================================

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/Admin
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name, image, slug, displayOrder = 0 } = req.body;

    if (!name || !image) {
      return res.status(400).json({ message: "Category name and image URL are required" });
    }

    const autoSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const exists = await Category.findOne({ $or: [{ name: name.trim() }, { slug: autoSlug }] });
    if (exists) {
      return res.status(400).json({ message: "Category with this name or slug already exists" });
    }

    const category = await Category.create({
      name: name.trim(),
      image: image.trim(),
      slug: autoSlug,
      displayOrder: Number(displayOrder) || 0,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const { name, image, slug, displayOrder } = req.body;

    if (name !== undefined) category.name = name.trim();
    if (image !== undefined) category.image = image.trim();
    if (slug !== undefined) category.slug = slug.trim().toLowerCase();
    if (displayOrder !== undefined) category.displayOrder = Number(displayOrder);

    const updated = await category.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: `Category ${category.name} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
