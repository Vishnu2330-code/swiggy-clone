import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import LoginDrawer from "../LoginDrawer/LoginDrawer";
import "./Navbar.css";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useScrollProgress } from "../../hooks/useScrollProgress";

import {
  FiSearch,
  FiHelpCircle,
  FiShoppingCart,
  FiUser,
  FiUserPlus,
  FiPackage,
  FiLogOut,
  FiMenu,
  FiX,
  FiShield,
} from "react-icons/fi";
import { RiDiscountPercentLine } from "react-icons/ri";
import { IoLocationOutline } from "react-icons/io5";
import { MdKeyboardArrowDown } from "react-icons/md";
import { BsBriefcase } from "react-icons/bs";

function Navbar({ cart = [] }) {
  const { user, logout, isLoginDrawerOpen, closeLoginDrawer } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowUserDropdown(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const totalCartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const { isScrolled } = useScrollProgress();

  return (
    <header className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/" className="logo-link">
            <img
              src="/images/logo.png"
              alt="Swiggy"
              className="logo"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <span className="logo-text">SWIGGY</span>
          </Link>

          <div className="location">
            <IoLocationOutline className="location-icon" />
            <span className="location-title">Madurai</span>
            <span className="location-subtitle">Tamil Nadu, India</span>
            <MdKeyboardArrowDown className="arrow" />
          </div>
        </div>

        {/* Desktop & Laptop Nav */}
        <nav className="nav-right">
          <Link className="navItem corporateNavItem" to="/">
            <BsBriefcase className="navIcon" />
            <span>Swiggy Corporate</span>
          </Link>

          <Link className="navItem" to="/search">
            <FiSearch className="navIcon" />
            <span>Search</span>
          </Link>

          <Link className="navItem" to="/offers">
            <RiDiscountPercentLine className="navIcon" />
            <span>Offers</span>
            <span className="navBadge">NEW</span>
          </Link>

          <Link className="navItem" to="/help">
            <FiHelpCircle className="navIcon" />
            <span>Help</span>
          </Link>

          {/* User Section */}
          {user ? (
            <div
              className="navItem userNavItem"
              onMouseEnter={() => setShowUserDropdown(true)}
              onMouseLeave={() => setShowUserDropdown(false)}
              onClick={() => setShowUserDropdown((prev) => !prev)}
            >
              <div className="userBadge">
                <FiUser className="navIcon" />
                <span className="userName">{user.name.split(" ")[0]}</span>
                <MdKeyboardArrowDown />
              </div>

              {showUserDropdown && (
                <div className="userDropdownMenu">
                  <div className="dropdownHeader">
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </div>
                  <hr />
                  <Link
                    to="/orders"
                    className="dropdownItem"
                    onClick={() => setShowUserDropdown(false)}
                  >
                    <FiPackage />
                    <span>My Orders</span>
                  </Link>
                  <button className="dropdownItem logoutItem" onClick={handleLogout}>
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="authNavGroup">
              <Link to="/signin" className="navItem signInNavItem" title="Sign In">
                <FiUser className="navIcon" />
                <span>Sign In</span>
              </Link>
              <Link to="/signup" className="navItem signUpNavItem" title="Sign Up / Register">
                <FiUserPlus className="navIcon" />
                <span>Sign Up</span>
              </Link>
            </div>
          )}

          {/* Cart - Only visible when user is signed in AND has added items */}
          {user && totalCartCount > 0 && (
            <Link className="navItem cartIcon activeCartNav" to="/cart" title="View your cart">
              <div className="cartIconWrapper">
                <FiShoppingCart className="navIcon" />
                <span className="cartCount">{totalCartCount}</span>
              </div>
              <span>Cart</span>
            </Link>
          )}

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="themeBtn"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </nav>

        {/* Mobile / Tablet Quick Actions */}
        <div className="mobileQuickActions">
          <Link to="/search" className="mobileIconBtn" aria-label="Search">
            <FiSearch />
          </Link>

          {user && totalCartCount > 0 && (
            <Link to="/cart" className="mobileIconBtn mobileCartBtn" aria-label="Cart">
              <FiShoppingCart />
              <span className="mobileCartBadge">{totalCartCount}</span>
            </Link>
          )}

          <button
            onClick={toggleTheme}
            className="mobileIconBtn"
            aria-label="Toggle theme"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          <button
            type="button"
            className="mobileMenuToggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Slide-Down Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobileNavDrawer">
          <div className="mobileLocationBar">
            <IoLocationOutline className="location-icon" />
            <span>
              <strong>Madurai</strong> · Tamil Nadu, India
            </span>
          </div>

          <div className="mobileNavLinks">
            <Link to="/search" className="mobileNavItem">
              <FiSearch />
              <span>Search Restaurants & Dishes</span>
            </Link>
            <Link to="/offers" className="mobileNavItem">
              <RiDiscountPercentLine />
              <span>Offers</span>
              <span className="navBadge">NEW</span>
            </Link>
            <Link to="/help" className="mobileNavItem">
              <FiHelpCircle />
              <span>Help & Support</span>
            </Link>
            <Link to="/admin/login" className="mobileNavItem">
              <FiShield />
              <span>Admin Portal</span>
            </Link>
          </div>

          <div className="mobileNavDivider" />

          {user ? (
            <div className="mobileUserSection">
              <div className="mobileUserInfo">
                <FiUser className="mobileUserAvatarIcon" />
                <div>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </div>
              </div>
              <div className="mobileUserActions">
                <Link to="/orders" className="mobileActionBtn secondary">
                  <FiPackage />
                  <span>My Orders</span>
                </Link>
                <button className="mobileActionBtn danger" onClick={handleLogout}>
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mobileAuthButtons">
              <Link to="/signin" className="mobileActionBtn secondary">
                <FiUser />
                <span>Sign In</span>
              </Link>
              <Link to="/signup" className="mobileActionBtn primary">
                <FiUserPlus />
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      )}

      <LoginDrawer isOpen={isLoginDrawerOpen} closeDrawer={closeLoginDrawer} />
    </header>
  );
}

export default Navbar;
