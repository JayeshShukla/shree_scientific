import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8081/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem("adminToken", data.token);
        navigate("/admin");
      } else {
        setError(data.message || "Admin login failed. Access denied.");
      }
    } catch (err) {
      setError("Failed to connect to the Admin Backend service (port 8081). Please ensure it is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white px-4">
      <div className="w-full max-w-[440px]">
        <div className="bg-white/85 backdrop-blur-xl p-10 rounded-3xl border border-white shadow-2xl shadow-indigo-100/50">
          <div className="text-center mb-8 flex flex-col items-center">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-extrabold text-sm mb-4">
              SS
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">Admin Administration</h2>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Shree Scientific Center</p>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-605 text-red-600 border border-red-100 p-3 rounded-xl text-center text-xs font-bold">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. admin@shreescientific.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-slate-800 text-sm font-semibold transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-slate-800 text-sm font-semibold transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed text-xs"
            >
              {loading ? "Authenticating..." : "Sign In to Admin Console"}
            </button>
          </form>

          <Link
            to="/"
            className="w-full mt-8 text-xs text-slate-400 hover:text-slate-600 transition flex items-center justify-center gap-2 font-bold"
          >
            <span>←</span> Back to Customer Shop
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
