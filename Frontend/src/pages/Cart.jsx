import { Plus, Minus, Trash2, ArrowRight, ShoppingCart, ShoppingBag, Package } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, updateCartQuantity, clearCart } from "../store/slices/cartSlice";
import { toggleAuthPopup } from "../store/slices/popupSlice";

const getImageUrl = (product) => {
  if (!product) return null;
  const images = product.images || product.image;
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") return first.url || first.secure_url || null;
  }
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const first = parsed[0];
        if (typeof first === "string") return first;
        if (first && typeof first === "object") return first.url || first.secure_url || null;
      }
    } catch {
      if (images.startsWith("http") || images.startsWith("/")) return images;
    }
  }
  if (typeof images === "string" && (images.startsWith("http") || images.startsWith("/"))) {
    return images;
  }
  return null;
};

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector((state) => state.cart);
  const { authUser } = useSelector((state) => state.auth);

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(updateCartQuantity({ id, quantity }));
    }
  };

  const subtotal = (cart || []).reduce((sum, item) => {
    const product = item.product || item || {};
    const price = Number(product.price ?? item.price ?? 0);
    const qty = Number(item.quantity) || 1;
    return sum + (isNaN(price) ? 0 : price) * qty;
  }, 0);

  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 10;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + (subtotal > 0 ? shipping + tax : 0);

  const handleCheckout = () => {
    if (!authUser) {
      dispatch(toggleAuthPopup());
    } else {
      navigate("/payment");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Shopping Cart</h1>
            <p className="text-muted-foreground mt-1">
              Review and manage your selected items
            </p>
          </div>
          {cart && cart.length > 0 && (
            <button
              onClick={() => dispatch(clearCart())}
              className="px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors border border-destructive/20"
            >
              Clear Cart
            </button>
          )}
        </div>

        {!cart || cart.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center max-w-lg mx-auto space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full glass-panel flex items-center justify-center text-muted-foreground">
              <ShoppingCart className="w-10 h-10 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Your cart is empty</h2>
              <p className="text-muted-foreground text-sm">
                Explore our catalog to find products and add them to your shopping cart.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 gradient-primary text-primary-foreground font-semibold rounded-xl hover:glow-on-hover animate-smooth shadow-lg"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Start Shopping</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ITEMS LIST */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const product = item.product || item || {};
                const productId = product.id || product._id || item.id;
                const imgUrl = getImageUrl(product);
                const price = Number(product.price ?? item.price ?? 0);
                const qty = Number(item.quantity) || 1;
                const itemTotal = price * qty;
                const name = product.name || product.title || "Product";

                return (
                  <div
                    key={productId}
                    className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:border-primary/40 border border-[hsla(var(--glass-border))]"
                  >
                    {/* PRODUCT IMAGE */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary/60 flex-shrink-0 flex items-center justify-center border border-[hsla(var(--glass-border))]">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            if (e.currentTarget.nextElementSibling) {
                              e.currentTarget.nextElementSibling.style.display = "flex";
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full items-center justify-center ${
                          imgUrl ? "hidden" : "flex"
                        }`}
                      >
                        <Package className="w-8 h-8 text-muted-foreground/60" />
                      </div>
                    </div>

                    {/* PRODUCT DETAILS */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-foreground line-clamp-1">
                        {name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        ${price.toFixed(2)} each
                      </p>
                      <div className="text-base font-bold text-primary sm:hidden mt-2">
                        Total: ${itemTotal.toFixed(2)}
                      </div>
                    </div>

                    {/* QUANTITY CONTROLS */}
                    <div className="flex items-center space-x-2 bg-secondary/80 border border-[hsla(var(--glass-border))] rounded-xl p-1.5 self-center sm:self-auto">
                      <button
                        onClick={() => updateQuantity(productId, qty - 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-primary/20 text-foreground transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm select-none">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(productId, qty + 1)}
                        disabled={product.stock && qty >= product.stock}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-primary/20 text-foreground transition-colors disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* ITEM TOTAL (Desktop) */}
                    <div className="hidden sm:block text-right min-w-[90px]">
                      <span className="text-base font-bold text-primary">
                        ${itemTotal.toFixed(2)}
                      </span>
                    </div>

                    {/* REMOVE BUTTON */}
                    <button
                      onClick={() => dispatch(removeFromCart(productId))}
                      className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* ORDER SUMMARY */}
            <div className="lg:col-span-1">
              <div className="glass-card rounded-2xl p-6 border border-[hsla(var(--glass-border))] sticky top-24 space-y-6">
                <h2 className="text-xl font-bold text-foreground">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-semibold text-foreground">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Shipping</span>
                    <span className="font-semibold text-foreground">
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Tax (8%)</span>
                    <span className="font-semibold text-foreground">
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-[hsla(var(--glass-border))] pt-4 flex justify-between items-baseline">
                    <span className="text-base font-bold text-foreground">Total</span>
                    <span className="text-2xl font-black text-primary">
                      ${grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2 gradient-primary text-primary-foreground py-3.5 px-6 rounded-xl hover:glow-on-hover animate-smooth font-semibold text-base shadow-lg transition-all"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <Link
                    to="/products"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
