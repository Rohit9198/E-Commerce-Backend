import { useRef } from "react";
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { addToCart, updateCartQuantity, removeFromCart } from "../../store/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";

const ProductSlider = ({ title, products }) => {
  const scrollRef = useRef(null);
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const getImageUrl = (product) => {
    if (!product) return "/placeholder.png";
    const images = product.images || product.image;
    if (Array.isArray(images) && images.length > 0) {
      const first = images[0];
      if (typeof first === "string") return first;
      if (first && typeof first === "object") return first.url || first.secure_url || "/placeholder.png";
    }
    if (typeof images === "string") {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed[0];
          if (typeof first === "string") return first;
          if (first && typeof first === "object") return first.url || first.secure_url || "/placeholder.png";
        }
      } catch {
        if (images.startsWith("http") || images.startsWith("/")) return images;
      }
    }
    if (typeof images === "string" && (images.startsWith("http") || images.startsWith("/"))) {
      return images;
    }
    return "/avatar-holder.avif";
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ product, quantity: 1 }));
  };

  const handleIncrease = (product, currentQty, e) => {
    e.preventDefault();
    e.stopPropagation();
    const prodId = product.id || product._id;
    const maxStock = product.stock !== undefined && product.stock !== null ? Number(product.stock) : Infinity;
    if (currentQty < maxStock) {
      dispatch(updateCartQuantity({ id: prodId, quantity: currentQty + 1 }));
    }
  };

  const handleDecrease = (product, currentQty, e) => {
    e.preventDefault();
    e.stopPropagation();
    const prodId = product.id || product._id;
    if (currentQty <= 1) {
      dispatch(removeFromCart(prodId));
    } else {
      dispatch(updateCartQuantity({ id: prodId, quantity: currentQty - 1 }));
    }
  };

  return (
    <section className="py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-foreground">{title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 glass-card hover:glow-on-hover animate-smooth"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-primary" />
          </button>

          <button
            onClick={() => scroll("right")}
            className="p-2 glass-card hover:glow-on-hover animate-smooth"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-primary" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
      >
        {products?.map((product) => {
          const prodId = product.id || product._id;
          const imageUrl = getImageUrl(product);

          const cartItem = cart?.find(
            (item) =>
              String(item.product?.id || item.product?._id || item.id) ===
              String(prodId)
          );
          const quantityInCart = cartItem?.quantity || 0;

          return (
            <Link
              key={prodId}
              to={`/product/${prodId}`}
              className="flex-shrink-0 w-80 glass-card hover:glow-on-hover animate-smooth group"
            >
              {/* PRODUCT IMAGE */}
              <div className="relative overflow-hidden rounded-lg mb-4">
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "/avatar-holder.avif";
                  }}
                />

                {/* QUANTITY CONTROLS / ADD TO CART */}
                {quantityInCart > 0 ? (
                  <div
                    className="absolute bottom-3 right-3 flex items-center space-x-2 bg-background/90 backdrop-blur-md border border-primary/40 px-2 py-1 rounded-xl shadow-lg animate-smooth"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <button
                      onClick={(e) => handleDecrease(product, quantityInCart, e)}
                      className="p-1 rounded-lg hover:bg-primary/20 text-primary transition-colors flex items-center justify-center"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold text-foreground min-w-[18px] text-center select-none">
                      {quantityInCart}
                    </span>
                    <button
                      onClick={(e) => handleIncrease(product, quantityInCart, e)}
                      disabled={product.stock !== undefined && product.stock !== null && quantityInCart >= Number(product.stock)}
                      className="p-1 rounded-lg hover:bg-primary/20 text-primary transition-colors flex items-center justify-center disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="absolute bottom-3 right-3 p-2.5 glass-card hover:glow-on-hover animate-smooth opacity-100 transition-opacity rounded-xl flex items-center justify-center text-primary"
                    disabled={product.stock === 0}
                    aria-label="Add to cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* PRODUCT INFO */}
              <div>
                {/* PRODUCT TITLE */}
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                  {product.name}
                </h3>

                {/* PRODUCT RATING */}
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center space-x-0.5">
                    {[...Array(5)].map((_, i) => {
                      const rating = Number(product.ratings) || 0;
                      const fillPercentage = Math.max(
                        0,
                        Math.min(100, (rating - i) * 100)
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
                    {Number(product.ratings || 0).toFixed(1)}
                  </span>
                </div>

                {/* PRODUCT PRICE */}
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-primary">
                    ${Number(product.price || 0).toFixed(2)}
                  </span>
                </div>

                {/* PRODUCT AVAILABILITY */}
                <div
                  className={`text-xs px-2 py-1 rounded mt-2 inline-block ${
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
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default ProductSlider;
