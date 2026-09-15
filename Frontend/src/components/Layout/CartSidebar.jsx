import { X, Plus, Minus, Trash2, ArrowRight, ShoppingCart, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, updateCartQuantity } from "../../store/slices/cartSlice";
import { toggleCart } from "../../store/slices/popupSlice";

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

const CartSidebar = () => {
  const dispatch = useDispatch();
  const { isCartOpen } = useSelector((state) => state.popup);
  const { cart } = useSelector((state) => state.cart);

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(updateCartQuantity({ id, quantity }));
    }
  };

  const total = (cart || []).reduce((sum, item) => {
    const product = item.product || item || {};
    const price = Number(product.price ?? item.price ?? 0);
    const qty = Number(item.quantity) || 1;
    return sum + (isNaN(price) ? 0 : price) * qty;
  }, 0);

  const totalItemCount = (cart || []).reduce((sum, item) => {
    return sum + (Number(item.quantity) || 1);
  }, 0);

  if (!isCartOpen) return null;

  return (
    <>
      {/* OVERLAY */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => dispatch(toggleCart())}
      />

      {/* CART SIDEBAR DRAWER */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[400px] z-50 glass-panel animate-slide-in-right flex flex-col shadow-2xl bg-card/95 backdrop-blur-xl border-l border-[hsla(var(--glass-border))]">
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-[hsla(var(--glass-border))] flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Shopping Cart</h2>
            {totalItemCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <button
            onClick={() => dispatch(toggleCart())}
            className="p-2 rounded-lg glass-card hover:glow-on-hover animate-smooth text-muted-foreground hover:text-foreground"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CART BODY / ITEM LIST */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!cart || cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
              <div className="p-4 rounded-2xl glass-card text-muted-foreground/60">
                <ShoppingCart className="w-12 h-12 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground max-w-[220px]">
                  Looks like you haven't added anything to your cart yet.
                </p>
              </div>
              <Link
                to={"/products"}
                onClick={() => dispatch(toggleCart())}
                className="mt-2 px-6 py-2.5 gradient-primary text-primary-foreground rounded-xl font-medium shadow-md hover:glow-on-hover animate-smooth"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
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
                    className="glass-card p-3.5 rounded-xl border border-[hsla(var(--glass-border))] flex flex-col gap-3 group hover:border-primary/40 transition-colors"
                  >
                    {/* Top Row: Product Image + Title & Unit Price + Delete Button */}
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary/60 flex-shrink-0 flex items-center justify-center border border-[hsla(var(--glass-border))]">
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
                          <Package className="w-6 h-6 text-muted-foreground/60" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug">
                            {name}
                          </h3>
                          <button
                            onClick={() => dispatch(removeFromCart(productId))}
                            className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                            title="Remove item"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          ${price.toFixed(2)} each
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row: Item Total on Left, Quantity Controls on Right */}
                    <div className="flex items-center justify-between pt-2 border-t border-[hsla(var(--glass-border))]/50">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs text-muted-foreground">Subtotal:</span>
                        <span className="text-sm font-bold text-primary">
                          ${itemTotal.toFixed(2)}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-1.5 bg-secondary/80 border border-[hsla(var(--glass-border))] rounded-lg p-1">
                        <button
                          className="w-6 h-6 rounded flex items-center justify-center hover:bg-primary/20 text-foreground transition-colors"
                          onClick={() => updateQuantity(productId, qty - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-foreground select-none">
                          {qty}
                        </span>
                        <button
                          className="w-6 h-6 rounded flex items-center justify-center hover:bg-primary/20 text-foreground transition-colors disabled:opacity-40"
                          onClick={() => updateQuantity(productId, qty + 1)}
                          disabled={product.stock && qty >= product.stock}
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER: TOTAL AMOUNT & CHECKOUT BUTTON (PINNED AT BOTTOM) */}
        {cart && cart.length > 0 && (
          <div className="p-5 border-t border-[hsla(var(--glass-border))] bg-card/90 backdrop-blur-md flex-shrink-0 space-y-4 mt-auto">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Total Items</span>
                <span className="font-semibold text-foreground">{totalItemCount}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[hsla(var(--glass-border))]/40">
                <span className="text-base font-bold text-foreground">Total Amount</span>
                <span className="text-2xl font-extrabold text-primary">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <Link
              to={"/cart"}
              onClick={() => dispatch(toggleCart())}
              className="w-full flex items-center justify-center gap-2 gradient-primary text-primary-foreground py-3.5 px-4 rounded-xl hover:glow-on-hover animate-smooth font-semibold text-sm shadow-lg transition-all"
            >
              <span>View Cart & Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
