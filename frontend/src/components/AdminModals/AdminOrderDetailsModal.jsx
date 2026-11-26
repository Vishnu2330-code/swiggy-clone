import { useState } from "react";
import { toast } from "react-toastify";
import {
  FiX,
  FiUser,
  FiMapPin,
  FiPhone,
  FiShoppingBag,
  FiClock,
  FiCheckCircle,
  FiTrash2,
} from "react-icons/fi";
import { useAdmin } from "../../context/AdminContext";
import { adminApi } from "../../services/api";
import "./AdminModals.css";

const ORDER_STATUSES = [
  "Placed",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const PAYMENT_STATUSES = ["Pending", "Paid", "Failed"];

function AdminOrderDetailsModal() {
  const { orderModal, closeOrderModal, confirmDelete, triggerRefresh } = useAdmin();
  const { isOpen, order } = orderModal;

  const [currentOrder, setCurrentOrder] = useState(order);
  const [updating, setUpdating] = useState(false);

  // Sync state if order prop changes
  if (order && (!currentOrder || currentOrder._id !== order._id)) {
    setCurrentOrder(order);
  }

  if (!isOpen || !currentOrder) return null;

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      const updated = await adminApi.updateOrderStatus(currentOrder._id, newStatus);
      setCurrentOrder(updated);
      toast.success(`Order status changed to "${newStatus}"`);
      triggerRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentChange = async (newPaymentStatus) => {
    setUpdating(true);
    try {
      const updated = await adminApi.updatePaymentStatus(currentOrder._id, newPaymentStatus);
      setCurrentOrder(updated);
      toast.success(`Payment status changed to "${newPaymentStatus}"`);
      triggerRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to update payment status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = () => {
    confirmDelete("order", currentOrder._id, `Order #${currentOrder.orderCode}`, async () => {
      await adminApi.deleteOrder(currentOrder._id);
      closeOrderModal();
    });
  };

  const formatDate = (iso) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="adminModalOverlay" onClick={closeOrderModal}>
      <div className="adminModalContent orderModalContent" onClick={(e) => e.stopPropagation()}>
        <div className="adminModalHeader">
          <div>
            <div className="orderModalTitleRow">
              <h3>Order #{currentOrder.orderCode}</h3>
              <span className={`statusPill ${currentOrder.orderStatus?.toLowerCase()}`}>
                {currentOrder.orderStatus}
              </span>
            </div>
            <p className="adminModalSub">Placed on {formatDate(currentOrder.createdAt)}</p>
          </div>
          <button className="adminModalCloseBtn" onClick={closeOrderModal}>
            <FiX />
          </button>
        </div>

        <div className="orderModalBody">
          {/* Quick status control panel */}
          <div className="orderStatusControlsBox">
            <div className="orderControlCol">
              <label>
                <FiClock /> Order Status:
              </label>
              <select
                value={currentOrder.orderStatus}
                disabled={updating}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="adminQuickSelect"
              >
                {ORDER_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="orderControlCol">
              <label>
                <FiCheckCircle /> Payment Status:
              </label>
              <select
                value={currentOrder.paymentStatus || "Pending"}
                disabled={updating}
                onChange={(e) => handlePaymentChange(e.target.value)}
                className="adminQuickSelect"
              >
                {PAYMENT_STATUSES.map((pst) => (
                  <option key={pst} value={pst}>
                    {pst} ({currentOrder.paymentMethod || "COD"})
                  </option>
                ))}
              </select>
            </div>

            <button className="orderDeleteQuickBtn" onClick={handleDelete} title="Delete order">
              <FiTrash2 />
              <span>Delete Order</span>
            </button>
          </div>

          <div className="orderTwoCol">
            {/* Customer & Address Details */}
            <div className="orderInfoPanel">
              <h4>Customer Details</h4>
              <div className="orderDetailRow">
                <FiUser className="detailIcon" />
                <span>
                  <strong>
                    {currentOrder.deliveryAddress?.fullName || currentOrder.user?.name || "Guest"}
                  </strong>
                  <br />
                  <small>{currentOrder.user?.email || "No email provided"}</small>
                </span>
              </div>

              <div className="orderDetailRow">
                <FiPhone className="detailIcon" />
                <span>{currentOrder.deliveryAddress?.phone || currentOrder.user?.phone || "N/A"}</span>
              </div>

              <div className="orderDetailRow">
                <FiMapPin className="detailIcon" />
                <span>
                  {currentOrder.deliveryAddress?.address}, {currentOrder.deliveryAddress?.city} -{" "}
                  {currentOrder.deliveryAddress?.pincode}
                </span>
              </div>
            </div>

            {/* Bill summary */}
            <div className="orderInfoPanel">
              <h4>Bill Summary</h4>
              <div className="orderBillRow">
                <span>Item Total:</span>
                <span>₹{currentOrder.itemTotal}</span>
              </div>
              <div className="orderBillRow">
                <span>Delivery Fee:</span>
                <span>₹{currentOrder.deliveryFee ?? 30}</span>
              </div>
              <div className="orderBillRow">
                <span>Platform Fee:</span>
                <span>₹{currentOrder.platformFee ?? 5}</span>
              </div>
              {currentOrder.discount > 0 && (
                <div className="orderBillRow discountText">
                  <span>Discount ({currentOrder.couponCode || "COUPON"}):</span>
                  <span>-₹{currentOrder.discount}</span>
                </div>
              )}
              <hr />
              <div className="orderBillRow grandTotal">
                <strong>Total Amount:</strong>
                <strong>₹{currentOrder.totalAmount}</strong>
              </div>
            </div>
          </div>

          {/* Items breakdown list */}
          <div className="orderItemsSection">
            <h4>
              <FiShoppingBag /> Ordered Dishes ({currentOrder.items?.length || 0})
            </h4>
            <div className="orderItemsTableWrap">
              <table className="orderItemsTable">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrder.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="itemCol">
                        {item.image && (
                          <img
                            src={item.image}
                            alt=""
                            className="orderDishThumb"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                        <span>{item.name}</span>
                      </td>
                      <td>₹{item.price}</td>
                      <td>x {item.quantity}</td>
                      <td className="text-right amountText">₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="adminModalFooter">
          <button className="adminModalCancelBtn" onClick={closeOrderModal}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetailsModal;
