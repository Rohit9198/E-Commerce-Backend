import React from "react";
import { Star, ShoppingCart, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, updateQuantity, removeFromCart } from "../../store/slices/cartSlice";
import { getImageUrl, handleImageError, getReviewCount } from "../../utils/imageHelper";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart || { cart: [] });

  if (!product) return null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ product, quantity: 1 }));
  };

  const handleIncrement = (e, currentQty) => {
    e.preventDefault();
    e.stopPropagation();
    const prodId = product.id || product._id;
    if (product.stock > 0 && currentQty >= product.stock) return;
    dispatch(updateQuantity({ id: prodId, quantity: currentQty + 1 }));
  };

  const handleDecrement = (e, currentQty) => {
    e.preventDefault();
    e.stopPropagation();
    const prodId = product.id || product._id;
    if (currentQty <= 1) {
      dispatch(removeFromCart(prodId));
    } else {
      dispatch(updateQuantity({ id: prodId, quantity: currentQty - 1 }));
    }
  };

  const createdAtDate = product.created_at || product.createdAt;
  const isNew = createdAtDate
    ? (new Date() - new Date(createdAtDate)) < 30 * 24 * 60 * 60 * 1000
    : false;
  const imageUrl = getImageUrl(product);
  const ratingVal = Number(product.ratings ?? product.rating) || 0;
  const reviewCount = getReviewCount(product, ratingVal);

  // Check if item is in cart
  const cartItem = (cart || []).find(
    (item) => (item.product?.id || item.product?._id) === product.id
  );
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  return (
    <Link
      to={`/product/${product.id}`}
      className="glass-card hover:glow-on-hover animate-smooth group block overflow-hidden rounded-xl p-4 transition-all duration-300"
    >
      {/* PRODUCT IMAGE & BADGES */}
      <div className="relative overflow-hidden rounded-lg mb-4">
        <img
          src={imageUrl}
          alt={product.name || "Product"}
          onError={handleImageError}
          className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-300"
        />

        {/* CART BUTTON / QUANTITY CONTROLLER (- count +) */}
        {cartQuantity > 0 ? (
          <div
            className="absolute bottom-3 right-3 flex items-center bg-primary text-primary-foreground rounded-full px-2 py-1 shadow-lg z-10 animate-smooth"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <button
              onClick={(e) => handleDecrement(e, cartQuantity)}
              className="p-1 hover:bg-black/20 dark:hover:bg-white/20 rounded-full transition-colors"
              title="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-2 text-sm font-bold min-w-[20px] text-center select-none">
              {cartQuantity}
            </span>
            <button
              onClick={(e) => handleIncrement(e, cartQuantity)}
              className="p-1 hover:bg-black/20 dark:hover:bg-white/20 rounded-full transition-colors"
              disabled={product.stock > 0 && cartQuantity >= product.stock}
              title="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 p-2.5 glass-card hover:glow-on-hover animate-smooth opacity-0 group-hover:opacity-100 transition-opacity"
            disabled={product.stock === 0}
            title="Add to cart"
          >
            <ShoppingCart className="w-5 h-5 text-primary" />
          </button>
        )}
      </div>

      {/* PRODUCT DETAILS */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors truncate">
          {product.name}
        </h3>

        <div className="flex items-center space-x-2 mb-2">
          <div className="flex items-center space-x-0.5">
            {[...Array(5)].map((_, i) => {
              const fillPercentage = Math.max(
                0,
                Math.min(100, (ratingVal - i) * 100)
              );
              return (
                <div key={i} className="relative inline-block w-4 h-4">
                  <Star className="w-4 h-4 text-gray-300" />
                  {fillPercentage > 0 && (
                    <div
                      className="absolute top-0 left-0 overflow-hidden h-full"
                      style={{ width: `${fillPercentage}%` }}
                    >
                      <Star className="w-4 h-4 min-w-[16px] max-w-none text-yellow-400 fill-current" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <span className="text-sm font-medium text-foreground">
            {ratingVal.toFixed(1)}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xl font-bold text-primary">
            ${Number(product.price).toFixed(2)}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded ${
              product.stock > 5
                ? "bg-green-500/20 text-green-400"
                : product.stock > 0
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {product.stock > 5
              ? "In Stock"
              : product.stock > 0
              ? "Limited Stock"
              : "Out of Stock"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;