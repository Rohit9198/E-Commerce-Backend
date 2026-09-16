import React, { useEffect, useState } from "react";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowRight,
  ExternalLink,
  MapPin,
  Calendar,
  CreditCard,
  Copy,
  Check,
  ShoppingBag,
  RotateCcw,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchMyOrders, deletePendingOrder } from "../store/slices/orderSlice";
import { toggleAuthPopup } from "../store/slices/popupSlice";
import { toast } from "react-toastify";

const Orders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { authUser } = useSelector((state) => state.auth);
  const { myOrders, fetchingOrders, deletingOrder } = useSelector(
    (state) => state.order || { myOrders: [], fetchingOrders: false, deletingOrder: false }
  );

  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrders, setExpandedOrders] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    if (authUser) {
      dispatch(fetchMyOrders());
    }
  }, [dispatch, authUser]);

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handleCopyOrderId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.info("Order ID copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCancelOrder = (orderId) => {
    setConfirmDeleteId(orderId);
  };

  const handleConfirmCancel = () => {
    if (confirmDeleteId) {
      dispatch(deletePendingOrder(confirmDeleteId));
      setConfirmDeleteId(null);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || "Processing").toLowerCase();
    switch (s) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle className="w-3.5 h-3.5" />
            Delivered
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-500 border border-sky-500/20">
            <Truck className="w-3.5 h-3.5" />
            Shipped
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      case "processing":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5 animate-spin-slow" />
            Processing
          </span>
        );
    }
  };

  const getOrderProgressStep = (status) => {
    const s = (status || "Processing").toLowerCase();
    if (s === "cancelled") return -1;
    if (s === "delivered") return 3;
    if (s === "shipped") return 2;
    return 1; // Processing
  };

  const filterTabs = [
    { label: "All", count: myOrders?.length || 0 },
    {
      label: "Processing",
      count:
        myOrders?.filter(
          (o) => (o.order_status || "Processing").toLowerCase() === "processing"
        ).length || 0,
    },
    {
      label: "Shipped",
      count:
        myOrders?.filter(
          (o) => (o.order_status || "").toLowerCase() === "shipped"
        ).length || 0,
    },
    {
      label: "Delivered",
      count:
        myOrders?.filter(
          (o) => (o.order_status || "").toLowerCase() === "delivered"
        ).length || 0,
    },
    {
      label: "Cancelled",
      count:
        myOrders?.filter(
          (o) => (o.order_status || "").toLowerCase() === "cancelled"
        ).length || 0,
    },
  ];

  const filteredOrders = (myOrders || []).filter((order) => {
    const status = (order.order_status || "Processing").toLowerCase();
    if (
      selectedFilter !== "All" &&
      status !== selectedFilter.toLowerCase()
    ) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = (order.id || "").toLowerCase().includes(q);
      const matchItem = order.order_items?.some((item) =>
        (item.title || "").toLowerCase().includes(q)
      );
      return matchId || matchItem;
    }

    return true;
  });

  // If user is not logged in
  if (!authUser) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-background flex items-center justify-center px-4">
        <div className="glass-panel max-w-md w-full p-8 rounded-2xl text-center border border-border/60 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Sign In to View Orders
          </h2>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            Please log in to your account to view your complete order history,
            shipment tracking, and receipts.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => dispatch(toggleAuthPopup())}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all shadow-md"
            >
              Sign In / Register
            </button>
            <button
              onClick={() => navigate("/products")}
              className="w-full py-3 border border-border/80 text-foreground font-medium rounded-xl hover:bg-secondary transition-all"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      {/* CONFIRM CANCEL MODAL */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="glass-card max-w-sm w-full p-6 rounded-2xl border border-border/60 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground text-center mb-1">
              Cancel Order?
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              This will permanently delete your pending order. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-border/60 text-sm font-semibold text-foreground hover:bg-secondary transition-all"
              >
                Keep Order
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={deletingOrder}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deletingOrder ? (
                  <RotateCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              My Orders
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track, view details, and manage your past purchases
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch(fetchMyOrders())}
              disabled={fetchingOrders}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-border/60 bg-secondary/50 hover:bg-secondary text-foreground transition-all"
            >
              <RotateCcw
                className={`w-3.5 h-3.5 ${
                  fetchingOrders ? "animate-spin" : ""
                }`}
              />
              Refresh Orders
            </button>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          {/* STATUS TABS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {filterTabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setSelectedFilter(tab.label)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 flex items-center gap-2 border ${
                  selectedFilter === tab.label
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-secondary/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    selectedFilter === tab.label
                      ? "bg-black/20 text-white"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* SEARCH BOX */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID or Product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-secondary/40 border border-border/60 rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>
        </div>

        {/* ORDERS CONTENT */}
        {fetchingOrders ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass-card p-6 rounded-2xl border border-border/60 animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-secondary rounded w-1/3"></div>
                  <div className="h-5 bg-secondary rounded w-20"></div>
                </div>
                <div className="h-16 bg-secondary/50 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-2xl border border-border/60 p-8 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-secondary/80 flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              {searchQuery || selectedFilter !== "All"
                ? "No matching orders found"
                : "No orders placed yet"}
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              {searchQuery || selectedFilter !== "All"
                ? "Try clearing filters or search terms."
                : "When you purchase products, your orders will show up here."}
            </p>
            {searchQuery || selectedFilter !== "All" ? (
              <button
                onClick={() => {
                  setSelectedFilter("All");
                  setSearchQuery("");
                }}
                className="px-4 py-2 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded-xl transition-all"
              >
                Reset Filters
              </button>
            ) : (
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:opacity-90 transition-all shadow-md"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const isExpanded = !!expandedOrders[order.id];
              const orderDate = order.created_at
                ? new Date(order.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Recent";

              const items = Array.isArray(order.order_items)
                ? order.order_items
                : [];
              const shipping = order.shipping_info || {};
              const progressStep = getOrderProgressStep(order.order_status);
              const isPaymentPending = !order.paid_at;

              return (
                <div
                  key={order.id}
                  className="glass-card rounded-2xl border border-border/60 overflow-hidden shadow-sm transition-all hover:border-border"
                >
                  {/* ORDER CARD HEADER */}
                  <div className="p-5 sm:p-6 bg-secondary/20 border-b border-border/50 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-foreground">
                          Order #{order.id?.slice(0, 8)}...
                        </span>
                        <button
                          onClick={() => handleCopyOrderId(order.id)}
                          className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                          title="Copy full Order ID"
                        >
                          {copiedId === order.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {getStatusBadge(order.order_status)}
                        {order.paid_at ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Payment Pending
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Placed on {orderDate}
                        </span>
                        <span>•</span>
                        <span>
                          {items.length} {items.length === 1 ? "Item" : "Items"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[11px] text-muted-foreground">
                          Total Amount
                        </p>
                        <p className="text-lg font-bold text-primary">
                          ${Number(order.total_price || 0).toFixed(2)}
                        </p>
                      </div>

                      {/* Cancel button — only for payment-pending orders */}
                      {isPaymentPending && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={deletingOrder}
                          title="Cancel this pending order"
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition-all flex items-center gap-1 text-xs font-medium disabled:opacity-60"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Cancel</span>
                        </button>
                      )}

                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-all flex items-center gap-1 text-xs font-medium"
                      >
                        <span>{isExpanded ? "Hide" : "Details"}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ORDER TRACKING TIMELINE */}
                  {progressStep >= 0 && (
                    <div className="px-6 py-4 bg-secondary/10 border-b border-border/40">
                      <div className="grid grid-cols-3 gap-2 relative">
                        {/* Track bar background */}
                        <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-border/60 -z-0"></div>
                        <div
                          className="absolute top-3.5 left-6 h-0.5 bg-primary transition-all duration-500 -z-0"
                          style={{
                            width: `${((progressStep - 1) / 2) * 100}%`,
                          }}
                        ></div>

                        {/* Step 1: Processing */}
                        <div className="flex flex-col items-center text-center relative z-10">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              progressStep >= 1
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-secondary border border-border text-muted-foreground"
                            }`}
                          >
                            <Package className="w-3.5 h-3.5" />
                          </div>
                          <span
                            className={`text-[11px] font-semibold mt-1.5 ${
                              progressStep >= 1
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            Processing
                          </span>
                        </div>

                        {/* Step 2: Shipped */}
                        <div className="flex flex-col items-center text-center relative z-10">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              progressStep >= 2
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-secondary border border-border text-muted-foreground"
                            }`}
                          >
                            <Truck className="w-3.5 h-3.5" />
                          </div>
                          <span
                            className={`text-[11px] font-semibold mt-1.5 ${
                              progressStep >= 2
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            Shipped
                          </span>
                        </div>

                        {/* Step 3: Delivered */}
                        <div className="flex flex-col items-center text-center relative z-10">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              progressStep >= 3
                                ? "bg-emerald-500 text-white shadow-sm"
                                : "bg-secondary border border-border text-muted-foreground"
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </div>
                          <span
                            className={`text-[11px] font-semibold mt-1.5 ${
                              progressStep >= 3
                                ? "text-emerald-500"
                                : "text-muted-foreground"
                            }`}
                          >
                            Delivered
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ORDER ITEMS LIST */}
                  <div className="p-5 sm:p-6 divide-y divide-border/40">
                    {items.map((item, idx) => {
                      const itemImg = item.image || "/avatar-holder.avif";
                      const itemPrice = Number(item.price || 0);
                      const itemQty = Number(item.quantity || 1);

                      return (
                        <div
                          key={item.order_item_id || idx}
                          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                            idx > 0 ? "pt-4" : ""
                          } ${idx < items.length - 1 ? "pb-4" : ""}`}
                        >
                          <div className="flex items-center space-x-4">
                            <img
                              src={itemImg}
                              alt={item.title || "Product"}
                              onError={(e) => {
                                e.currentTarget.src = "/avatar-holder.avif";
                              }}
                              className="w-16 h-16 object-cover rounded-xl bg-secondary flex-shrink-0 border border-border/40"
                            />
                            <div>
                              <h4 className="font-semibold text-foreground text-sm line-clamp-1">
                                {item.title || "Product Item"}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Qty: {itemQty} × ${itemPrice.toFixed(2)}
                              </p>
                              {item.product_id && (
                                <Link
                                  to={`/product/${item.product_id}`}
                                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-1 font-medium"
                                >
                                  <span>View Product</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              )}
                            </div>
                          </div>

                          <div className="text-right sm:self-center font-semibold text-sm text-foreground">
                            ${(itemPrice * itemQty).toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* EXPANDABLE DETAILS: SHIPPING & PRICE BREAKDOWN */}
                  {isExpanded && (
                    <div className="px-5 pb-6 sm:px-6 pt-2 bg-secondary/10 border-t border-border/40 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* SHIPPING INFO */}
                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          Delivery Address
                        </h5>
                        <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/50 text-xs space-y-1 text-muted-foreground">
                          <p className="font-semibold text-foreground">
                            {shipping.full_name || authUser?.name || "Recipient"}
                          </p>
                          <p>{shipping.address || "No address provided"}</p>
                          <p>
                            {[shipping.city, shipping.state, shipping.pincode]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                          <p>{shipping.country || ""}</p>
                          {shipping.phone && (
                            <p className="pt-1 text-[11px]">
                              Phone: {shipping.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* SUMMARY BREAKDOWN */}
                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-primary" />
                          Payment & Summary
                        </h5>
                        <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/50 text-xs space-y-2">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Items Subtotal</span>
                            <span>
                              $
                              {Math.max(
                                0,
                                Number(order.total_price || 0) -
                                  Number(order.tax_price || 0) -
                                  Number(order.shipping_price || 0)
                              ).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Tax (18%)</span>
                            <span>
                              ${Number(order.tax_price || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Shipping Fee</span>
                            <span>
                              {Number(order.shipping_price || 0) === 0
                                ? "Free"
                                : `$${Number(order.shipping_price).toFixed(2)}`}
                            </span>
                          </div>
                          <div className="border-t border-border/60 pt-2 flex justify-between font-bold text-foreground text-sm">
                            <span>Total Paid</span>
                            <span className="text-primary">
                              ${Number(order.total_price || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
