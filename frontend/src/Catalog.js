import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");

  // Inquiry Bag State (school quote request)
  const [bag, setBag] = useState([]);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Fetch products from backend
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      if (selectedSubject) queryParams.append("subject", selectedSubject);
      if (selectedCategory) queryParams.append("category", selectedCategory);
      if (selectedGrade) queryParams.append("grade", selectedGrade);

      const response = await fetch(`http://localhost:8080/api/products?${queryParams.toString()}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setProducts(data.products || []);
      } else {
        setError(data.message || "Failed to load products");
      }
    } catch (err) {
      setError("Failed to connect to backend server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, selectedSubject, selectedCategory, selectedGrade]);

  // Reset Filters
  const handleClearFilters = () => {
    setSearch("");
    setSelectedSubject("");
    setSelectedCategory("");
    setSelectedGrade("");
  };

  // Add/Remove from Inquiry Bag
  const toggleInBag = (product) => {
    const prodId = product.id || product.ID;
    if (bag.some((item) => (item.id || item.ID) === prodId)) {
      setBag(bag.filter((item) => (item.id || item.ID) !== prodId));
    } else {
      setBag([...bag, product]);
    }
  };

  const handleSendInquiry = (e) => {
    e.preventDefault();
    setInquirySuccess(true);
    setTimeout(() => {
      setBag([]);
      setIsBagOpen(false);
      setInquirySuccess(false);
    }, 3000);
  };

  // Colors for subjects
  const getSubjectBadgeClass = (subject) => {
    switch (subject?.toLowerCase()) {
      case "physics":
        return "bg-cyan-50 text-cyan-700 border-cyan-100";
      case "chemistry":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "biology":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "mathematics":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] font-sans pb-24 text-slate-800">
      {/* Dynamic Navbar */}
      <nav className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md">
              SS
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-600">
              Shree Scientific Center
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/shree" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">
              Create Invoice
            </Link>
            
            {/* Inquiry Bag Trigger Button */}
            <button
              onClick={() => setIsBagOpen(true)}
              className="relative flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-sm font-bold hover:bg-indigo-100 transition"
            >
              <span>📋 Inquiry List</span>
              {bag.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold animate-pulse">
                  {bag.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Banner Section */}
      <header className="pt-32 pb-12 bg-gradient-to-b from-indigo-50/50 to-[#fafbfc] px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="bg-indigo-100/60 text-indigo-800 text-xs px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider">
            Premium Educational Equipment
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mt-4 mb-3">
            High School Science Equipment
          </h1>
          <p className="text-slate-500 text-base md:text-lg leading-relaxed">
            Supplying school laboratories with premium-grade instruments, glassware, and science models. Explore, build a list, and request a quotation.
          </p>
        </div>
      </header>

      {/* Main Catalog Workspace */}
      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR FILTERS */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 text-lg">Filters</h3>
            {(selectedSubject || selectedCategory || selectedGrade || search) && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-indigo-600 hover:underline font-semibold"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Search Input */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Microscope"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Subject
              </label>
              <div className="flex flex-col gap-2">
                {["Physics", "Chemistry", "Biology", "Mathematics"].map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubject(selectedSubject === sub ? "" : sub)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                      selectedSubject === sub
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-indigo-500 transition cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="Glassware">Glassware</option>
                <option value="Instruments">Instruments</option>
                <option value="Models">Anatomical Models</option>
                <option value="Kits">Lab Kits</option>
              </select>
            </div>

            {/* School Grade Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                School Grade
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-indigo-500 transition cursor-pointer"
              >
                <option value="">All Grades</option>
                <option value="Primary">Primary School</option>
                <option value="Middle School">Middle School</option>
                <option value="High School">High School</option>
              </select>
            </div>
          </div>
        </section>

        {/* PRODUCTS GRID */}
        <section className="lg:col-span-3">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-slate-400 text-sm font-semibold">Loading Catalog...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Products Found</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                We couldn't find any scientific equipment matching your current filters. Try resetting the search or filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const prodId = product.id || product.ID;
                const inBag = bag.some((item) => (item.id || item.ID) === prodId);
                return (
                  <div
                    key={prodId}
                    className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                  >
                    {/* Image Area */}
                    <div className="h-48 overflow-hidden bg-slate-100 relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-700 text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">
                        {product.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getSubjectBadgeClass(product.subject)}`}>
                            {product.subject}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            {product.grade}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-slate-900 text-base mb-1.5 leading-snug group-hover:text-indigo-600 transition">
                          {product.name}
                        </h4>

                        {/* Description */}
                        <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed mb-4">
                          {product.description}
                        </p>
                      </div>

                      <div>
                        {/* Price and Stock */}
                        <div className="flex justify-between items-center mb-4 pt-3 border-t border-slate-50">
                          <div>
                            <span className="text-xs text-slate-400 block">Unit Price</span>
                            <span className="text-lg font-black text-slate-950">
                              ₹{(product.price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <span className={`text-xs font-bold ${(product.stock || 0) > 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {(product.stock || 0) > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                          </span>
                        </div>

                        {/* Inquiry Action Button */}
                        <button
                          onClick={() => toggleInBag(product)}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                            inBag
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100"
                          }`}
                        >
                          {inBag ? "✓ Added to Inquiry List" : "Add to Inquiry List"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* FLOATING INQUIRY MODAL (BAG SLIDEOVER) */}
      {isBagOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-8 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-900">Your Inquiry List</h3>
                <button
                  onClick={() => setIsBagOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
                >
                  ✕
                </button>
              </div>

              {bag.length === 0 ? (
                <div className="text-center py-20">
                  <span className="text-4xl block mb-4">🛒</span>
                  <p className="text-slate-400 text-sm font-semibold">Your inquiry list is empty</p>
                  <p className="text-xs text-slate-300 mt-2">Add items from the catalog to submit a quote request.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                  {bag.map((item) => {
                    const itemId = item.id || item.ID;
                    return (
                      <div key={itemId} className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h5 className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</h5>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">{item.subject} • {item.category}</p>
                          <span className="text-xs font-black text-slate-900">₹{(item.price || 0).toLocaleString("en-IN")}</span>
                        </div>
                        <button
                          onClick={() => toggleInBag(item)}
                          className="text-xs text-red-500 font-bold self-center hover:underline px-2"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {bag.length > 0 && (
              <div className="pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-bold text-slate-500">Total Items:</span>
                  <span className="text-lg font-black text-indigo-600">{bag.length} items</span>
                </div>

                {inquirySuccess ? (
                  <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 text-center font-bold text-sm">
                    🎉 Quote Inquiry Sent Successfully! Our staff will email you details shortly.
                  </div>
                ) : (
                  <form onSubmit={handleSendInquiry} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        School Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Balaghat Public School"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-indigo-500 transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Contact Email / Phone
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. principal@school.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-indigo-500 transition"
                        required
                      />
                    </div>
                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition text-xs shadow-lg shadow-indigo-100">
                      Submit Official Quote Request
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
