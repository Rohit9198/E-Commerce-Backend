import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  ShoppingCart,
  Plus,
  Minus,
  Loader,
  Heart,
  Share2,
  ArrowLeft,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import ReviewsContainer from "../components/Products/ReviewsContainer";
import { addToCart } from "../store/slices/cartSlice";
import { fetchProductDetails } from "../store/slices/productSlice";
import { toast } from "react-toastify";

const PRODUCT_ANGLES = [
  { id: "front", label: "Front View", transform: "none" },
  { id: "opposite", label: "Opposite Angle", transform: "scaleX(-1)" },
  { id: "perspective", label: "3D Perspective", transform: "perspective(900px) rotateY(-18deg) rotateX(4deg) scale(0.96)" },
  { id: "detail", label: "Detail View", transform: "scale(1.28) translateY(-2%)" },
];

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const product = useSelector((state) => state.product?.productDetails);
  const { loading, productReviews } = useSelector((state) => state.product);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedAngle, setSelectedAngle] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id));
    }
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    dispatch(addToCart({ product, quantity }));
    toast.success(`${quantity} ${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!product || product.stock === 0) return;
    dispatch(addToCart({ product, quantity }));
    navigate("/cart");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.info("Product link copied to clipboard!");
    }
  };

  const getImages = (prod) => {
    if (!prod) return [{ url: "/avatar-holder.avif" }];
    const imgs = prod.images || prod.image;
    if (Array.isArray(imgs) && imgs.length > 0) {
      return imgs.map((img) =>
        typeof img === "string" ? { url: img } : img
      );
    }
    if (typeof imgs === "string") {
      try {
        const parsed = JSON.parse(imgs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((img) =>
            typeof img === "string" ? { url: img } : img
          );
        }
      } catch {
        if (imgs.startsWith("http") || imgs.startsWith("/")) {
          return [{ url: imgs }];
        }
      }
    }
    return [{ url: "/avatar-holder.avif" }];
  };

  if (loading && (!product || String(product.id || product._id) !== String(id))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!product || (!product.name && !loading)) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <div className="text-center glass-panel p-8 max-w-md w-full rounded-2xl">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Product Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The product you're looking for does not exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:glow-on-hover transition-all"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const images = getImages(product);
  const currentImageUrl =
    images[selectedImage]?.url ||
    images[selectedImage]?.secure_url ||
    "/avatar-holder.avif";
  const ratingVal = Number(product.ratings ?? product.rating) || 0;
  const maxStock = Number(product.stock) || 0;
  const reviewsCount = productReviews?.length ?? product?.reviews?.length ?? 0;

  const isNew = product.created_at
    ? new Date() - new Date(product.created_at) < 30 * 24 * 60 * 60 * 1000
    : true;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* TOP BACK TO PRODUCTS BUTTON */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/products")}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border/70 bg-secondary/50 hover:bg-secondary text-sm font-medium text-foreground hover:border-primary/50 transition-all group shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-muted-foreground group-hover:text-primary" />
            <span>Back to Products</span>
          </button>
        </div>

        {/* MAIN PRODUCT ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start mb-12">
          {/* LEFT: IMAGE GALLERY */}
          <div>
            <div className="bg-secondary/40 backdrop-blur-md border border-border/60 rounded-2xl p-6 flex items-center justify-center overflow-hidden min-h-[380px] shadow-lg relative group">
              <img
                src={currentImageUrl}
                alt={product.name}
                style={{ transform: PRODUCT_ANGLES[selectedAngle]?.transform || "none" }}
                className="w-full h-80 object-contain rounded-xl transition-transform duration-300 ease-out"
                onError={(e) => {
                  e.currentTarget.src = "/avatar-holder.avif";
                }}
              />
              {/* CURRENT VIEW BADGE */}
              <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md border border-border/70 text-foreground text-xs font-semibold px-3 py-1 rounded-lg shadow-sm pointer-events-none">
                {PRODUCT_ANGLES[selectedAngle]?.label}
              </div>
            </div>

            {/* THUMBNAILS - ANGLE VIEWS OF THE SAME PRODUCT */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Product Angles
                </span>
                <span className="text-xs text-primary font-medium">
                  {PRODUCT_ANGLES[selectedAngle]?.label}
                </span>
              </div>
              <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                {PRODUCT_ANGLES.map((angle, index) => (
                  <button
                    key={angle.id}
                    onClick={() => setSelectedAngle(index)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-secondary/60 relative p-1.5 flex flex-col items-center justify-between ${
                      selectedAngle === index
                        ? "border-primary shadow-md shadow-primary/30 scale-105"
                        : "border-border/60 hover:border-primary/50 opacity-70 hover:opacity-100"
                    }`}
                    title={angle.label}
                  >
                    <div className="w-full h-11 overflow-hidden flex items-center justify-center">
                      <img
                        src={currentImageUrl}
                        alt={`${product.name} ${angle.label}`}
                        style={{ transform: angle.transform }}
                        className="w-full h-full object-contain pointer-events-none transition-transform duration-200"
                        onError={(e) => {
                          e.currentTarget.src = "/avatar-holder.avif";
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-foreground/90 truncate w-full text-center">
                      {angle.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: PRODUCT INFO & ACTION PANEL */}
          <div className="space-y-4">
            {/* NEW BADGE */}
            {isNew && (
              <div>
                <span className="bg-secondary border border-border/80 text-foreground text-xs font-bold uppercase px-2.5 py-1 rounded tracking-wider inline-block">
                  NEW
                </span>
              </div>
            )}

            {/* PRODUCT TITLE */}
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {product.name}
            </h1>

            {/* RATING & REVIEWS */}
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-0.5">
                {[...Array(5)].map((_, i) => {
                  const fillPercentage = Math.max(
                    0,
                    Math.min(100, (ratingVal - i) * 100)
                  );
                  return (
                    <div key={i} className="relative inline-block w-4 h-4">
                      <Star className="w-4 h-4 text-gray-400" />
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
              <span className="font-semibold text-foreground">
                {ratingVal.toFixed(2)}
              </span>
              <span className="text-muted-foreground">
                ({reviewsCount}) reviews
              </span>
            </div>

            {/* PRICE */}
            <div className="text-3xl font-extrabold text-foreground pt-1">
              ${Number(product.price || 0).toFixed(2)}
            </div>

            {/* CATEGORY & STOCK STATUS */}
            <div className="flex items-center space-x-3 text-sm text-muted-foreground pt-1">
              <span>
                Category:{" "}
                <span className="text-foreground font-medium">
                  {product.category || "General"}
                </span>
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                  maxStock > 5
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : maxStock > 0
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {maxStock > 5
                  ? "In Stock"
                  : maxStock > 0
                  ? `Limited Stock (${maxStock})`
                  : "Out of Stock"}
              </span>
            </div>

            {/* ACTION BOX */}
            <div className="bg-secondary/30 backdrop-blur-md border border-border/70 rounded-2xl p-6 space-y-6 shadow-xl mt-6">
              {/* QUANTITY ROW */}
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-foreground">
                  Quantity:
                </span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || maxStock === 0}
                    className="w-8 h-8 rounded-lg bg-secondary border border-border/80 text-foreground hover:bg-primary/20 hover:text-primary flex items-center justify-center transition-colors disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-foreground font-bold text-sm min-w-[20px] text-center select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                    disabled={quantity >= maxStock || maxStock === 0}
                    className="w-8 h-8 rounded-lg bg-secondary border border-border/80 text-foreground hover:bg-primary/20 hover:text-primary flex items-center justify-center transition-colors disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* BUTTONS: ADD TO CART & BUY NOW */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={maxStock === 0}
                  className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={maxStock === 0}
                  className="flex-1 py-3 px-6 bg-secondary hover:bg-secondary/80 active:scale-[0.98] text-foreground font-semibold rounded-xl flex items-center justify-center transition-all border border-border/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              {/* WISHLIST & SHARE LINKS */}
              <div className="flex items-center space-x-6 pt-1 text-sm text-muted-foreground">
                <button
                  onClick={() => {
                    setIsWishlisted(!isWishlisted);
                    toast.info(
                      isWishlisted
                        ? "Removed from Wishlist"
                        : "Added to Wishlist"
                    );
                  }}
                  className={`flex items-center space-x-1.5 transition-colors ${
                    isWishlisted ? "text-pink-500 font-medium" : "hover:text-foreground"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isWishlisted ? "fill-current text-pink-500" : ""
                    }`}
                  />
                  <span>Add to Wishlist</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center space-x-1.5 hover:text-foreground transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM: TABS CARD (DESCRIPTION & REVIEWS) */}
        <div className="bg-secondary/30 backdrop-blur-md border border-border/70 rounded-2xl p-6 sm:p-8 shadow-xl mt-12">
          {/* TAB HEADERS */}
          <div className="flex border-b border-border space-x-8 mb-8">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-3.5 text-base font-semibold transition-all relative ${
                activeTab === "description"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-3.5 text-base font-semibold transition-all relative ${
                activeTab === "reviews"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Reviews
            </button>
          </div>

          {/* TAB CONTENT */}
          {activeTab === "description" ? (
            <div className="text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4">
              <p>{product.description}</p>
            </div>
          ) : (
            <ReviewsContainer
              product={product}
              productReviews={productReviews}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
