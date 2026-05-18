import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import A4Form from "./A4Form";
import Catalog from "./Catalog";

// --- SHARED COMPONENTS ---

const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow">
          SS
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-600">
          Shree Scientific Center
        </span>
      </Link>
      <div className="flex items-center gap-6">
        <Link to="/catalog" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition">
          Browse Catalog
        </Link>
      </div>
    </div>
  </nav>
);

const AuthLayout = ({ title, subtitle, children }) => (
  <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-white px-4">
    <div className="w-full max-w-[440px]">
      <div className="bg-white/70 backdrop-blur-xl p-10 rounded-3xl border border-white shadow-2xl shadow-indigo-100/50">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">{title}</h2>
          <p className="text-slate-500">{subtitle}</p>
        </div>
        {children}
        <Link
          to="/"
          className="w-full mt-8 text-sm text-slate-400 hover:text-slate-600 transition flex items-center justify-center gap-2"
        >
          <span>←</span> Back to home
        </Link>
      </div>
    </div>
  </div>
);

// --- PAGE COMPONENTS ---

const LandingPage = () => (
  <div className="min-h-screen bg-white font-sans">
    <Navbar />
    <section className="pt-44 pb-32 px-6 text-center">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-6xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
          Invoicing for the <br />{" "}
          <span className="text-indigo-600 font-black">Modern Era.</span>
        </h1>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            to="/login"
            className="w-full sm:w-auto bg-indigo-600 text-white px-12 py-4 rounded-full text-lg font-bold hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 text-center"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="w-full sm:w-auto bg-white border border-slate-200 text-slate-900 px-12 py-4 rounded-full text-lg font-bold hover:bg-slate-50 transition text-center"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </section>
  </div>
);

const UserLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem("userToken", data.token);
        navigate("/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Failed to connect to server");
    }
  };

  return (
    <AuthLayout title="User Login" subtitle="Access your customer portal">
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg">
          Sign In
        </button>
      </form>
    </AuthLayout>
  );
};

// AdminLogin has been removed. Administration is now handled in a separate service.

const Signup = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolCity, setSchoolCity] = useState("");
  const [schoolBoard, setSchoolBoard] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          schoolName,
          schoolCity,
          schoolBoard,
          phone,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        navigate("/login");
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      setError("Failed to connect to server");
    }
  };

  return (
    <AuthLayout title="Register School" subtitle="Create your school administrator account">
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last Name"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <input
          type="email"
          placeholder="Work Email Address"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="School Name"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="School City"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm"
            value={schoolCity}
            onChange={(e) => setSchoolCity(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <select
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none bg-white text-slate-700 text-sm"
            value={schoolBoard}
            onChange={(e) => setSchoolBoard(e.target.value)}
            required
          >
            <option value="">Select Board</option>
            <option value="CBSE">CBSE</option>
            <option value="ICSE">ICSE</option>
            <option value="State Board">State Board</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition text-sm">
          Create Account
        </button>
      </form>
    </AuthLayout>
  );
};

// --- DASHBOARDS ---

const UserDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="w-64 bg-slate-900 text-slate-400 p-6 flex flex-col gap-4">
        <div className="text-white font-bold mb-8 text-xl flex items-center gap-2">
          User Portal
        </div>
        <button
          onClick={() => navigate("/catalog")}
          className="bg-indigo-600 text-white p-3 rounded-lg font-bold text-left hover:bg-indigo-700 transition"
        >
          Browse Product Catalog
        </button>
        <div className="bg-slate-800 text-white p-3 rounded-lg cursor-pointer">
          My Invoices
        </div>
        <div className="p-3 hover:bg-slate-800 rounded-lg cursor-pointer">
          Support
        </div>
        <button
          onClick={handleLogout}
          className="mt-auto p-3 text-red-400 font-bold text-left hover:text-red-300 transition"
        >
          Logout
        </button>
      </div>
      <div className="flex-1 p-12 flex flex-col items-center justify-center text-center">
        <h2 className="text-3xl font-black text-slate-850 mb-4">Welcome to Shree Scientific Center</h2>
        <p className="text-slate-400 max-w-md mb-8 text-sm">
          Browse our full list of scientific lab equipment and request custom quotations directly for your school.
        </p>
        <button
          onClick={() => navigate("/catalog")}
          className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-full hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
        >
          Go to Product Catalog
        </button>
      </div>
    </div>
  );
};

// AdminDashboard is now imported from "./AdminDashboard"

// --- MAIN ROUTER ---

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/shree" element={<A4Form />} />
        <Route path="/catalog" element={<Catalog />} />
      </Routes>
    </Router>
  );
};

export default App;
