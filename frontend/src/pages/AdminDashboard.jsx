import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiShield,
  FiGrid,
  FiShoppingBag,
  FiUsers,
  FiLogOut,
  FiRefreshCw,
  FiExternalLink,
  FiSearch,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiLayers,
  FiTag,
  FiPackage,
  FiUserCheck,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { MdStorefront, MdOutlineRestaurantMenu } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import { useAdmin } from "../context/AdminContext";
import { adminApi } from "../services/api";
import "./AdminDashboard.css";

const ORDER_STATUSES = [
  "Placed",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const PAYMENT_STATUSES = ["Pending", "Paid", "Failed"];

function AdminDashboard() {
  const { adminUser, currentAdmin, adminLogout } = useAuth();
  const navigate = useNavigate();
  const {
    openAddRestaurant,
    openEditRestaurant,
    handleToggleRestaurant,
    openAddDish,
    openEditDish,
    handleToggleDishStock,
    openAddCategory,
    openEditCategory,
    openAddUser,
    openEditUser,
    openOrderDetails,
    confirmDelete,
    refreshTrigger,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    openRestaurants: 0,
    totalOrders: 0,
    totalMenuItems: 0,
    totalCategories: 0,
    activeOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRestaurantFilter, setSelectedRestaurantFilter] = useState("");
  const [selectedOrderStatusFilter, setSelectedOrderStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  // Static Sidebar Responsive & Collapse States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        dashboardRes,
        ordersRes,
        restaurantsRes,
        menuRes,
        usersRes,
        categoriesRes,
      ] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getOrders(),
        adminApi.getRestaurants(),
        adminApi.getMenuItems(),
        adminApi.getUsers(),
        adminApi.getCategories(),
      ]);

      setStats(dashboardRes.stats || {});
      setRecentOrders(dashboardRes.recentOrders || []);
      setOrders(ordersRes || []);
      setRestaurants(restaurantsRes || []);
      setMenuItems(menuRes || []);
      setUsers(usersRes || []);
      setCategories(categoriesRes || []);
    } catch (error) {
      toast.error(error.message || "Failed to load admin data");
      if (
        error.message?.toLowerCase().includes("not authorized") ||
        error.message?.toLowerCase().includes("forbidden")
      ) {
        adminLogout();
        navigate("/admin/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [adminLogout, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const updated = await adminApi.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      setRecentOrders((prev) =>
        prev.map((o) => (o._id === orderId ? updated : o))
      );
      toast.success(`Order ${updated.orderCode} updated to ${newStatus}`);
    } catch (error) {
      toast.error(error.message || "Could not update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentChange = async (orderId, newPaymentStatus) => {
    setUpdatingId(orderId);
    try {
      const updated = await adminApi.updatePaymentStatus(
        orderId,
        newPaymentStatus
      );
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      toast.success(
        `Order ${updated.orderCode} payment set to ${newPaymentStatus}`
      );
    } catch (error) {
      toast.error(error.message || "Could not update payment status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleUserRole = async (targetUser) => {
    const newRole = targetUser.role === "admin" ? "user" : "admin";
    try {
      const updated = await adminApi.updateUser(targetUser._id, {
        role: newRole,
      });
      setUsers((prev) =>
        prev.map((u) => (u._id === targetUser._id ? updated : u))
      );
      toast.success(
        `User ${updated.name} is now ${newRole === "admin" ? "Admin 👑" : "Customer 👤"}`
      );
    } catch (err) {
      toast.error(err.message || "Failed to update user role");
    }
  };

  const handleLogout = () => {
    adminLogout();
    toast.info("Signed out of Admin Portal");
    navigate("/admin/login", { replace: true });
  };

  // Filtered lists
  const filteredRestaurants = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.food || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.place || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.restaurant?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesRestaurant =
      !selectedRestaurantFilter ||
      String(item.restaurant?._id || item.restaurant) ===
        String(selectedRestaurantFilter);

    return matchesSearch && matchesRestaurant;
  });

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o.orderCode || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.deliveryAddress?.fullName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (o.deliveryAddress?.phone || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (o.orderStatus || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedOrderStatusFilter === "all" ||
      o.orderStatus === selectedOrderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.role || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = categories.filter((c) =>
    (c.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (iso) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statusClass = (status) => {
    switch (status) {
      case "Delivered":
        return "statusPill delivered";
      case "Cancelled":
        return "statusPill cancelled";
      case "Out for Delivery":
        return "statusPill shipping";
      case "Preparing":
      case "Confirmed":
        return "statusPill progress";
      default:
        return "statusPill placed";
    }
  };

  return (
    <div className="adminShell">
      {/* Static Sidebar Navigation */}
      <aside
        className={`adminSidebar ${sidebarCollapsed ? "collapsed" : ""} ${
          mobileNavOpen ? "mobileOpen" : ""
        }`}
      >
        <div className="adminSidebarBrand">
          <div className="adminSidebarBrandLeft">
            <div className="adminSidebarIcon">
              <FiShield />
            </div>
            {!sidebarCollapsed && (
              <div className="adminSidebarBrandText">
                <strong>Swiggy Admin</strong>
                <span>Control Panel</span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            className="sidebarCollapseToggleBtn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="sidebarMobileMenuBtn"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            title={mobileNavOpen ? "Close Menu" : "Open Menu"}
          >
            {mobileNavOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className={`adminNav ${mobileNavOpen ? "open" : ""}`}>
          <button
            className={`adminNavBtn ${activeTab === "overview" ? "active" : ""}`}
            title="Overview"
            onClick={() => {
              setActiveTab("overview");
              setSearchTerm("");
              setMobileNavOpen(false);
            }}
          >
            <FiGrid />
            <span>Overview</span>
          </button>

          <button
            className={`adminNavBtn ${activeTab === "restaurants" ? "active" : ""}`}
            title="Restaurants"
            onClick={() => {
              setActiveTab("restaurants");
              setSearchTerm("");
              setMobileNavOpen(false);
            }}
          >
            <MdStorefront />
            <span>Restaurants</span>
            <span className="adminNavCount">{restaurants.length}</span>
          </button>

          <button
            className={`adminNavBtn ${activeTab === "menu" ? "active" : ""}`}
            title="Menu Dishes"
            onClick={() => {
              setActiveTab("menu");
              setSearchTerm("");
              setMobileNavOpen(false);
            }}
          >
            <MdOutlineRestaurantMenu />
            <span>Menu Dishes</span>
            <span className="adminNavCount">{menuItems.length}</span>
          </button>

          <button
            className={`adminNavBtn ${activeTab === "orders" ? "active" : ""}`}
            title="Orders"
            onClick={() => {
              setActiveTab("orders");
              setSearchTerm("");
              setMobileNavOpen(false);
            }}
          >
            <FiShoppingBag />
            <span>Orders</span>
            <span className="adminNavCount">{orders.length}</span>
          </button>

          <button
            className={`adminNavBtn ${activeTab === "users" ? "active" : ""}`}
            title="Users"
            onClick={() => {
              setActiveTab("users");
              setSearchTerm("");
              setMobileNavOpen(false);
            }}
          >
            <FiUsers />
            <span>Users</span>
            <span className="adminNavCount">{users.length}</span>
          </button>

          <button
            className={`adminNavBtn ${activeTab === "categories" ? "active" : ""}`}
            title="Categories"
            onClick={() => {
              setActiveTab("categories");
              setSearchTerm("");
              setMobileNavOpen(false);
            }}
          >
            <FiLayers />
            <span>Categories</span>
            <span className="adminNavCount">{categories.length}</span>
          </button>
        </nav>

        <div className="adminSidebarFooter">
          <Link to="/" className="adminStorefrontLink" title="Storefront View">
            <FiExternalLink />
            <span>Storefront View</span>
          </Link>
          <button className="adminLogoutBtn" onClick={handleLogout} title="Logout">
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="adminMain">
        <header className="adminHeader">
          <div>
            <h1 className="adminPageHeading">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "restaurants" && "Restaurant Management"}
              {activeTab === "menu" && "Menu & Dishes Management"}
              {activeTab === "orders" && "Order Management"}
              {activeTab === "users" && "User & Admin Management"}
              {activeTab === "categories" && "Food Categories Management"}
            </h1>
            <p className="adminPageSub">
              Admin: <strong>{currentAdmin?.name || adminUser?.name || "Admin"}</strong> (
              {currentAdmin?.email || adminUser?.email})
            </p>
          </div>

          <div className="adminHeaderActions">
            {activeTab === "restaurants" && (
              <button
                type="button"
                className="adminPrimaryActionBtn"
                onClick={openAddRestaurant}
              >
                <FiPlus />
                <span>Add Restaurant</span>
              </button>
            )}

            {activeTab === "menu" && (
              <button
                type="button"
                className="adminPrimaryActionBtn"
                onClick={() => openAddDish(selectedRestaurantFilter || null)}
              >
                <FiPlus />
                <span>Add New Dish</span>
              </button>
            )}

            {activeTab === "users" && (
              <button
                type="button"
                className="adminPrimaryActionBtn"
                onClick={openAddUser}
              >
                <FiPlus />
                <span>Add New User</span>
              </button>
            )}

            {activeTab === "categories" && (
              <button
                type="button"
                className="adminPrimaryActionBtn"
                onClick={openAddCategory}
              >
                <FiPlus />
                <span>Add Category</span>
              </button>
            )}

            <button
              className="adminRefreshBtn"
              onClick={loadData}
              disabled={loading}
              title="Refresh all data"
            >
              <FiRefreshCw className={loading ? "spinIcon" : ""} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            <section className="adminStatsGrid">
              <div className="adminStatCard">
                <div className="adminStatIcon revenue">
                  <FiDollarSign />
                </div>
                <div>
                  <span className="adminStatLabel">Total Revenue</span>
                  <strong className="adminStatValue">
                    ₹{(stats.totalRevenue || 0).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <div className="adminStatCard">
                <div className="adminStatIcon orders">
                  <FiShoppingBag />
                </div>
                <div>
                  <span className="adminStatLabel">Total Orders</span>
                  <strong className="adminStatValue">
                    {stats.totalOrders || 0}
                  </strong>
                  <span className="adminStatHint">
                    <FiClock /> {stats.activeOrders || 0} active ·{" "}
                    <FiCheckCircle /> {stats.deliveredOrders || 0} delivered
                  </span>
                </div>
              </div>

              <div className="adminStatCard">
                <div className="adminStatIcon restaurants">
                  <MdStorefront />
                </div>
                <div>
                  <span className="adminStatLabel">Restaurants</span>
                  <strong className="adminStatValue">
                    {stats.totalRestaurants || 0}
                  </strong>
                  <span className="adminStatHint">
                    {stats.openRestaurants || 0} open for orders
                  </span>
                </div>
              </div>

              <div className="adminStatCard">
                <div className="adminStatIcon menuIcon">
                  <MdOutlineRestaurantMenu />
                </div>
                <div>
                  <span className="adminStatLabel">Menu Dishes</span>
                  <strong className="adminStatValue">
                    {stats.totalMenuItems || menuItems.length || 0}
                  </strong>
                </div>
              </div>

              <div className="adminStatCard">
                <div className="adminStatIcon users">
                  <FiUsers />
                </div>
                <div>
                  <span className="adminStatLabel">Registered Users</span>
                  <strong className="adminStatValue">
                    {stats.totalUsers || 0}
                  </strong>
                </div>
              </div>

              <div className="adminStatCard">
                <div className="adminStatIcon categoryIcon">
                  <FiLayers />
                </div>
                <div>
                  <span className="adminStatLabel">Categories</span>
                  <strong className="adminStatValue">
                    {stats.totalCategories || categories.length || 0}
                  </strong>
                </div>
              </div>
            </section>

            {/* Quick Actions Ribbon on Overview */}
            <div className="overviewQuickActionsBox">
              <span className="quickBoxTitle">⚡ Quick Management Actions:</span>
              <div className="quickActionsList">
                <button
                  type="button"
                  className="quickAddBtn"
                  onClick={openAddRestaurant}
                >
                  <FiPlus />
                  <span>+ Restaurant</span>
                </button>
                <button
                  type="button"
                  className="quickAddBtn"
                  onClick={() => openAddDish()}
                >
                  <FiPlus />
                  <span>+ Menu Dish</span>
                </button>
                <button
                  type="button"
                  className="quickAddBtn"
                  onClick={openAddCategory}
                >
                  <FiPlus />
                  <span>+ Category</span>
                </button>
                <button
                  type="button"
                  className="quickAddBtn"
                  onClick={openAddUser}
                >
                  <FiPlus />
                  <span>+ User Account</span>
                </button>
              </div>
            </div>

            {/* Recent Orders Panel */}
            <section className="adminPanelCard">
              <div className="adminPanelHeader">
                <h2>Recent Orders</h2>
                <button
                  className="adminTextBtn"
                  onClick={() => setActiveTab("orders")}
                >
                  View all orders →
                </button>
              </div>

              {loading ? (
                <p className="adminEmptyMsg">Loading recent orders...</p>
              ) : recentOrders.length === 0 ? (
                <p className="adminEmptyMsg">No orders found yet.</p>
              ) : (
                <div className="adminTableWrap">
                  <table className="adminTable">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td className="monoCell">{order.orderCode}</td>
                          <td>
                            {order.deliveryAddress?.fullName ||
                              order.user?.name ||
                              "Guest"}
                          </td>
                          <td>{order.items?.length || 0} items</td>
                          <td className="amountCell">₹{order.totalAmount}</td>
                          <td>
                            <span className={statusClass(order.orderStatus)}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td>
                            <div className="tableActionBtns">
                              <button
                                type="button"
                                className="actionIconBtn view"
                                title="View order details"
                                onClick={() => openOrderDetails(order)}
                              >
                                <FiEye />
                              </button>
                              <button
                                type="button"
                                className="actionIconBtn delete"
                                title="Delete order"
                                onClick={() =>
                                  confirmDelete(
                                    "order",
                                    order._id,
                                    `Order #${order.orderCode}`
                                  )
                                }
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {/* RESTAURANTS TAB */}
        {activeTab === "restaurants" && (
          <section className="adminPanelCard">
            <div className="adminPanelHeader">
              <div>
                <h2>All Restaurants ({filteredRestaurants.length})</h2>
                <span className="adminPanelSubtext">
                  Add, edit, open/close, or delete restaurants
                </span>
              </div>
              <div className="adminSearchBox">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search by restaurant name or cuisine..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {filteredRestaurants.length === 0 ? (
              <p className="adminEmptyMsg">No matching restaurants found.</p>
            ) : (
              <div className="adminTableWrap">
                <table className="adminTable">
                  <thead>
                    <tr>
                      <th>Restaurant</th>
                      <th>Location</th>
                      <th>Rating</th>
                      <th>Delivery</th>
                      <th>Cost for 2</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRestaurants.map((rest) => (
                      <tr key={rest._id}>
                        <td>
                          <div className="tableItemWithThumb">
                            {rest.image && (
                              <img
                                src={rest.image}
                                alt=""
                                className="tableThumb"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            )}
                            <div className="cellStack">
                              <strong>{rest.name}</strong>
                              <small>{rest.food}</small>
                            </div>
                          </div>
                        </td>
                        <td>{rest.place}</td>
                        <td>★ {rest.rating}</td>
                        <td>{rest.deliveryTime}</td>
                        <td>₹{rest.costForTwo || rest.price}</td>
                        <td>
                          <span
                            className={`statusPill ${
                              rest.isOpen ? "delivered" : "cancelled"
                            }`}
                          >
                            {rest.isOpen ? "Open 🟢" : "Closed 🔴"}
                          </span>
                        </td>
                        <td>
                          <div className="tableActionBtns">
                            <button
                              type="button"
                              className="actionIconBtn edit"
                              title="Edit Restaurant"
                              onClick={() => openEditRestaurant(rest)}
                            >
                              <FiEdit2 />
                            </button>

                            <button
                              type="button"
                              className="actionIconBtn manage"
                              title="Manage Dishes for this restaurant"
                              onClick={() => {
                                setSelectedRestaurantFilter(rest._id);
                                setActiveTab("menu");
                              }}
                            >
                              <MdOutlineRestaurantMenu />
                            </button>

                            <button
                              type="button"
                              className={`actionIconBtn ${rest.isOpen ? "pause" : "play"}`}
                              title={
                                rest.isOpen
                                  ? "Close restaurant"
                                  : "Open restaurant"
                              }
                              onClick={() => handleToggleRestaurant(rest._id)}
                            >
                              {rest.isOpen ? "Close" : "Open"}
                            </button>

                            <button
                              type="button"
                              className="actionIconBtn delete"
                              title="Delete Restaurant"
                              onClick={() =>
                                confirmDelete(
                                  "restaurant",
                                  rest._id,
                                  rest.name
                                )
                              }
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* MENU ITEMS / DISHES TAB */}
        {activeTab === "menu" && (
          <section className="adminPanelCard">
            <div className="adminPanelHeader">
              <div>
                <h2>Menu Items & Dishes ({filteredMenuItems.length})</h2>
                <span className="adminPanelSubtext">
                  Add, update prices, manage stock, or delete food items
                </span>
              </div>
              <div className="adminFilterRow">
                <select
                  value={selectedRestaurantFilter}
                  onChange={(e) => setSelectedRestaurantFilter(e.target.value)}
                  className="adminSelectFilter"
                >
                  <option value="">All Restaurants</option>
                  {restaurants.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>

                <div className="adminSearchBox">
                  <FiSearch />
                  <input
                    type="text"
                    placeholder="Search dishes or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {filteredMenuItems.length === 0 ? (
              <p className="adminEmptyMsg">
                No matching dishes found. Click "+ Add New Dish" above to create
                one!
              </p>
            ) : (
              <div className="adminTableWrap">
                <table className="adminTable">
                  <thead>
                    <tr>
                      <th>Dish</th>
                      <th>Restaurant</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Type</th>
                      <th>Stock Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMenuItems.map((dish) => {
                      const isOutOfStock = dish.inStock === false;
                      return (
                        <tr key={dish._id}>
                          <td>
                            <div className="tableItemWithThumb">
                              {dish.image && (
                                <img
                                  src={dish.image}
                                  alt=""
                                  className="tableThumb"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              )}
                              <div className="cellStack">
                                <strong>{dish.name}</strong>
                                {dish.isBestSeller && (
                                  <small className="bestsellerText">
                                    ⭐ Bestseller
                                  </small>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>{dish.restaurant?.name || "General"}</td>
                          <td>
                            <span className="tableTagBadge">
                              {dish.category || "Recommended"}
                            </span>
                          </td>
                          <td className="amountCell">₹{dish.price}</td>
                          <td>
                            <span
                              className={
                                dish.isVeg ? "badge-veg" : "badge-nonveg"
                              }
                            ></span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className={`stockPillBtn ${
                                isOutOfStock ? "out" : "in"
                              }`}
                              onClick={() => handleToggleDishStock(dish._id)}
                              title="Click to toggle stock"
                            >
                              <FiPackage />
                              <span>
                                {isOutOfStock ? "Out of Stock" : "In Stock"}
                              </span>
                            </button>
                          </td>
                          <td>
                            <div className="tableActionBtns">
                              <button
                                type="button"
                                className="actionIconBtn edit"
                                title="Edit Dish"
                                onClick={() => openEditDish(dish)}
                              >
                                <FiEdit2 />
                              </button>
                              <button
                                type="button"
                                className="actionIconBtn delete"
                                title="Delete Dish"
                                onClick={() =>
                                  confirmDelete("dish", dish._id, dish.name)
                                }
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <section className="adminPanelCard">
            <div className="adminPanelHeader">
              <div>
                <h2>Order Management ({filteredOrders.length})</h2>
                <span className="adminPanelSubtext">
                  Track, update status, change payment, or delete orders
                </span>
              </div>
              <div className="adminFilterRow">
                <select
                  value={selectedOrderStatusFilter}
                  onChange={(e) => setSelectedOrderStatusFilter(e.target.value)}
                  className="adminSelectFilter"
                >
                  <option value="all">All Statuses</option>
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>

                <div className="adminSearchBox">
                  <FiSearch />
                  <input
                    type="text"
                    placeholder="Search code, customer, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <p className="adminEmptyMsg">No matching orders found.</p>
            ) : (
              <div className="adminTableWrap">
                <table className="adminTable">
                  <thead>
                    <tr>
                      <th>Order Code</th>
                      <th>Customer Details</th>
                      <th>Amount</th>
                      <th>Payment Status</th>
                      <th>Order Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="monoCell">{order.orderCode}</td>
                        <td>
                          <div className="cellStack">
                            <strong>
                              {order.deliveryAddress?.fullName ||
                                order.user?.name ||
                                "Guest"}
                            </strong>
                            <small>
                              {order.deliveryAddress?.phone ||
                                order.user?.email ||
                                ""}
                            </small>
                          </div>
                        </td>
                        <td className="amountCell">₹{order.totalAmount}</td>
                        <td>
                          <select
                            className="adminTableSelect"
                            value={order.paymentStatus || "Pending"}
                            disabled={updatingId === order._id}
                            onChange={(e) =>
                              handlePaymentChange(order._id, e.target.value)
                            }
                          >
                            {PAYMENT_STATUSES.map((pst) => (
                              <option key={pst} value={pst}>
                                {pst}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            className="adminStatusSelect"
                            value={order.orderStatus}
                            disabled={updatingId === order._id}
                            onChange={(e) =>
                              handleStatusChange(order._id, e.target.value)
                            }
                          >
                            {ORDER_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <div className="tableActionBtns">
                            <button
                              type="button"
                              className="actionIconBtn view"
                              title="View full order details"
                              onClick={() => openOrderDetails(order)}
                            >
                              <FiEye />
                            </button>
                            <button
                              type="button"
                              className="actionIconBtn delete"
                              title="Delete Order"
                              onClick={() =>
                                confirmDelete(
                                  "order",
                                  order._id,
                                  `Order #${order.orderCode}`
                                )
                              }
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <section className="adminPanelCard">
            <div className="adminPanelHeader">
              <div>
                <h2>Registered Users & Admins ({filteredUsers.length})</h2>
                <span className="adminPanelSubtext">
                  Manage customer profiles, roles, and administrative access
                </span>
              </div>
              <div className="adminSearchBox">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <p className="adminEmptyMsg">No matching users found.</p>
            ) : (
              <div className="adminTableWrap">
                <table className="adminTable">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <div className="cellStack">
                            <strong>{u.name}</strong>
                            <small>{u.address?.city || "Madurai"}</small>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>{u.phone || "-"}</td>
                        <td>
                          <button
                            type="button"
                            className={`roleBadgeBtn ${
                              u.role === "admin" ? "admin" : "user"
                            }`}
                            onClick={() => handleToggleUserRole(u)}
                            title="Click to toggle User <-> Admin role"
                          >
                            <FiUserCheck />
                            <span>{u.role}</span>
                          </button>
                        </td>
                        <td>{formatDate(u.createdAt)}</td>
                        <td>
                          <div className="tableActionBtns">
                            <button
                              type="button"
                              className="actionIconBtn edit"
                              title="Edit User"
                              onClick={() => openEditUser(u)}
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              type="button"
                              className="actionIconBtn delete"
                              title="Delete User"
                              onClick={() =>
                                confirmDelete("user", u._id, `${u.name} (${u.email})`)
                              }
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === "categories" && (
          <section className="adminPanelCard">
            <div className="adminPanelHeader">
              <div>
                <h2>Food Categories ({filteredCategories.length})</h2>
                <span className="adminPanelSubtext">
                  Manage homepage categories and dish types
                </span>
              </div>
              <div className="adminSearchBox">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {filteredCategories.length === 0 ? (
              <p className="adminEmptyMsg">No matching categories found.</p>
            ) : (
              <div className="adminTableWrap">
                <table className="adminTable">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Slug</th>
                      <th>Display Order</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((cat) => (
                      <tr key={cat._id || cat.name}>
                        <td>
                          <div className="tableItemWithThumb">
                            {cat.image && (
                              <img
                                src={cat.image}
                                alt=""
                                className="tableCategoryThumb"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            )}
                            <strong>{cat.name}</strong>
                          </div>
                        </td>
                        <td>
                          <code>{cat.slug || cat.name.toLowerCase()}</code>
                        </td>
                        <td>{cat.displayOrder ?? 0}</td>
                        <td>
                          <div className="tableActionBtns">
                            <button
                              type="button"
                              className="actionIconBtn edit"
                              title="Edit Category"
                              onClick={() => openEditCategory(cat)}
                            >
                              <FiEdit2 />
                            </button>
                            {cat._id && (
                              <button
                                type="button"
                                className="actionIconBtn delete"
                                title="Delete Category"
                                onClick={() =>
                                  confirmDelete("category", cat._id, cat.name)
                                }
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
