import { Plus, Minus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, updateCartQuantity, clearCart } from "../store/slices/cartSlice";
import { getImageUrl, handleImageError } from "../utils/imageHelper";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector((state) => state.cart || { cart: [] });

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(updateCartQuantity({ id, quantity }));
    }
  };

  const total = (cart || []).reduce(
    (sum, item) => sum + (Number(item.product?.price) || 0) * (item.quantity || 1),
    0
  );

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-foreground mb-8">Your Shopping Cart</h1>

        {!cart || cart.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl max-w-lg mx-auto p-8">
            <ShoppingBag className="w-20 h-20 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Looks like you haven't added any products to your cart yet.</p>
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* CART ITEMS LIST */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const productId = item.product?.id || item.product?._id;
                const imgUrl = getImageUrl(item.product);
                const priceVal = Number(item.product?.price) || 0;

                return (
                  <div
                    key={productId}
                    className="glass-card p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border/60"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={imgUrl}
                        alt={item.product?.name || "Product"}
                        onError={handleImageError}
                        className="w-20 h-20 object-cover rounded-xl bg-secondary flex-shrink-0"
                      />
                      <div>
                        <h3 className="font-bold text-foreground text-lg line-clamp-1">
                          {item.product?.name}
                        </h3>
                        <p className="text-primary font-bold text-lg mt-1">
                          ${priceVal.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/40">
                      {/* QUANTITY CONTROLS */}
                      <div className="flex items-center space-x-3 bg-secondary/60 rounded-xl px-3 py-1.5">
                        <button
                          onClick={() => updateQuantity(productId, item.quantity - 1)}
                          className="p-1 rounded-lg hover:bg-primary/20 transition-colors text-foreground"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-bold text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(productId, item.quantity + 1)}
                          className="p-1 rounded-lg hover:bg-primary/20 transition-colors text-foreground"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* ITEM TOTAL */}
                      <div className="text-right min-w-[80px]">
                        <p className="text-xs text-muted-foreground">Subtotal</p>
                        <p className="font-bold text-foreground">
                          ${(priceVal * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* REMOVE BUTTON */}
                      <button
                        onClick={() => dispatch(removeFromCart(productId))}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => dispatch(clearCart())}
                  className="text-sm font-semibold text-muted-foreground hover:text-red-500 transition-colors"
                >
                  Clear Shopping Cart
                </button>
                <Link
                  to="/"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 rounded-2xl border border-border/60 sticky top-24">
                <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-green-500 font-semibold">Free</span>
                  </div>
                  <div className="border-t border-border/60 pt-3 flex justify-between font-bold text-lg text-foreground">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/payment")}
                  className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;