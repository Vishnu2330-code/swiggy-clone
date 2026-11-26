import AdminRestaurantModal from "./AdminRestaurantModal";
import AdminDishModal from "./AdminDishModal";
import AdminCategoryModal from "./AdminCategoryModal";
import AdminUserModal from "./AdminUserModal";
import AdminOrderDetailsModal from "./AdminOrderDetailsModal";
import AdminDeleteConfirmModal from "./AdminDeleteConfirmModal";

function AdminModalsContainer() {
  return (
    <>
      <AdminRestaurantModal />
      <AdminDishModal />
      <AdminCategoryModal />
      <AdminUserModal />
      <AdminOrderDetailsModal />
      <AdminDeleteConfirmModal />
    </>
  );
}

export default AdminModalsContainer;
