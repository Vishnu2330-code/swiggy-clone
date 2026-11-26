import { FiAlertTriangle, FiX } from "react-icons/fi";
import { useAdmin } from "../../context/AdminContext";
import "./AdminModals.css";

function AdminDeleteConfirmModal() {
  const { deleteConfirm, closeDeleteConfirm, handleDeleteConfirmed } = useAdmin();
  const { isOpen, type, title } = deleteConfirm;

  if (!isOpen) return null;

  const typeLabel = {
    restaurant: "Restaurant & all its menu dishes",
    dish: "Menu Dish",
    user: "User Account",
    category: "Category",
    order: "Order Record",
  }[type] || "Item";

  return (
    <div className="adminModalOverlay" onClick={closeDeleteConfirm}>
      <div className="adminModalContent confirmDeleteModal" onClick={(e) => e.stopPropagation()}>
        <div className="confirmDeleteHeader">
          <div className="warningIconWrap">
            <FiAlertTriangle />
          </div>
          <div>
            <h3>Confirm Deletion</h3>
            <p className="adminModalSub">This action cannot be undone.</p>
          </div>
          <button className="adminModalCloseBtn" onClick={closeDeleteConfirm}>
            <FiX />
          </button>
        </div>

        <div className="confirmDeleteBody">
          <p>
            Are you sure you want to permanently delete this {typeLabel}?
          </p>
          {title && (
            <div className="confirmDeleteTarget">
              <strong>{title}</strong>
            </div>
          )}
          {type === "restaurant" && (
            <p className="confirmDeleteNotice">
              ⚠️ Note: All menu items and dishes attached to this restaurant will also be removed.
            </p>
          )}
        </div>

        <div className="adminModalFooter">
          <button
            type="button"
            className="adminModalCancelBtn"
            onClick={closeDeleteConfirm}
          >
            Cancel
          </button>
          <button
            type="button"
            className="adminModalDangerBtn"
            onClick={handleDeleteConfirmed}
          >
            Yes, Permanently Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDeleteConfirmModal;
