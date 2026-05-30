import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("inquiries"); // inquiries | catalog
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Product Form State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "Instruments",
    subject: "Physics",
    grade: "High School",
    price: "",
    stock: "",
    description: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Order Edit State
  const [editingOrder, setEditingOrder] = useState(null);
  const [orderForm, setOrderForm] = useState({
    freight: "0.00",
    status: "",
    items: [],
  });

  const getAdminToken = () => localStorage.getItem("adminToken");

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      navigate("/admin-login");
    } else {
      fetchOrders();
      fetchProducts();
    }
  }, [navigate]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    setError("");
    const token = getAdminToken();
    try {
      const response = await fetch("http://localhost:8081/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.message || "Failed to load inquiries");
      }
    } catch (err) {
      setError("Failed to connect to admin backend server");
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    const token = getAdminToken();
    try {
      const response = await fetch("http://localhost:8081/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  // --- PRODUCT MANAGEMENT ---
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      category: "Instruments",
      subject: "Physics",
      grade: "High School",
      price: "",
      stock: "",
      description: "",
      image: "",
    });
    setImageFile(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      subject: product.subject,
      grade: product.grade,
      price: String(product.price),
      stock: String(product.stock),
      description: product.description,
      image: product.image,
    });
    setImageFile(null);
    setIsProductModalOpen(true);
  };

  const handleProductFormChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const token = getAdminToken();

    let imageUrl = productForm.image;

    // 1. Upload image if selected
    if (imageFile) {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("image", imageFile);

      try {
        const uploadRes = await fetch("http://localhost:8081/api/admin/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.success) {
          imageUrl = uploadData.url;
        } else {
          setError(uploadData.message || "Failed to upload product image");
          setUploadingImage(false);
          return;
        }
      } catch (err) {
        setError("Error connecting to file upload server");
        setUploadingImage(false);
        return;
      }
      setUploadingImage(false);
    }

    // 2. Add or Edit product
    const payload = {
      name: productForm.name,
      category: productForm.category,
      subject: productForm.subject,
      grade: productForm.grade,
      price: parseFloat(productForm.price) || 0,
      stock: parseInt(productForm.stock, 10) || 0,
      description: productForm.description,
      image: imageUrl || "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500&auto=format&fit=crop&q=60",
    };

    try {
      const url = editingProduct
        ? `http://localhost:8081/api/admin/products/${editingProduct.ID || editingProduct.id}`
        : "http://localhost:8081/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(editingProduct ? "Product updated successfully!" : "Product added successfully!");
        setIsProductModalOpen(false);
        fetchProducts();
      } else {
        setError(data.message || "Failed to save product");
      }
    } catch (err) {
      setError("Failed to communicate with catalog service");
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm("Are you sure you want to delete this product from the database?")) return;
    setError("");
    setSuccess("");
    const token = getAdminToken();

    try {
      const response = await fetch(`http://localhost:8081/api/admin/products/${prodId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess("Product deleted successfully!");
        fetchProducts();
      } else {
        setError(data.message || "Failed to delete product");
      }
    } catch (err) {
      setError("Failed to connect to delete service");
    }
  };

  // --- ORDER MANAGEMENT ---
  const handleOpenEditOrder = (order) => {
    setEditingOrder(order);
    setOrderForm({
      freight: String(order.freight || "0.00"),
      status: order.status,
      items: order.items.map((item) => ({
        id: item.ID || item.id,
        name: item.productName,
        quantity: item.quantity,
        rate: item.rate,
      })),
    });
  };

  const handleOrderFieldChange = (e) => {
    setOrderForm({ ...orderForm, [e.target.name]: e.target.value });
  };

  const handleOrderItemChange = (index, field, value) => {
    const updatedItems = [...orderForm.items];
    if (field === "quantity") {
      updatedItems[index][field] = parseInt(value, 10) || 0;
    } else {
      updatedItems[index][field] = parseFloat(value) || 0;
    }
    setOrderForm({ ...orderForm, items: updatedItems });
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const token = getAdminToken();

    const payload = {
      freight: orderForm.freight,
      status: orderForm.status,
      items: orderForm.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        rate: item.rate,
      })),
    };

    try {
      const response = await fetch(
        `http://localhost:8081/api/admin/orders/${editingOrder.ID || editingOrder.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess("Order/Inquiry updated successfully!");
        setEditingOrder(null);
        fetchOrders();
      } else {
        setError(data.message || "Failed to update order");
      }
    } catch (err) {
      setError("Failed to connect to update order service");
    }
  };

  const navigateToInvoice = (order) => {
    // Redirection to the A4 memo editor/preview with order state loaded
    navigate("/shree", { state: { order } });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Header */}
      <header className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shadow">
            SSC
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none">SHREE SCIENTIFIC CENTER</h1>
            <span className="text-xs text-slate-400 font-semibold">Admin Administration Console</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/catalog")}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-full transition"
          >
            ← View Shop Catalog
          </button>
          <button
            onClick={handleLogout}
            className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-full transition shadow"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Workspace */}
      <div className="flex flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 gap-8">
        {/* Sidebar */}
        <aside className="w-64 flex flex-col gap-3">
          <button
            onClick={() => {
              setActiveTab("inquiries");
              setEditingOrder(null);
            }}
            className={`w-full text-left px-5 py-3.5 rounded-2xl font-bold text-sm transition-all ${
              activeTab === "inquiries"
                ? "bg-slate-900 text-white shadow-lg"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            📋 School Inquiries ({orders.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("catalog");
              setEditingOrder(null);
            }}
            className={`w-full text-left px-5 py-3.5 rounded-2xl font-bold text-sm transition-all ${
              activeTab === "catalog"
                ? "bg-slate-900 text-white shadow-lg"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            🔬 Catalog Management ({products.length})
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-white p-6 md:p-8 rounded-3xl border border-slate-250/50 shadow-sm overflow-hidden flex flex-col justify-between min-h-[70vh]">
          <div>
            {/* Status alerts */}
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-150 text-sm font-semibold mb-6">
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-150 text-sm font-semibold mb-6">
                ✓ {success}
              </div>
            )}

            {/* TAB: INQUIRIES */}
            {activeTab === "inquiries" && !editingOrder && (
              <div>
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-black text-slate-900">Incoming School Quote Requests</h3>
                  <button
                    onClick={fetchOrders}
                    className="text-xs text-indigo-600 hover:underline font-bold"
                  >
                    Refresh List
                  </button>
                </div>

                {loadingOrders ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-400 font-bold">Fetching customer requests...</span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <span className="text-3xl block mb-2">📋</span>
                    <p className="text-sm text-slate-400 font-bold">No school inquiries found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-55 bg-slate-50 text-slate-400 uppercase font-black tracking-wider border-b border-slate-100">
                          <th className="py-3.5 px-4">Bill No / Date</th>
                          <th className="py-3.5 px-4">School Details</th>
                          <th className="py-3.5 px-4">Quote Amount</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.map((order) => {
                          const dateStr = new Date(order.CreatedAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          });
                          return (
                            <tr key={order.ID || order.id} className="hover:bg-slate-50/60 transition">
                              <td className="py-4 px-4 font-bold">
                                <div>SSC-BILL-{order.ID || order.id}</div>
                                <div className="text-[10px] text-slate-400 font-medium">{dateStr}</div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="font-bold text-slate-900">{order.schoolName}</div>
                                <div className="text-slate-400 text-[10px]">
                                  {order.schoolCity} • {order.schoolBoard} Board • {order.phone}
                                </div>
                              </td>
                              <td className="py-4 px-4 font-black text-slate-900">
                                ₹{(order.grandTotal || 0).toLocaleString("en-IN")}
                              </td>
                              <td className="py-4 px-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    order.status === "pending"
                                      ? "bg-amber-100 text-amber-800"
                                      : order.status === "approved"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-indigo-100 text-indigo-800"
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right flex justify-end gap-2.5">
                                <button
                                  onClick={() => handleOpenEditOrder(order)}
                                  className="bg-slate-900 hover:bg-black text-white px-3.5 py-1.5 rounded-full font-bold transition shadow-sm text-[11px]"
                                >
                                  Edit Rates
                                </button>
                                <button
                                  onClick={() => navigateToInvoice(order)}
                                  className="border border-slate-200 hover:bg-slate-50 text-slate-600 px-3.5 py-1.5 rounded-full font-bold transition text-[11px]"
                                >
                                  Invoice PDF
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB: EDIT ORDER IN-LINE */}
            {activeTab === "inquiries" && editingOrder && (
              <div>
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <button
                      onClick={() => setEditingOrder(null)}
                      className="text-xs text-indigo-600 hover:underline font-bold"
                    >
                      ← Back to Inquiries
                    </button>
                    <h3 className="text-xl font-black text-slate-900 mt-2">
                      Adjust Quotation Details (SSC-BILL-{editingOrder.ID || editingOrder.id})
                    </h3>
                  </div>
                  <button
                    onClick={() => navigateToInvoice(editingOrder)}
                    className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold px-4 py-2 rounded-full transition"
                  >
                    Open A4 Bill Editor
                  </button>
                </div>

                <form onSubmit={handleOrderSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Freight / Shipping Charges (₹)
                      </label>
                      <input
                        type="text"
                        name="freight"
                        value={orderForm.freight}
                        onChange={handleOrderFieldChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-slate-550 focus:border-slate-800 transition font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Inquiry Status
                      </label>
                      <select
                        name="status"
                        value={orderForm.status}
                        onChange={handleOrderFieldChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-slate-800 transition font-bold"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-700 mb-3 uppercase tracking-wider">
                      Adjust Item Rates & Quantities
                    </h4>
                    <div className="space-y-3">
                      {orderForm.items.map((item, idx) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/50"
                        >
                          <div className="flex-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Item Name</span>
                            <div className="font-bold text-xs text-slate-900">{item.name}</div>
                          </div>
                          <div className="w-24">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                              Quantity
                            </label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleOrderItemChange(idx, "quantity", e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none text-center font-bold"
                            />
                          </div>
                          <div className="w-32">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                              Rate (₹)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={item.rate}
                              onChange={(e) => handleOrderItemChange(idx, "rate", e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none text-right font-bold"
                            />
                          </div>
                          <div className="w-24 text-right">
                            <span className="block text-[9px] font-bold text-slate-400 uppercase">Subtotal</span>
                            <span className="font-black text-xs text-slate-900">
                              ₹{(item.quantity * item.rate).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingOrder(null)}
                      className="border border-slate-200 hover:bg-slate-50 font-bold px-6 py-2.5 rounded-full transition text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-black text-white font-bold px-8 py-2.5 rounded-full transition text-xs shadow-lg"
                    >
                      Save and Update Database
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: CATALOG LIST */}
            {activeTab === "catalog" && (
              <div>
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-black text-slate-900">Science Catalog Products</h3>
                  <button
                    onClick={handleOpenAddProduct}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-full transition shadow text-xs"
                  >
                    + Add New Product
                  </button>
                </div>

                {loadingProducts ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-400 font-bold">Loading laboratory products...</span>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <span className="text-3xl block mb-2">🔬</span>
                    <p className="text-sm text-slate-400 font-bold">Catalog is empty.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 uppercase font-black tracking-wider border-b border-slate-100">
                          <th className="py-3.5 px-4 w-16">Image</th>
                          <th className="py-3.5 px-4">Product Details</th>
                          <th className="py-3.5 px-4">Category / Subject</th>
                          <th className="py-3.5 px-4">Price</th>
                          <th className="py-3.5 px-4">Stock</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {products.map((product) => {
                          const prodId = product.ID || product.id;
                          return (
                            <tr key={prodId} className="hover:bg-slate-55/60 hover:bg-slate-50/60 transition">
                              <td className="py-3 px-4">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-11 h-11 object-cover rounded-lg border border-slate-200 shadow-sm"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-900 text-sm leading-snug">{product.name}</div>
                                <div className="text-slate-400 text-[10px] line-clamp-1">{product.description}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-slate-700">{product.category}</div>
                                <div className="text-indigo-600 text-[10px] font-bold">{product.subject} • {product.grade}</div>
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-900">
                                ₹{(product.price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </td>
                              <td className={`py-3 px-4 font-bold ${product.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>
                                {product.stock} items
                              </td>
                              <td className="py-3 px-4 text-right flex justify-end gap-2.5 mt-2">
                                <button
                                  onClick={() => handleOpenEditProduct(product)}
                                  className="text-indigo-600 hover:text-indigo-800 font-bold px-2"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prodId)}
                                  className="text-red-650 text-red-500 hover:text-red-700 font-bold px-2"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">
                {editingProduct ? "Modify Product Specifications" : "Register New Science Equipment"}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Equipment / Item Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={productForm.name}
                  onChange={handleProductFormChange}
                  placeholder="e.g. Premium Monocular Microscope"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-slate-800 transition font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={productForm.category}
                    onChange={handleProductFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-slate-800 transition font-semibold cursor-pointer"
                  >
                    <option value="Instruments">Instruments</option>
                    <option value="Glassware">Glassware</option>
                    <option value="Models">Anatomical Models</option>
                    <option value="Kits">Lab Kits</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Subject
                  </label>
                  <select
                    name="subject"
                    value={productForm.subject}
                    onChange={handleProductFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-slate-800 transition font-semibold cursor-pointer"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="General Science">General Science</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Grade Level
                  </label>
                  <select
                    name="grade"
                    value={productForm.grade}
                    onChange={handleProductFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-slate-800 transition font-semibold cursor-pointer"
                  >
                    <option value="Primary">Primary</option>
                    <option value="Middle School">Middle School</option>
                    <option value="High School">High School</option>
                    <option value="All Grades">All Grades</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={productForm.price}
                    onChange={handleProductFormChange}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-slate-800 transition font-semibold text-right"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Available Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={productForm.stock}
                    onChange={handleProductFormChange}
                    placeholder="10"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-slate-800 transition font-semibold text-center"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Product Description
                </label>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleProductFormChange}
                  placeholder="Detailed description of scientific parameters..."
                  rows="3"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-slate-800 transition font-semibold resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Product Photograph / Image File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition cursor-pointer"
                />
                {productForm.image && !imageFile && (
                  <div className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                    ✓ Currently has active image (url: {productForm.image.slice(0, 45)}...)
                  </div>
                )}
              </div>

              <div className="flex gap-4 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="border border-slate-200 hover:bg-slate-50 font-bold px-6 py-2.5 rounded-full transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="bg-slate-900 hover:bg-black text-white font-bold px-8 py-2.5 rounded-full transition text-xs shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                  {uploadingImage ? "Uploading Photo..." : "Confirm & Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
