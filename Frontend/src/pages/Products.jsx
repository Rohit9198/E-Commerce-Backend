import { Search, Sparkles, Star, Filter } from "lucide-react";
import { categories } from "../data/products";
import ProductCard from "../components/Products/ProductCard";
import Pagination from "../components/Products/Pagination";
import AISearchModal from "../components/Products/AISearchModal";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchAllProducts } from "../store/slices/productSlice";
import { toggleAIModal } from "../store/slices/popupSlice";

const Products = () => {
  const { products, totalProducts } = useSelector((state) => state.product);
  const location = useLocation();
  const dispatch = useDispatch();

  const query = new URLSearchParams(location.search);
  const searchTerm = query.get("search");
  const searchedCategory = query.get("category");

  const [searchQuery, setSearchQuery] = useState(searchTerm || "");
  const [selectedCategory, setSelectedCategory] = useState(searchedCategory || "");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [availability, setAvailability] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search");
    const category = params.get("category");
    if (search !== null) setSearchQuery(search);
    if (category !== null) setSelectedCategory(category);
  }, [location.search]);

  useEffect(() => {
    dispatch(
      fetchAllProducts({
        category: selectedCategory,
        price: `${priceRange[0]} - ${priceRange[1]}`,
        search: searchQuery,
        ratings: selectedRating,
        availability: availability,
        page: currentPage,
      })
    );
  }, [
    dispatch,
    selectedCategory,
    searchQuery,
    selectedRating,
    availability,
    currentPage,
  ]);

  const totalPages = Math.ceil((totalProducts || 0) / 10);

  return (
    <>
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* MOBILE FILTER TOGGLE */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden mb-4 p-3 glass-card hover:glow-on-hover animate-smooth flex items-center space-x-2"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>

            {/* SIDEBAR FILTERS */}
            <div
              className={`lg:block ${
                isMobileFilterOpen ? "block" : "hidden"
              } w-full lg:w-80 space-y-6`}
            >
              <div className="glass-panel">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Filters
                </h2>

                {/* PRICE RANGE */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-foreground mb-3">
                    Price Range
                  </h3>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], parseInt(e.target.value)])
                      }
                      className="w-full accent-primary cursor-pointer"
                    />
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* RATING */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-foreground mb-3">
                    Rating
                  </h3>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating}
                        onClick={() =>
                          setSelectedRating(
                            selectedRating === rating ? 0 : rating
                          )
                        }
                        className={`flex items-center space-x-2 w-full p-2 rounded transition-colors ${
                          selectedRating === rating
                            ? "bg-primary/20"
                            : "hover:bg-secondary"
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          & Up
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AVAILABILITY */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-foreground mb-3">
                    Availability
                  </h3>
                  <div className="space-y-2">
                    {["in-stock", "limited", "out-of-stock"].map((status) => (
                      <button
                        key={status}
                        onClick={() =>
                          setAvailability(
                            availability === status ? "" : status
                          )
                        }
                        className={`w-full p-2 text-left rounded transition-colors ${
                          availability === status
                            ? "bg-primary/20"
                            : "hover:bg-secondary"
                        }`}
                      >
                        {status === "in-stock"
                          ? "In Stock"
                          : status === "limited"
                          ? "Limited Stock"
                          : "Out of Stock"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CATEGORY */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-foreground mb-3">
                    Category
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={`w-full p-2 text-left rounded transition-colors ${
                        !selectedCategory
                          ? "bg-primary/20"
                          : "hover:bg-secondary"
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => {
                      return(
                      <button
                        key={category.id}
                        onClick={() =>
                          setSelectedCategory(
                            selectedCategory === category.name
                              ? ""
                              : category.name
                          )
                        }
                        className={`w-full p-2 text-left rounded transition-colors ${
                          selectedCategory === category.name
                            ? "bg-primary/20"
                            : "hover:bg-secondary"
                        }`}
                      >
                        {category.name}
                      </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1">
              {/* SEARCH BAR */}
              <div className="mb-8 flex max-[440px]:flex-col items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder-muted-foreground transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm font-bold p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* AI SEARCH BUTTON */}
                <button
                  className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium rounded-xl group bg-gradient-to-br from-purple-500 to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 max-[440px]:w-full flex-shrink-0 shadow-md hover:shadow-purple-500/25 transition-all"
                  onClick={() => dispatch(toggleAIModal())}
                >
                  <span className="relative w-full px-5 py-2.5 transition-all ease-in duration-75 bg-background dark:bg-gray-900 rounded-[10px] group-hover:bg-transparent group-hover:dark:bg-transparent flex justify-center items-center gap-2 font-semibold">
                    <Sparkles className="w-4 h-4 text-purple-400 group-hover:text-white transition-colors" />
                    <span>AI Search</span>
                  </span>
                </button>
              </div>

              {/* PRODUCTS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {products?.map((product) => (
                  <ProductCard key={product.id || product._id} product={product} />
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}

              {/* NO RESULTS */}
              {(!products || products.length === 0) && (
                <div className="text-center py-16 glass-panel rounded-2xl">
                  <p className="text-muted-foreground text-lg mb-2">
                    No products found matching your criteria.
                  </p>
                  {(searchQuery || selectedCategory || selectedRating > 0 || availability) && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("");
                        setSelectedRating(0);
                        setAvailability("");
                        setPriceRange([0, 10000]);
                      }}
                      className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI SEARCH MODAL */}
        <AISearchModal />
      </div>
    </>
  );
};

export default Products;
