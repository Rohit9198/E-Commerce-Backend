import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { placeNewOrder, verifyRazorpayPayment } from "../store/slices/orderSlice";
import { clearCart } from "../store/slices/cartSlice";
import { toggleAuthPopup } from "../store/slices/popupSlice";
import { getImageUrl, handleImageError } from "../utils/imageHelper";
import PaymentForm from "../components/PaymentForm";
import { toast } from "react-toastify";

// Helper to dynamically load the Razorpay checkout script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Payment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { authUser } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart || { cart: [] });
  const { placingOrder, verifyingPayment } = useSelector(
    (state) => state.order || {}
  );

  const [currentStep, setCurrentStep] = useState(1); // 1: Shipping, 2: Review & Pay, 3: Success
  const [isRazorpayLoading, setIsRazorpayLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Selected Payment Method & Sub-options
  const [selectedMethod, setSelectedMethod] = useState("upi"); // 'upi' | 'card' | 'netbanking' | 'wallet'
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("");

  // Form State for Shipping Details
  const [shippingData, setShippingData] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const [formErrors, setFormErrors] = useState({});

  // Auto-populate user name / details if available
  useEffect(() => {
    if (authUser) {
      setShippingData((prev) => ({
        ...prev,
        full_name: prev.full_name || authUser.name || "",
        phone: prev.phone || authUser.phone || "",
      }));
    }
  }, [authUser]);

  // Price Calculations
  const itemsTotal = (cart || []).reduce(
    (sum, item) =>
      sum + (Number(item.product?.price) || 0) * (item.quantity || 1),
    0
  );
  const taxPrice = Math.round(itemsTotal * 0.18);
  const shippingPrice = itemsTotal >= 50 || itemsTotal === 0 ? 0 : 2;
  const grandTotal = Math.round(itemsTotal + taxPrice + shippingPrice);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateShippingForm = () => {
    const errors = {};
    if (!shippingData.full_name.trim()) errors.full_name = "Full Name is required";
    if (!shippingData.phone.trim()) errors.phone = "Phone number is required";
    else if (shippingData.phone.replace(/\D/g, "").length < 10)
      errors.phone = "Enter a valid 10-digit phone number";
    if (!shippingData.address.trim()) errors.address = "Street address is required";
    if (!shippingData.city.trim()) errors.city = "City is required";
    if (!shippingData.state.trim()) errors.state = "State is required";
    if (!shippingData.pincode.trim()) errors.pincode = "Pincode is required";
    if (!shippingData.country.trim()) errors.country = "Country is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToReview = (e) => {
    e.preventDefault();
    if (!validateShippingForm()) {
      toast.warn("Please fill in all required shipping fields.");
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleInitiateRazorpayPayment = async () => {
    if (!authUser) {
      dispatch(toggleAuthPopup());
      return;
    }

    if (!cart || cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setIsRazorpayLoading(true);

    // 1. Ensure Razorpay checkout script is loaded
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      toast.error("Failed to load Razorpay gateway. Check your internet connection.");
      setIsRazorpayLoading(false);
      return;
    }

    try {
      // 2. Prepare order payload
      const orderPayload = {
        full_name: shippingData.full_name,
        phone: shippingData.phone,
        address: shippingData.address,
        city: shippingData.city,
        state: shippingData.state,
        pincode: shippingData.pincode,
        country: shippingData.country,
        orderedItems: cart.map((item) => ({
          product: {
            id: item.product?.id || item.product?._id,
            price: Number(item.product?.price) || 0,
            images: item.product?.images,
          },
          quantity: item.quantity,
        })),
      };

      // 3. Dispatch placeNewOrder to create order in DB and get Razorpay order ID
      const orderResultAction = await dispatch(placeNewOrder(orderPayload));

      if (placeNewOrder.rejected.match(orderResultAction)) {
        setIsRazorpayLoading(false);
        return;
      }

      const orderData = orderResultAction.payload;
      const razorpayOrderId = orderData?.paymentIntent;
      const finalAmount = orderData?.total_price || grandTotal;
      const createdOrderId = orderData?.orderId;

      if (!razorpayOrderId) {
        toast.error("Failed to initiate payment session. Please try again.");
        setIsRazorpayLoading(false);
        return;
      }

      // 4. Configure Razorpay checkout options
      const options = {
        key:
          import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TaGifsqDqHgtkr",
        amount: Math.round(Number(finalAmount) * 100), // amount in paise
        currency: "INR",
        name: "E-Commerce Store",
        description: "Order Checkout Payment",
        image: "/vite.svg",
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // 5. Verify payment signature on backend
            const verifyAction = await dispatch(
              verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
            );

            if (verifyRazorpayPayment.fulfilled.match(verifyAction)) {
              dispatch(clearCart());
              setCompletedOrder({
                orderId:
                  verifyAction.payload?.orderId ||
                  createdOrderId ||
                  razorpayOrderId,
                paymentId: response.razorpay_payment_id,
                amount: finalAmount,
                itemsCount: cart.length,
              });
              setCurrentStep(3); // Success Screen
              window.scrollTo({ top: 0, behavior: "smooth" });
              toast.success("Payment successful!");
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            toast.error("Payment verification failed. Please contact support.");
          } finally {
            setIsRazorpayLoading(false);
          }
        },
        prefill: {
          name: shippingData.full_name || authUser?.name || "",
          email: authUser?.email || "",
          contact: shippingData.phone || "",
          method: selectedMethod,
          ...(selectedMethod === "upi" && upiId ? { vpa: upiId } : {}),
          ...(selectedMethod === "netbanking" && selectedBank
            ? { bank: selectedBank }
            : {}),
          ...(selectedMethod === "wallet" && selectedWallet
            ? { wallet: selectedWallet }
            : {}),
        },
        notes: {
          address: `${shippingData.address}, ${shippingData.city}, ${shippingData.state} - ${shippingData.pincode}`,
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay using UPI / QR Code",
                instruments: [
                  {
                    method: "upi",
                    flows: ["qr", "intent", "collect"],
                    apps: ["google_pay", "phonepe", "paytm", "bhim"],
                  },
                ],
              },
              other: {
                name: "Cards, Net Banking & Wallets",
                instruments: [
                  { method: "card" },
                  { method: "netbanking" },
                  { method: "wallet" },
                ],
              },
            },
            sequence: ["block.upi", "block.other"],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        theme: {
          color: "#3b82f6",
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled.");
            setIsRazorpayLoading(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", function (response) {
        console.error("Razorpay Payment Failed:", response);
        toast.error(
          response.error?.description || "Payment failed. Please try again."
        );
        setIsRazorpayLoading(false);
      });

      razorpayInstance.open();
    } catch (error) {
      console.error("Razorpay Error:", error);
      toast.error(error?.message || "An error occurred while processing payment.");
      setIsRazorpayLoading(false);
    }
  };

  // 1. Guest / Unauthenticated State
  if (!authUser) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-background flex items-center justify-center px-4">
        <div className="glass-panel max-w-md w-full p-8 rounded-2xl text-center border border-border/60 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Sign In to Checkout
          </h2>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            Please log in or create an account to enter your shipping details and
            complete your secure Razorpay checkout.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => dispatch(toggleAuthPopup())}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all shadow-md"
            >
              Sign In / Register
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="w-full py-3 border border-border/80 text-foreground font-medium rounded-xl hover:bg-secondary transition-all"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Order Success Screen (Step 3)
  if (currentStep === 3 && completedOrder) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-background flex items-center justify-center px-4">
        <div className="glass-panel max-w-lg w-full p-8 rounded-3xl text-center border border-border/60 shadow-2xl space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto animate-bounce-in">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Payment Successful
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Order Confirmed!
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Thank you for your purchase. We have received your payment via
              Razorpay and your order is being processed.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 text-left space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID:</span>
              <span className="font-mono font-bold text-foreground">
                {completedOrder.orderId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment ID:</span>
              <span className="font-mono text-muted-foreground">
                {completedOrder.paymentId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Paid:</span>
              <span className="font-bold text-primary">
                ${Number(completedOrder.amount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery To:</span>
              <span className="font-medium text-foreground truncate max-w-[200px]">
                {shippingData.full_name}, {shippingData.city}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigate("/orders")}
              className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
            >
              <Package className="w-4 h-4" />
              <span>View My Orders</span>
            </button>
            <Link
              to="/products"
              className="w-full py-3 border border-border/80 text-foreground font-semibold rounded-xl hover:bg-secondary transition-all flex items-center justify-center gap-2 text-sm block text-center"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Empty Cart Fallback
  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-background flex items-center justify-center px-4">
        <div className="glass-panel max-w-md w-full p-8 rounded-2xl text-center border border-border/60 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-secondary/80 text-muted-foreground flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground text-sm">
              Please add items to your cart before proceeding to checkout.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all shadow-md text-sm"
          >
            <span>Explore Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* TOP HEADER & BREADCRUMB */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shopping Cart
            </Link>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Checkout & Payment
            </h1>
          </div>

          {/* STEP INDICATOR */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                currentStep === 1
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-secondary/60 text-foreground border-border/60"
              }`}
            >
              <span>1</span>
              <span>Shipping</span>
            </div>
            <div className="w-4 h-0.5 bg-border/80"></div>
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                currentStep === 2
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-secondary/40 text-muted-foreground border-border/60"
              }`}
            >
              <span>2</span>
              <span>Payment</span>
            </div>
          </div>
        </div>

        {/* MAIN GRID CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: FORMS / REVIEW */}
          <div className="lg:col-span-7 space-y-6">
            {currentStep === 1 ? (
              /* STEP 1: SHIPPING ADDRESS FORM */
              <div className="glass-card p-6 sm:p-8 rounded-2xl border border-border/60 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Shipping Details
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>

                <form onSubmit={handleProceedToReview} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="full_name"
                        value={shippingData.full_name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className={`w-full pl-10 pr-4 py-2.5 bg-secondary/30 border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors ${
                          formErrors.full_name
                            ? "border-red-500"
                            : "border-border/60"
                        }`}
                      />
                    </div>
                    {formErrors.full_name && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {formErrors.full_name}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        name="phone"
                        value={shippingData.phone}
                        onChange={handleInputChange}
                        placeholder="9876543210"
                        className={`w-full pl-10 pr-4 py-2.5 bg-secondary/30 border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors ${
                          formErrors.phone
                            ? "border-red-500"
                            : "border-border/60"
                        }`}
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {formErrors.phone}
                      </p>
                    )}
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Street Address / House No. *
                    </label>
                    <textarea
                      name="address"
                      rows={2}
                      value={shippingData.address}
                      onChange={handleInputChange}
                      placeholder="Apartment, Studio, or Floor number, Street address"
                      className={`w-full p-3 bg-secondary/30 border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none ${
                        formErrors.address
                          ? "border-red-500"
                          : "border-border/60"
                      }`}
                    />
                    {formErrors.address && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {formErrors.address}
                      </p>
                    )}
                  </div>

                  {/* City & State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingData.city}
                        onChange={handleInputChange}
                        placeholder="Mumbai"
                        className={`w-full px-3.5 py-2.5 bg-secondary/30 border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors ${
                          formErrors.city
                            ? "border-red-500"
                            : "border-border/60"
                        }`}
                      />
                      {formErrors.city && (
                        <p className="text-[11px] text-red-500 mt-1">
                          {formErrors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={shippingData.state}
                        onChange={handleInputChange}
                        placeholder="Maharashtra"
                        className={`w-full px-3.5 py-2.5 bg-secondary/30 border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors ${
                          formErrors.state
                            ? "border-red-500"
                            : "border-border/60"
                        }`}
                      />
                      {formErrors.state && (
                        <p className="text-[11px] text-red-500 mt-1">
                          {formErrors.state}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Pincode & Country */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Postal / Pincode *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={shippingData.pincode}
                        onChange={handleInputChange}
                        placeholder="400001"
                        className={`w-full px-3.5 py-2.5 bg-secondary/30 border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors ${
                          formErrors.pincode
                            ? "border-red-500"
                            : "border-border/60"
                        }`}
                      />
                      {formErrors.pincode && (
                        <p className="text-[11px] text-red-500 mt-1">
                          {formErrors.pincode}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Country *
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={shippingData.country}
                        onChange={handleInputChange}
                        placeholder="India"
                        className={`w-full px-3.5 py-2.5 bg-secondary/30 border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors ${
                          formErrors.country
                            ? "border-red-500"
                            : "border-border/60"
                        }`}
                      />
                      {formErrors.country && (
                        <p className="text-[11px] text-red-500 mt-1">
                          {formErrors.country}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                      <span>Continue to Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* STEP 2: REVIEW & PAY WITH RAZORPAY */
              <div className="space-y-6">
                {/* Shipping Summary Card */}
                <div className="glass-card p-5 rounded-2xl border border-border/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <Truck className="w-4 h-4 text-primary" />
                      Deliver to:
                    </h4>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Edit Address
                    </button>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5 pl-6">
                    <p className="font-semibold text-foreground">
                      {shippingData.full_name} • {shippingData.phone}
                    </p>
                    <p>{shippingData.address}</p>
                    <p>
                      {shippingData.city}, {shippingData.state} - {shippingData.pincode}
                    </p>
                    <p>{shippingData.country}</p>
                  </div>
                </div>

                {/* Razorpay Component */}
                <div className="glass-card p-6 sm:p-8 rounded-2xl border border-border/60 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        Razorpay Payment Gateway
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Fast, secure & encrypted checkout in Indian Rupees (INR)
                      </p>
                    </div>
                  </div>

                  <PaymentForm
                    totalAmount={grandTotal}
                    selectedMethod={selectedMethod}
                    setSelectedMethod={setSelectedMethod}
                    upiId={upiId}
                    setUpiId={setUpiId}
                    userPhone={shippingData.phone}
                    selectedBank={selectedBank}
                    setSelectedBank={setSelectedBank}
                    selectedWallet={selectedWallet}
                    setSelectedWallet={setSelectedWallet}
                  />

                  <div className="space-y-3 pt-2">
                    <button
                      onClick={handleInitiateRazorpayPayment}
                      disabled={isRazorpayLoading || placingOrder || verifyingPayment}
                      className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all shadow-xl flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer"
                    >
                      {isRazorpayLoading || placingOrder || verifyingPayment ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Connecting to Razorpay...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>
                            Pay ${grandTotal.toFixed(2)} via{" "}
                            {selectedMethod === "card"
                              ? "Cards"
                              : selectedMethod === "netbanking"
                              ? "Net Banking"
                              : selectedMethod === "wallet"
                              ? "Wallet"
                              : "UPI"}{" "}
                            with Razorpay
                          </span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setCurrentStep(1)}
                      disabled={isRazorpayLoading}
                      className="w-full py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors text-center cursor-pointer"
                    >
                      ← Back to Shipping Details
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY SIDEBAR */}
          <div className="lg:col-span-5">
            <div className="glass-card p-6 rounded-2xl border border-border/60 sticky top-24 space-y-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <h3 className="font-bold text-foreground text-base">
                  Order Summary
                </h3>
                <span className="text-xs text-muted-foreground">
                  {cart.length} {cart.length === 1 ? "Item" : "Items"}
                </span>
              </div>

              {/* Items List Mini */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-border/30">
                {cart.map((item, idx) => {
                  const product = item.product || {};
                  const img = getImageUrl(product);
                  const price = Number(product.price || 0);
                  const qty = item.quantity || 1;

                  return (
                    <div
                      key={product.id || product._id || idx}
                      className={`flex items-center gap-3 ${
                        idx > 0 ? "pt-3" : ""
                      }`}
                    >
                      <img
                        src={img}
                        alt={product.name || "Product"}
                        onError={handleImageError}
                        className="w-12 h-12 rounded-lg object-cover bg-secondary flex-shrink-0 border border-border/40"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {product.name || "Product Item"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Qty: {qty} × ${price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right text-xs font-bold text-foreground">
                        ${(price * qty).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 border-t border-border/50 pt-4 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${itemsTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated Tax (18%)</span>
                  <span>${taxPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>
                    {shippingPrice === 0 ? (
                      <span className="text-emerald-500 font-semibold">Free</span>
                    ) : (
                      `$${shippingPrice.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="border-t border-border/60 pt-3 flex justify-between font-bold text-sm text-foreground">
                  <span>Total Due</span>
                  <span className="text-primary text-base">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/50 flex items-center gap-3 text-xs text-muted-foreground">
                <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <p className="text-[11px] leading-tight">
                  Guaranteed safe checkout powered by Razorpay API.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;