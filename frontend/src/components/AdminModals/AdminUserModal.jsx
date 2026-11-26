import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiX, FiCheck } from "react-icons/fi";
import { useAdmin } from "../../context/AdminContext";
import { adminApi } from "../../services/api";
import "./AdminModals.css";

function AdminUserModal() {
  const { userModal, closeUserModal, triggerRefresh } = useAdmin();
  const { isOpen, user } = userModal;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
    street: "",
    city: "Madurai",
    pincode: "",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        phone: user.phone || "",
        role: user.role || "user",
        street: user.address?.street || "",
        city: user.address?.city || "Madurai",
        pincode: user.address?.pincode || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "user",
        street: "",
        city: "Madurai",
        pincode: "625001",
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.warning("Name and email are required");
      return;
    }

    if (!user && !formData.password.trim()) {
      toast.warning("Password is required for new users");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        role: formData.role,
        address: {
          street: formData.street.trim(),
          city: formData.city.trim() || "Madurai",
          pincode: formData.pincode.trim(),
        },
      };

      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      if (user?._id) {
        await adminApi.updateUser(user._id, payload);
        toast.success(`User "${payload.name}" updated successfully! 👤`);
      } else {
        await adminApi.createUser(payload);
        toast.success(`User "${payload.name}" registered! 🚀`);
      }

      triggerRefresh();
      closeUserModal();
    } catch (err) {
      toast.error(err.message || "Failed to save user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="adminModalOverlay" onClick={closeUserModal}>
      <div className="adminModalContent smallModal" onClick={(e) => e.stopPropagation()}>
        <div className="adminModalHeader">
          <div>
            <h3>{user ? "Edit User Account" : "Add New User / Admin"}</h3>
            <p className="adminModalSub">
              {user
                ? `Update profile and permissions for ${user.name}`
                : "Register a customer or administrator in MongoDB"}
            </p>
          </div>
          <button className="adminModalCloseBtn" onClick={closeUserModal}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="adminModalForm">
          <div className="adminFormRow">
            <div className="adminFormGroup flex-2">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Anand Kumar"
                required
                autoFocus
              />
            </div>

            <div className="adminFormGroup flex-1">
              <label>Account Role *</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="user">User (Customer)</option>
                <option value="admin">Administrator 👑</option>
              </select>
            </div>
          </div>

          <div className="adminFormRow">
            <div className="adminFormGroup flex-1">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@example.com"
                required
              />
            </div>

            <div className="adminFormGroup flex-1">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile"
              />
            </div>
          </div>

          <div className="adminFormGroup">
            <label>
              {user ? "New Password (leave empty to keep existing)" : "Password *"}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={user ? "••••••••" : "Minimum 3 characters"}
              required={!user}
            />
          </div>

          <div className="adminFormRow">
            <div className="adminFormGroup flex-2">
              <label>Street Address</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Door / Flat / Street"
              />
            </div>

            <div className="adminFormGroup flex-1">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Madurai"
              />
            </div>

            <div className="adminFormGroup flex-1">
              <label>Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="625001"
              />
            </div>
          </div>

          <div className="adminModalFooter">
            <button
              type="button"
              className="adminModalCancelBtn"
              onClick={closeUserModal}
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
                  : user
                  ? "Save User Changes"
                  : "Create User Account"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminUserModal;
