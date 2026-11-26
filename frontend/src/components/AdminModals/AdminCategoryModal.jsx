import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiX, FiCheck } from "react-icons/fi";
import { useAdmin } from "../../context/AdminContext";
import { adminApi } from "../../services/api";
import "./AdminModals.css";

function AdminCategoryModal() {
  const { categoryModal, closeCategoryModal, triggerRefresh } = useAdmin();
  const { isOpen, category } = categoryModal;

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    slug: "",
    displayOrder: 0,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        image: category.image || "",
        slug: category.slug || "",
        displayOrder: category.displayOrder ?? 0,
      });
    } else {
      setFormData({
        name: "",
        image: "",
        slug: "",
        displayOrder: 0,
      });
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "name" && !category) {
        next.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.image.trim()) {
      toast.warning("Category name and image URL are required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        image: formData.image.trim(),
        slug: formData.slug.trim(),
        displayOrder: Number(formData.displayOrder) || 0,
      };

      if (category?._id) {
        await adminApi.updateCategory(category._id, payload);
        toast.success(`Category "${payload.name}" updated! 🍕`);
      } else {
        await adminApi.createCategory(payload);
        toast.success(`Category "${payload.name}" created! ✨`);
      }

      triggerRefresh();
      closeCategoryModal();
    } catch (err) {
      toast.error(err.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="adminModalOverlay" onClick={closeCategoryModal}>
      <div className="adminModalContent smallModal" onClick={(e) => e.stopPropagation()}>
        <div className="adminModalHeader">
          <div>
            <h3>{category ? "Edit Category" : "Add Food Category"}</h3>
            <p className="adminModalSub">
              {category
                ? `Edit ${category.name}`
                : "Create a carousel category (e.g. Biryani, Pizza, Dosa)"}
            </p>
          </div>
          <button className="adminModalCloseBtn" onClick={closeCategoryModal}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="adminModalForm">
          <div className="adminFormGroup">
            <label>Category Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Shawarma, Biryani, Burgers"
              required
              autoFocus
            />
          </div>

          <div className="adminFormGroup">
            <label>Image URL *</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://... or /images/..."
              required
            />
            {formData.image && (
              <div className="adminImgPreview categoryPreview">
                <img
                  src={formData.image}
                  alt="Category preview"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <div className="adminFormRow">
            <div className="adminFormGroup flex-2">
              <label>Slug / URL Key</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="biryani, shawarma, pizza..."
              />
            </div>

            <div className="adminFormGroup flex-1">
              <label>Display Order</label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          </div>

          <div className="adminModalFooter">
            <button
              type="button"
              className="adminModalCancelBtn"
              onClick={closeCategoryModal}
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
                  : category
                  ? "Update Category"
                  : "Create Category"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminCategoryModal;
