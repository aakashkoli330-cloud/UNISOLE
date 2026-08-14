import { useEffect, useState } from "react";
import { productsApi } from "../../api/products";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/helpers";
import { getImageSrc } from "../../utils/getImageSrc";
import { formatPrice } from "../../utils/format";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

const emptyForm = {
  name: "",
  price: "",
  category: "men",
  stock: "",
  description: "",
  image: "",
};

export default function AdminProducts() {
  const { push } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setLoading(true);
    productsApi
      .getAll()
      .then(({ data }) => setProducts(data || []))
      .catch(() => push("error", "Failed to load products", "Please try again"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFile(null);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      price: p.price,
      category: p.category,
      stock: p.stock,
      description: p.description || "",
      image: p.image,
    });
    setFile(null);
    setModalOpen(true);
  };

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || form.stock === "") {
      push("error", "Missing fields", "Name, price and stock are required");
      return;
    }
    if (!editing && !file) {
      push("error", "Image required", "Please upload a product image");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("price", form.price);
      fd.append("category", form.category);
      fd.append("stock", form.stock);
      fd.append("description", form.description.trim());
      if (file) fd.append("image", file);

      if (editing) {
        await productsApi.update(editing._id, fd);
        push("success", "Product updated", form.name.trim());
      } else {
        await productsApi.create(fd);
        push("success", "Product added", form.name.trim());
      }
      setModalOpen(false);
      load();
    } catch (err) {
      push("error", "Save failed", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    setDeletingId(p._id);
    try {
      await productsApi.remove(p._id);
      push("success", "Product deleted", p.name);
      setProducts((list) => list.filter((x) => x._id !== p._id));
    } catch (err) {
      push("error", "Delete failed", getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          <p className="mt-1 text-sm text-gray-500">{products.length} products</p>
        </div>
        <Button variant="primary" onClick={openAdd}>
          <i className="fa-solid fa-plus" aria-hidden="true" /> Add Product
        </Button>
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon="fa-solid fa-box-open"
            title="No products"
            message="Add your first product to start selling."
            action={
              <Button variant="primary" onClick={openAdd}>
                Add Product
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p._id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageSrc(p.image)}
                          alt={p.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <span className="max-w-[200px] truncate font-semibold text-gray-900">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600">{p.category}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {formatPrice(p.price)}
                    </td>
                    <td className="px-4 py-3">
                      {p.stock <= 0 ? (
                        <Badge color="red">Out of stock</Badge>
                      ) : p.stock <= 3 ? (
                        <Badge color="yellow">{p.stock} left</Badge>
                      ) : (
                        <Badge color="green">{p.stock}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-brand-50 hover:text-brand-600"
                          aria-label="Edit"
                        >
                          <i className="fa-solid fa-pen" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(p)}
                          disabled={deletingId === p._id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          aria-label="Delete"
                        >
                          <i className={`fa-solid ${deletingId === p._id ? "fa-spinner fa-spin" : "fa-trash-can"}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Product" : "Add Product"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submit} loading={saving}>
              {editing ? "Save Changes" : "Add Product"}
            </Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Product Name"
            placeholder="e.g. Air Runner Sneakers"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (₹)"
              type="number"
              min="0"
              placeholder="1999"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
            />
            <Input
              label="Stock"
              type="number"
              min="0"
              placeholder="50"
              value={form.stock}
              onChange={(e) => setField("stock", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Category</label>
            <div className="flex gap-3">
              {["men", "women"].map((c) => (
                <label
                  key={c}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 text-sm font-semibold capitalize transition-colors ${
                    form.category === c
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={c}
                    checked={form.category === c}
                    onChange={() => setField("category", c)}
                    className="accent-brand-600"
                  />
                  {c === "men" ? "Men" : "Women"}
                </label>
              ))}
            </div>
          </div>
          <Input
            as="textarea"
            label="Description"
            placeholder="Short description of the product"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
          />
          <div>
            <label className="label">Image</label>
            <div className="flex items-center gap-4">
              {(file ? URL.createObjectURL(file) : editing ? getImageSrc(form.image) : null) && (
                <img
                  src={file ? URL.createObjectURL(file) : getImageSrc(form.image)}
                  alt="Preview"
                  className="h-16 w-16 rounded-lg object-cover"
                />
              )}
              <label className="btn-secondary cursor-pointer">
                <i className="fa-solid fa-upload mr-1" aria-hidden="true" />
                {file ? "Change image" : "Upload image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            {editing && !file && (
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to keep the current image.
              </p>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
