import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiShield,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiAlertCircle,
  FiLogIn,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import "./AdminLogin.css";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { adminLogin, isAdminAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // If already logged in as admin, go straight to dashboard
  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAdminAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both admin email and password.");
      return;
    }

    const res = await adminLogin(email, password);
    if (res.success) {
      toast.success(`Welcome back, ${res.data.name}!`);
      navigate("/admin/dashboard", { replace: true });
    } else {
      setErrorMsg(res.message || "Invalid admin credentials.");
    }
  };

  const fillDemoAdmin = () => {
    setEmail("admin@swiggy.com");
    setPassword("adminpassword123");
    setErrorMsg("");
  };

  return (
    <div className="adminLoginPage">
      <div className="adminLoginBackdrop" aria-hidden="true" />

      <div className="adminLoginContainer">
        <div className="adminTopBar">
          <Link to="/" className="adminBackLink">
            <FiArrowLeft />
            <span>Back to Storefront</span>
          </Link>
          <span className="adminSecurityBadge">
            <FiShield />
            <span>Restricted Area</span>
          </span>
        </div>

        <div className="adminLoginCard">
          <div className="adminBrandHeader">
            <div className="adminBrandIcon">
              <FiShield />
            </div>
            <div>
              <span className="adminBrandEyebrow">SWIGGY CONTROL PANEL</span>
              <h1 className="adminBrandTitle">Admin Login</h1>
            </div>
          </div>

          <p className="adminSubtitle">
            Sign in with your administrator credentials to manage orders,
            restaurants, and users.
          </p>

          {errorMsg && (
            <div className="adminErrorAlert" role="alert">
              <FiAlertCircle className="adminErrorIcon" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="adminLoginForm">
            <div className="adminFormGroup">
              <label htmlFor="admin-email" className="adminFormLabel">
                Admin Email
              </label>
              <div className="adminInputWrap">
                <FiMail className="adminInputIcon" />
                <input
                  id="admin-email"
                  type="email"
                  placeholder="admin@swiggy.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg("");
                  }}
                  autoComplete="username"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="adminFormGroup">
              <label htmlFor="admin-password" className="adminFormLabel">
                Password
              </label>
              <div className="adminInputWrap">
                <FiLock className="adminInputIcon" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg("");
                  }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="adminPasswordToggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="adminSubmitBtn"
              disabled={loading}
            >
              <FiLogIn />
              <span>{loading ? "VERIFYING ADMIN..." : "SIGN IN TO ADMIN"}</span>
            </button>
          </form>

          <div className="adminDemoBox">
            <div className="adminDemoInfo">
              <span className="adminDemoLabel">Default Admin Credentials</span>
              <span className="adminDemoCreds">
                admin@swiggy.com / adminpassword123
              </span>
            </div>
            <button
              type="button"
              className="adminFillBtn"
              onClick={fillDemoAdmin}
            >
              Auto-fill
            </button>
          </div>
        </div>

        <p className="adminFooterNote">
          Customer account?{" "}
          <Link to="/signin" className="adminCustomerLink">
            Go to Customer Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
