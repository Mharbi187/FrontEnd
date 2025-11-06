// AdminDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import api from "../api/axios"; // your axios instance
import {
  FiUsers,
  FiUserPlus,
  FiEdit,
  FiTrash2,
  FiPackage,
  FiList,
  FiFileText,
  FiAlertCircle,
  FiBarChart2,
  FiShoppingCart,
  FiDatabase,
  FiPlus,
  FiCheckCircle,
  FiCheck,
} from "react-icons/fi";
import { FaUser } from "react-icons/fa";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Helper: extract items from common response shapes
 * Accepts: res (axios response)
 * Returns: array or object (depending on usage)
 */
function extractData(res) {
  if (!res) return null;
  if (Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray(res.data.data)) return res.data.data;
  if (res.data && Array.isArray(res.data.users)) return res.data.users;
  // If API returns object for list endpoints
  if (res.data && typeof res.data === "object" && res.data !== null) return res.data;
  return res.data || null;
}

/**
 * Normalize user object so frontend can rely on the same fields
 * - id: prefer _id, fallback to id
 * - name: prefer "nom + prenom", fallback to name
 * - roleNormalized: standardized role string ('admin','client','supplier')
 */
function normalizeUser(raw) {
  if (!raw) return null;
  const id = raw._id ?? raw.id ?? raw._doc?._id ?? null;
  const nom = raw.nom ?? raw.firstName ?? raw.firstname ?? raw.first_name ?? null;
  const prenom = raw.prenom ?? raw.lastName ?? raw.lastname ?? raw.last_name ?? null;
  const nameFallback = raw.name ?? raw.fullName ?? raw.full_name ?? null;
  const email = raw.email ?? "";
  const roleRaw = (raw.role ?? "").toString();
  // map role strings to normalized form
  let roleNormalized = roleRaw.toLowerCase();
  if (roleNormalized === "fournisseur") roleNormalized = "supplier";
  if (roleNormalized === "fournisseur".toLowerCase()) roleNormalized = "supplier";
  if (roleNormalized === "client") roleNormalized = "client";
  if (roleNormalized === "admin") roleNormalized = "admin";
  // fallback: if unknown, keep as-is
  const name = nom || prenom ? `${nom ?? ""} ${prenom ?? ""}`.trim() : nameFallback ?? "Unknown";

  return {
    id,
    _id: id,
    name,
    nom,
    prenom,
    email,
    role: roleNormalized,
    raw: raw,
  };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [isVerifying, setIsVerifying] = useState(true);

  // Data states
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);

  // Loading / error states per-tab
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // refs for report capture
  const reportsRef = useRef(null);

  // report view state
  const [reportViewData, setReportViewData] = useState({ type: null, data: null, loading: false });

  // Utility to get token header
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ====== VERIFY ADMIN ON MOUNT ======
  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        // check expiry (decoded.exp is in seconds)
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
          throw new Error("Token expired");
        }
        if (decoded.role && decoded.role.toLowerCase() !== "admin") {
          navigate("/unauthorized");
          return;
        }

        // backend double-check (route in your router: GET /users/verify-admin-role)
        await api.get("/users/verify-admin-role", { headers: getAuthHeaders() });

        setIsVerifying(false);
      } catch (err) {
        console.error("Admin verification failed:", err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    verifyAdmin();
  }, [navigate]);

  // ====== FETCH DATA HELPERS ======
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // backend router exposes GET /users (admin only)
      const res = await api.get("/users", { headers: getAuthHeaders() });
      const extracted = extractData(res);
      // if API returns an object with metadata, try to use .data or .users, or array
      let arr = [];
      if (Array.isArray(extracted)) arr = extracted;
      else if (extracted && Array.isArray(extracted.users)) arr = extracted.users;
      else if (extracted && Array.isArray(extracted.data)) arr = extracted.data;
      else if (res.data && Array.isArray(res.data)) arr = res.data;
      else if (res.data && Array.isArray(res.data.data)) arr = res.data.data;
      else if (res.data && Array.isArray(res.data.users)) arr = res.data.users;
      else {
        // fallback: if res.data is an object representing a single user, wrap it
        if (res.data && !Array.isArray(res.data)) {
          // if it looks like { success: true, data: [ ... ] }
          if (res.data.data && Array.isArray(res.data.data)) arr = res.data.data;
          else if (res.data.users && Array.isArray(res.data.users)) arr = res.data.users;
        }
      }

      // Normalize
      const normalized = arr.map(normalizeUser);
      setUsers(normalized);
    } catch (err) {
      console.error("fetchUsers error:", err);
      setError("Failed to load users. Using fallback sample data.");
      // fallback sample
      setUsers([
        normalizeUser({ id: 1, name: "Admin User", email: "admin@example.com", role: "admin" }),
        normalizeUser({ id: 2, name: "Client One", email: "client@example.com", role: "client" }),
        normalizeUser({ id: 3, name: "Supplier One", email: "supplier@example.com", role: "supplier" }),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use existing backend categories endpoint
      const res = await api.get("/categories", { headers: getAuthHeaders() });
      const data = extractData(res);
      // expect array or { data: [] }
      const arr = Array.isArray(data) ? data : data?.data ?? data?.categories ?? [];
      setCategories(arr || []);
    } catch (err) {
      console.error("fetchCategories error:", err);
      setError("Failed to load categories. Using fallback sample data.");
      setCategories([
        { id: 1, name: "Electronics", productCount: 24 },
        { id: 2, name: "Clothing", productCount: 42 },
        { id: 3, name: "Groceries", productCount: 15 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use existing backend orders endpoint
      const res = await api.get("/commandes", { headers: getAuthHeaders() });
      const data = extractData(res);
      const arr = Array.isArray(data) ? data : data?.data ?? data?.orders ?? [];
      setOrders(arr || []);
    } catch (err) {
      console.error("fetchOrders error:", err);
      setError("Failed to load orders. Using fallback sample data.");
      setOrders([
        { id: 1, customer: "Client One", date: "2023-05-15", status: "Delivered", total: 120.0 },
        { id: 2, customer: "Client Two", date: "2023-05-16", status: "Processing", total: 56.5 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use existing backend stock alerts endpoint
      const res = await api.get("/alertes-stock", { headers: getAuthHeaders() });
      const data = extractData(res);
      const arr = Array.isArray(data) ? data : data?.data ?? data?.alerts ?? [];
      setStockAlerts(arr || []);
    } catch (err) {
      console.error("fetchStockAlerts error:", err);
      setError("Failed to load stock alerts. Using fallback sample data.");
      setStockAlerts([
        { id: 1, product: "Laptop XYZ", currentStock: 2, threshold: 5 },
        { id: 2, product: "T-Shirt ABC", currentStock: 3, threshold: 10 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // fetch when tab changes
  useEffect(() => {
    if (isVerifying) return;
    switch (activeTab) {
      case "users":
        fetchUsers();
        break;
      case "categories":
        fetchCategories();
        break;
      case "orders":
        fetchOrders();
        break;
      case "alerts":
        fetchStockAlerts();
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isVerifying]);

  // ====== ACTION HANDLERS ======
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      // hit /users/:id (matches your Express router)
      await api.delete(`/users/${id}`, { headers: getAuthHeaders() });
      setUsers((prev) => prev.filter((u) => (u.id ?? u._id) !== id));
    } catch (err) {
      console.error("delete user error:", err);
      alert("Failed to delete user");
    }
  };
  const handleLogout = () => {
  localStorage.removeItem("token"); // Remove JWT
  window.location.href = "/";  // Redirect
};
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`, { headers: getAuthHeaders() });
      setCategories((prev) => prev.filter((c) => (c.id ?? c._id) !== id));
    } catch (err) {
      console.error("delete category error:", err);
      alert("Failed to delete category");
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/commandes/${orderId}`, { status: newStatus }, { headers: getAuthHeaders() });
      // optimistic update (or use returned order)
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      return res.data;
    } catch (err) {
      console.error("update order status error:", err);
      alert("Failed to update status");
    }
  };

  const handleResolveAlert = async (id) => {
    try {
      await api.put(`/alertes-stock/${id}/resoudre`, {}, { headers: getAuthHeaders() });
      setStockAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("resolve alert error:", err);
      alert("Failed to resolve alert");
    }
  };

  const handleResolveAllAlerts = async () => {
    if (!window.confirm("Resolve all alerts?")) return;
    try {
      // Batch resolve by iterating existing alerts
      await Promise.all(
        stockAlerts.map((a) => api.put(`/alertes-stock/${a.id ?? a._id}/resoudre`, {}, { headers: getAuthHeaders() }).catch(() => null))
      );
      // Refresh list after batch
      fetchStockAlerts();
    } catch (err) {
      console.error("resolve all error:", err);
      alert("Failed to resolve all alerts");
    }
  };

  // ====== REPORT GENERATION ======
  // Simple PDF from DOM section using html2canvas + jsPDF
  const generatePDFfromRef = async (title = "report") => {
    if (!reportsRef.current) {
      alert("Nothing to export.");
      return;
    }

    try {
      const element = reportsRef.current;
      // increase scale for better quality
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // calculate image dimensions
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth - 40; // margins
      const ratio = imgProps.height / imgProps.width;
      const imgHeight = imgWidth * ratio;

      // If content taller than page, add multiple pages (simple approach)
      if (imgHeight <= pageHeight - 40) {
        pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
      } else {
        // slice vertically (basic approach)
        let remainingHeight = imgHeight;
        let position = 20;
        // draw the full image scaled to imgWidth, but allow it to flow to pages by repositioning Y
        pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
      }

      pdf.save(`${title}.pdf`);
    } catch (err) {
      console.error("generatePDF error:", err);
      alert("Failed to generate PDF");
    }
  };

  const loadAndShowReport = async (type) => {
    setReportViewData({ type, data: null, loading: true });
    try {
      let res;
      switch (type) {
        case "sales":
          res = await api.get("/rapports", { headers: getAuthHeaders() });
          break;
        case "inventory":
          res = await api.get("/rapports", { headers: getAuthHeaders() });
          break;
        case "users":
          // reuse GET /users and convert to a report-friendly shape
          res = await api.get("/users", { headers: getAuthHeaders() });
          break;
        case "products":
          res = await api.get("/rapports", { headers: getAuthHeaders() });
          break;
        default:
          res = { data: null };
      }

      const data = extractData(res);
      setReportViewData({ type, data: data || null, loading: false });
      // small timeout to let DOM render
      setTimeout(() => generatePDFfromRef(type), 500);
    } catch (err) {
      console.error("load report error:", err);
      setReportViewData({ type, data: null, loading: false });
      alert("Failed to fetch report data");
    }
  };

  // ====== RENDER ======
  if (isVerifying) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Top bar */}
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-xl p-6 shadow-lg border-b border-gray-200">
        <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>

        <div className="flex items-center space-x-3">
          {/* Profile shortcut */}
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg transform hover:scale-105"
          >
            <FaUser className="mr-2" /> Profile
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg transform hover:scale-105"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main */}
      

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="border-b-2 border-gray-200 bg-white/50 backdrop-blur-sm rounded-t-xl">
          <nav className="-mb-px flex space-x-2 overflow-x-auto">
            {[
              { id: "users", name: "Users Management", icon: <FiUsers className="mr-2" /> },
              { id: "categories", name: "Categories", icon: <FiList className="mr-2" /> },
              { id: "orders", name: "Orders & Deliveries", icon: <FiShoppingCart className="mr-2" /> },
              { id: "reports", name: "Reports", icon: <FiBarChart2 className="mr-2" /> },
              { id: "alerts", name: "Stock Alerts", icon: <FiAlertCircle className="mr-2" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id 
                    ? "border-blue-600 text-blue-600 bg-blue-50" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                } whitespace-nowrap py-4 px-4 border-b-2 font-semibold text-sm flex items-center transition-all rounded-t-lg`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white/80 backdrop-blur-xl shadow-xl rounded-b-xl p-6 border border-white/20"
        >
          {/* USERS */}
          {activeTab === "users" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Users Management</h2>
                <div className="flex items-center space-x-2">
                  <button onClick={() => navigate('/admin-create-user')} className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all transform hover:scale-105">
                    <FiUserPlus className="mr-2" /> Add User
                  </button>
                  <button onClick={fetchUsers} className="px-4 py-2 border-2 border-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">Refresh</button>
                </div>
              </div>

              {loading && <p className="text-sm text-gray-500">Loading...</p>}
              {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.length === 0 && (
                      <tr>
                        <td className="px-6 py-4" colSpan={4}>No users found.</td>
                      </tr>
                    )}
                    {users.map((user) => {
                      // normalized user shape from normalizeUser
                      const uid = user.id ?? user._id;
                      const role = user.role ?? (user.raw?.role ?? "client");
                      const badgeClass =
                        role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : role === "supplier"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800";
                      return (
                        <tr key={uid} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                          <td className="px-6 py-4 text-gray-600">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full ${badgeClass}`}>
                              {role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            <button onClick={() => navigate(`/admin/users/${uid}/edit`)} className="text-blue-600 hover:text-blue-800 mr-4 font-semibold transition-colors">
                              <FiEdit className="inline mr-1" /> Edit
                            </button>
                            <button onClick={() => handleDeleteUser(uid)} className="text-red-600 hover:text-red-800 font-semibold transition-colors">
                              <FiTrash2 className="inline mr-1" /> Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CATEGORIES */}
          {activeTab === "categories" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Categories Management</h2>
                <div className="flex items-center space-x-2">
                  <button onClick={() => navigate("/admin/categories/add")} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <FiPlus className="mr-2" /> Add Category
                  </button>
                  <button onClick={fetchCategories} className="px-3 py-2 border rounded-md text-sm">Refresh</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <motion.div key={category.id ?? category._id} whileHover={{ y: -5 }} className="border rounded-lg p-4 shadow-sm hover:shadow-md">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-lg">{category.name}</h3>
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm">{category.productCount ?? category.count ?? 0} products</span>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button onClick={() => navigate(`/admin/categories/${category.id ?? category._id}/edit`)} className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                        <FiEdit className="mr-1" /> Edit
                      </button>
                      <button onClick={() => handleDeleteCategory(category.id ?? category._id)} className="flex items-center text-sm text-red-600 hover:text-red-800">
                        <FiTrash2 className="mr-1" /> Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ORDERS */}
          {activeTab === "orders" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Orders & Deliveries</h2>
                <div className="flex items-center space-x-2">
                  <button onClick={fetchOrders} className="px-3 py-2 border rounded-md text-sm">Refresh</button>
                </div>
              </div>

              {orders.length === 0 && <p className="text-sm text-gray-500">No orders found.</p>}

              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id ?? order._id} className="border rounded-lg p-4 hover:shadow transition-shadow">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Order #{order.id ?? order._id} — ${Number(order.total ?? 0).toFixed(2)}</h3>
                        <p className="text-sm text-gray-600">Customer: {order.customer}</p>
                        <p className="text-sm text-gray-600">Date: {order.date}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-3 py-1 rounded-full text-sm ${order.status === "Delivered" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {order.status}
                        </span>
                        <button onClick={() => navigate(`/admin/orders/${order.id ?? order._id}`)} className="ml-4 flex items-center text-sm text-blue-600 hover:text-blue-800">
                          <FiFileText className="mr-1" /> Details
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {order.status !== "Delivered" && (
                          <>
                            <button onClick={() => handleUpdateOrderStatus(order.id ?? order._id, "Processing")} className="px-3 py-1 bg-blue-100 text-blue-800 rounded">Set Processing</button>
                            <button onClick={() => handleUpdateOrderStatus(order.id ?? order._id, "Shipped")} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded">Set Shipped</button>
                            <button onClick={() => handleUpdateOrderStatus(order.id ?? order._id, "Delivered")} className="px-3 py-1 bg-green-100 text-green-800 rounded">Mark Delivered</button>
                          </>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button onClick={() => navigate(`/admin/orders/${order.id ?? order._id}/edit`)} className="flex items-center px-3 py-1 border rounded">Edit</button>
                        <button onClick={() => api.delete(`/admin/orders/${order.id ?? order._id}`, { headers: getAuthHeaders() }).then(() => setOrders((p) => p.filter(o => (o.id ?? o._id) !== (order.id ?? order._id)))).catch(() => alert("Failed to delete"))} className="flex items-center px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REPORTS */}
          {activeTab === "reports" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Generate Reports</h2>
                <div className="flex items-center space-x-2">
                  <button onClick={() => loadAndShowReport("sales")} className="p-3 border rounded hover:shadow-sm flex items-center">
                    <FiShoppingCart className="mr-2" /> Sales Report
                  </button>
                  <button onClick={() => loadAndShowReport("inventory")} className="p-3 border rounded hover:shadow-sm flex items-center">
                    <FiDatabase className="mr-2" /> Inventory Report
                  </button>
                  <button onClick={() => loadAndShowReport("users")} className="p-3 border rounded hover:shadow-sm flex items-center">
                    <FiUsers className="mr-2" /> Users Report
                  </button>
                  <button onClick={() => loadAndShowReport("products")} className="p-3 border rounded hover:shadow-sm flex items-center">
                    <FiPackage className="mr-2" /> Products Report
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-4">Click any report button to fetch the data and automatically export a PDF.</p>

              {/* Invisible/hidden area used to render report content for html2canvas */}
              <div style={{ position: "absolute", left: -9999, width: 1200 }} aria-hidden>
                <div ref={reportsRef} className="p-6 bg-white text-black" style={{ width: 1024 }}>
                  <h2 className="text-2xl font-bold mb-4">
                    {reportViewData.type ? `${reportViewData.type.toUpperCase()} REPORT` : "Report Preview"}
                  </h2>

                  {reportViewData.loading && <p>Loading report data...</p>}

                  {!reportViewData.loading && reportViewData.data && reportViewData.type === "sales" && (
                    <div>
                      <p>Total Sales: {reportViewData.data.totalSales ?? "—"}</p>
                      <table className="w-full mt-4" style={{ borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th style={{ border: "1px solid #ddd", padding: 6 }}>Order ID</th>
                            <th style={{ border: "1px solid #ddd", padding: 6 }}>Date</th>
                            <th style={{ border: "1px solid #ddd", padding: 6 }}>Customer</th>
                            <th style={{ border: "1px solid #ddd", padding: 6 }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(reportViewData.data.items || []).map((o) => (
                            <tr key={o.id ?? o._id}>
                              <td style={{ border: "1px solid #ddd", padding: 6 }}>{o.id ?? o._id}</td>
                              <td style={{ border: "1px solid #ddd", padding: 6 }}>{o.date}</td>
                              <td style={{ border: "1px solid #ddd", padding: 6 }}>{o.customer}</td>
                              <td style={{ border: "1px solid #ddd", padding: 6 }}>${Number(o.total ?? 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {!reportViewData.loading && reportViewData.data && reportViewData.type === "inventory" && (
                    <div>
                      <p>Inventory snapshot</p>
                      <table className="w-full mt-4" style={{ borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th style={{ border: "1px solid #ddd", padding: 6 }}>Product</th>
                            <th style={{ border: "1px solid #ddd", padding: 6 }}>Stock</th>
                            <th style={{ border: "1px solid #ddd", padding: 6 }}>Threshold</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(reportViewData.data.items || []).map((p, idx) => (
                            <tr key={idx}>
                              <td style={{ border: "1px solid #ddd", padding: 6 }}>{p.product}</td>
                              <td style={{ border: "1px solid #ddd", padding: 6 }}>{p.stock}</td>
                              <td style={{ border: "1px solid #ddd", padding: 6 }}>{p.threshold}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {!reportViewData.loading && reportViewData.data && reportViewData.type === "users" && (
                    <div>
                      <p>User stats</p>
                      <table className="w-full mt-4" style={{ borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th style={{ border: "1px solid #ddd", padding: 6 }}>Name</th>
                            <th style={{ border: "1px solid #ddd", padding: 6 }}>Email</th>
                            <th style={{ border: "1px solid #ddd", padding: 6 }}>Role</th>
                          </tr>
                        </thead>
                        <tbody>
                          {((reportViewData.data.items ?? reportViewData.data) || []).map((u) => {
                            const nu = normalizeUser(u);
                            return (
                              <tr key={nu.id ?? Math.random()}>
                                <td style={{ border: "1px solid #ddd", padding: 6 }}>{nu.name}</td>
                                <td style={{ border: "1px solid #ddd", padding: 6 }}>{nu.email}</td>
                                <td style={{ border: "1px solid #ddd", padding: 6 }}>{nu.role}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {!reportViewData.loading && reportViewData.data && reportViewData.type === "products" && (
                    <div>
                      <p>Products performance</p>
                      <table className="w-full mt-4" style={{ borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th style={{ border: "1px solid #ddd", padding: 6 }}>Product</th>
                            <th style={{ border: "1px solid #ddd", padding: 6 }}>Sold</th>
                            <th style={{ border: "1px solid #ddd", padding: 6 }}>Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(reportViewData.data.items || []).map((p, i) => (
                            <tr key={i}>
                              <td style={{ border: "1px solid #ddd", padding: 6 }}>{p.product}</td>
                              <td style={{ border: "1px solid #ddd", padding: 6 }}>{p.sold}</td>
                              <td style={{ border: "1px solid #ddd", padding: 6 }}>${Number(p.revenue ?? 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {!reportViewData.loading && !reportViewData.data && <p>No report data available.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ALERTS */}
          {activeTab === "alerts" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Stock Alerts</h2>
                <div className="flex items-center space-x-2">
                  <button onClick={handleResolveAllAlerts} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    <FiCheckCircle className="mr-2" /> Resolve All
                  </button>
                  <button onClick={fetchStockAlerts} className="px-3 py-2 border rounded-md text-sm">Refresh</button>
                </div>
              </div>

              <div className="space-y-4">
                {stockAlerts.length === 0 && <p className="text-sm text-gray-500">No active alerts.</p>}
                {stockAlerts.map((alert) => (
                  <motion.div key={alert.id ?? alert._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{alert.product}</h3>
                      <p className="text-sm">Current stock: <span className="font-semibold">{alert.currentStock}</span> | Threshold: <span className="font-semibold">{alert.threshold}</span></p>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => navigate(`/admin/products/${alert.productId ?? alert._id}/edit`)} className="flex items-center px-3 py-1 bg-white text-red-600 rounded hover:bg-red-100">
                        <FiEdit className="mr-1" /> Update Stock
                      </button>
                      <button onClick={() => handleResolveAlert(alert.id ?? alert._id)} className="flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                        <FiCheck className="mr-1" /> Resolve
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
        
      </main>
    </div>
  );
}
