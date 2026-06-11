import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080/api";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount) =>
  `₹${(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const Quotations = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("active");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchasingId, setPurchasingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchQuotations = useCallback(async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const status = tab === "active" ? "active" : "completed";
      const response = await fetch(`${API_BASE}/orders?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.message || "Failed to load quotations");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }, [tab, navigate]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const handlePurchase = async (order) => {
    const orderId = order.ID || order.id;
    const token = localStorage.getItem("userToken");
    if (!token || !orderId) return;

    if (!window.confirm("Confirm purchase for this quotation? It will move to your completed list.")) {
      return;
    }

    setPurchasingId(orderId);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/purchase`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        await fetchQuotations();
      } else {
        setError(data.message || "Failed to complete purchase");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setPurchasingId(null);
    }
  };

  const handleDelete = async (order) => {
    const orderId = order.ID || order.id;
    const token = localStorage.getItem("userToken");
    if (!token || !orderId) return;

    if (!window.confirm("Delete this quotation? This cannot be undone.")) {
      return;
    }

    setDeletingId(orderId);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        await fetchQuotations();
      } else {
        setError(data.message || "Failed to delete quotation");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setDeletingId(null);
    }
  };

  const viewInvoice = (order) => {
    navigate("/shree", { state: { order } });
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] font-sans text-slate-800">
      <nav className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md">
              SS
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-600">
              My Quotations
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/catalog"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
            >
              Browse Catalog
            </Link>
            <Link
              to="/dashboard"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Quotation Lists</h1>
          <p className="text-slate-500 text-sm">
            Products added from the catalog create quotations here. Purchase when ready to move them to completed.
          </p>
        </header>

        <div className="flex gap-2 mb-8 p-1 bg-slate-100 rounded-xl w-fit">
          <button
            onClick={() => setTab("active")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition ${
              tab === "active"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Active Quotations
          </button>
          <button
            onClick={() => setTab("completed")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition ${
              tab === "completed"
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Completed Quotations
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400 text-sm font-semibold">Loading quotations...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center shadow-sm">
            <div className="text-4xl mb-4">{tab === "active" ? "📋" : "✅"}</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {tab === "active" ? "No active quotations" : "No completed quotations yet"}
            </h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
              {tab === "active"
                ? "Add products from the catalog and submit your inquiry list to create a quotation."
                : "When you purchase an active quotation, it will appear here."}
            </p>
            {tab === "active" && (
              <Link
                to="/catalog"
                className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition"
              >
                Go to Catalog
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const orderId = order.ID || order.id;
              const items = order.items || order.Items || [];
              const isPurchasing = purchasingId === orderId;
              const isDeleting = deletingId === orderId;

              return (
                <article
                  key={orderId}
                  className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
                >
                  <div className="p-6 border-b border-slate-50 flex flex-wrap justify-between gap-4 items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-slate-900">
                          Quotation #{order.quotationNo || order.QuotationNo || orderId}
                        </h3>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            tab === "active"
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          }`}
                        >
                          {tab === "active" ? "Active" : "Completed"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {formatDate(order.CreatedAt || order.createdAt)} · {order.schoolName || "School"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Grand Total</span>
                      <span className="text-xl font-black text-slate-900">
                        {formatCurrency(order.grandTotal)}
                      </span>
                    </div>
                  </div>

                  <div className="px-6 py-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-slate-400 uppercase tracking-wider">
                          <th className="pb-2 font-bold">Product</th>
                          <th className="pb-2 font-bold text-center">Qty</th>
                          <th className="pb-2 font-bold text-right">Rate</th>
                          <th className="pb-2 font-bold text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.ID || item.id} className="border-t border-slate-50">
                            <td className="py-2.5 font-medium text-slate-800">
                              {item.productName}
                            </td>
                            <td className="py-2.5 text-center text-slate-600">{item.quantity}</td>
                            <td className="py-2.5 text-right text-slate-600">
                              {formatCurrency(item.rate)}
                            </td>
                            <td className="py-2.5 text-right font-semibold text-slate-900">
                              {formatCurrency(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-slate-50/80 flex flex-wrap gap-3 justify-end">
                    <button
                      onClick={() => viewInvoice(order)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-white transition"
                    >
                      View Invoice
                    </button>
                    {tab === "active" && (
                      <>
                        <button
                          onClick={() => handleDelete(order)}
                          disabled={isDeleting || isPurchasing}
                          className="px-5 py-2.5 rounded-xl text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-60"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                        <button
                          onClick={() => handlePurchase(order)}
                          disabled={isPurchasing || isDeleting}
                          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-60"
                        >
                          {isPurchasing ? "Processing..." : "Purchase"}
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Quotations;
