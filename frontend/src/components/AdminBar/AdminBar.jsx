import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiShield,
  FiPlus,
  FiExternalLink,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useAdmin } from "../../context/AdminContext";
import "./AdminBar.css";

function AdminBar() {
  const { isAdminAuthenticated, currentAdmin } = useAuth();
  const { openAddRestaurant, openAddDish, openAddCategory } = useAdmin();
  const [minimized, setMinimized] = useState(false);

  if (!isAdminAuthenticated) return null;

  return (
    <aside
      className={`adminControlBar ${minimized ? "minimized" : ""}`}
      aria-label="Admin Control Bar"
    >
      <div className="adminBarContainer">
        <div className="adminBarLeft">
          <div className="adminShieldBadge">
            <FiShield />
            <span>ADMIN MODE</span>
          </div>
          <span className="adminBarGreeting">
            Logged in as <strong>{currentAdmin?.name || "Admin"}</strong> — Storefront
            Edit Controls Active
          </span>
        </div>

        {!minimized && (
          <div className="adminBarActions">
            <button
              type="button"
              className="adminQuickBtn"
              onClick={openAddRestaurant}
            >
              <FiPlus />
              <span>Add Restaurant</span>
            </button>

            <button
              type="button"
              className="adminQuickBtn"
              onClick={() => openAddDish()}
            >
              <FiPlus />
              <span>Add Dish</span>
            </button>

            <button
              type="button"
              className="adminQuickBtn"
              onClick={openAddCategory}
            >
              <FiPlus />
              <span>Add Category</span>
            </button>

            <Link to="/admin/dashboard" className="adminDashboardPill">
              <span>Admin Panel</span>
              <FiExternalLink />
            </Link>
          </div>
        )}

        <button
          type="button"
          className="adminBarToggleBtn"
          onClick={() => setMinimized((prev) => !prev)}
          title={minimized ? "Expand Admin Bar" : "Minimize Admin Bar"}
        >
          {minimized ? <FiChevronDown /> : <FiChevronUp />}
        </button>
      </div>
    </aside>
  );
}

export default AdminBar;
