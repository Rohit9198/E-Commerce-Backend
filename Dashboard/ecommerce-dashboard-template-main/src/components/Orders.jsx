import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "./Header";
import {
  fetchAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../store/slices/orderSlice";
import {
  Search,
  Trash2,
  Edit2,
  X,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  LoaderCircle,
  ChevronDown,
  AlertTriangle,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";

const STATUS_OPTIONS = ["Processing", "Shipped", "Delivered", "Cancelled"];

const StatusBadge = ({ status }) => {
  const s = (status || "Processing").toLowerCase();
  const config = {
    delivered: {
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      cls: "bg-emerald-100 text-emerald-700 border-emerald-200",
      label: "Delivered",
    },
    shipped: {
      icon: <Truck className="w-3.5 h-3.5" />,
      cls: "bg-blue-100 text-blue-700 border-blue-200",
      label: "Shipped",
    },
    cancelled: {
      icon: <XCircle className="w-3.5 h-3.5" />,
      cls: "bg-red-100 text-red-700 border-red-200",
      label: "Cancelled",
    },
    processing: {
      icon: <Clock className="w-3.5 h-3.5" />,
      cls: "bg-amber-100 text-amber-700 border-amber-200",
      label: "Processing",
    },
  };
  const { icon, cls, label } = config[s] || config.processing;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}
    >
      {icon}
      {label}
    </span>
  );
};

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.order);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Update status modal
  const [updateModal, setUpdateModal] = useState(null); // { orderId, currentStatus }
  const [newStatus, setNewStatus] = useState("");

  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState(null); // orderId

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const filterTabs = [
    { label: "All", count: orders.length },
    ...STATUS_OPTIONS.map((s) => ({
      label: s,
      count: orders.filter(
        (o) => (o.order_status || "Processing").toLowerCase() === s.toLowerCase()
      ).length,
    })),
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      selectedFilter === "All" ||
      (order.order_status || "Processing").toLowerCase() ===
        selectedFilter.toLowerCase();

    if (!matchesFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (order.id || "").toLowerCase().includes(q) ||
        (order.user_name || order.user_email || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const openUpdateModal = (order) => {
    setNewStatus(order.order_status || "Processing");
    setUpdateModal({ orderId: order.id, currentStatus: order.order_status });
  };

  const handleUpdateStatus = () => {
    if (!updateModal || !newStatus) return;
    dispatch(updateOrderStatus(updateModal.orderId, newStatus));
    setUpdateModal(null);
  };

  const handleDelete = () => {
    if (!deleteModal) return;
    dispatch(deleteOrder(deleteModal));
    setDeleteModal(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage and update all customer orders
            </p>
          </div>
          <button
            onClick={() => dispatch(fetchAllOrders())}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Filter Tabs + Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
            {filterTabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setSelectedFilter(tab.label)}
                className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  selectedFilter === tab.label
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    selectedFilter === tab.label
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID or Customer…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <LoaderCircle className="w-8 h-8 animate-spin text-blue-500" />
              <span className="text-sm font-medium">Loading orders…</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <ShoppingCart className="w-10 h-10" />
              <p className="text-sm font-medium">
                {searchQuery || selectedFilter !== "All"
                  ? "No orders match your filters."
                  : "No orders found."}
              </p>
              {(searchQuery || selectedFilter !== "All") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedFilter("All");
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {[
                      "Order ID",
                      "Customer",
                      "Items",
                      "Total",
                      "Payment",
                      "Status",
                      "Placed On",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => {
                    const items = Array.isArray(order.order_items)
                      ? order.order_items
                      : [];
                    const orderDate = order.created_at
                      ? new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—";

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Order ID */}
                        <td className="px-5 py-4 font-mono text-xs text-gray-700 whitespace-nowrap">
                          <span title={order.id}>
                            #{(order.id || "").slice(0, 8).toUpperCase()}…
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-gray-800">
                            {order.user_name || "—"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {order.user_email || ""}
                          </p>
                        </td>

                        {/* Items */}
                        <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1">
                            <Package className="w-3.5 h-3.5 text-gray-400" />
                            {items.length}{" "}
                            {items.length === 1 ? "item" : "items"}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="px-5 py-4 font-semibold text-gray-800 whitespace-nowrap">
                          ₹{Number(order.total_price || 0).toFixed(2)}
                        </td>

                        {/* Payment */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {order.paid_at ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <StatusBadge status={order.order_status} />
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                          {orderDate}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openUpdateModal(order)}
                              title="Update Status"
                              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteModal(order.id)}
                              title="Delete Order"
                              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          {!loading && filteredOrders.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          )}
        </div>
      </div>

      {/* ── UPDATE STATUS MODAL ── */}
      {updateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-800">
                Update Order Status
              </h3>
              <button
                onClick={() => setUpdateModal(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-1">
              Order{" "}
              <span className="font-mono font-semibold text-gray-700">
                #{(updateModal.orderId || "").slice(0, 8).toUpperCase()}…
              </span>
            </p>
            <p className="text-xs text-gray-400 mb-5">
              Current:{" "}
              <span className="font-semibold text-gray-600">
                {updateModal.currentStatus || "Processing"}
              </span>
            </p>

            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              New Status
            </label>
            <div className="relative">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-8 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setUpdateModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <LoaderCircle className="w-4 h-4 animate-spin" />}
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">
              Delete Order?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete order{" "}
              <span className="font-mono font-semibold text-gray-700">
                #{(deleteModal || "").slice(0, 8).toUpperCase()}…
              </span>
              . This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Keep Order
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <LoaderCircle className="w-4 h-4 animate-spin" />}
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
