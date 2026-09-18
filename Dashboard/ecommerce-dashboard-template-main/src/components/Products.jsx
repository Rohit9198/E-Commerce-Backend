import React, { useState, useEffect } from "react";
import { LoaderCircle, Plus, Search, Trash2, Edit2, Eye, RefreshCw, Package, AlertTriangle, Star, ChevronDown } from "lucide-react";
import CreateProductModal from "../modals/CreateProductModal";
import { useDispatch, useSelector } from "react-redux";
import Header from "./Header";
import UpdateProductModal from "../modals/UpdateProductModal";
import ViewProductModal from "../modals/ViewProductModal";
import {
  fetchAllProducts,
  deleteProduct,
} from "../store/slices/productsSlice";
import {
  toggleCreateProductModal,
  toggleUpdateProductModal,
  toggleViewProductModal,
} from "../store/slices/extraSlice";

const CATEGORY_OPTIONS = [
  "All",
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Sports",
  "Books",
  "Beauty",
  "Automotive",
  "Kids & Baby",
];

const StockBadge = ({ stock }) => {
  const qty = Number(stock || 0);
  if (qty === 0)
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        Out of Stock
      </span>
    );
  if (qty <= 5)
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
        Low — {qty} left
      </span>
    );
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
      In Stock ({qty})
    </span>
  );
};

const Products = () => {
  const dispatch = useDispatch();
  const { products, totalProducts, loading } = useSelector(
    (state) => state.product
  );
  const {
    isCreateProductModalOpened,
    isUpdateProductModalOpened,
    isViewProductModalOpened,
  } = useSelector((state) => state.extra);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null); // productId

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  const filteredProducts = products.filter((p) => {
    const matchCat =
      selectedCategory === "All" ||
      (p.category || "").toLowerCase() === selectedCategory.toLowerCase();

    const matchSearch =
      !searchQuery.trim() ||
      (p.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchCat && matchSearch;
  });

  const openUpdate = (product) => {
    setSelectedProduct(product);
    dispatch(toggleUpdateProductModal());
  };

  const openView = (product) => {
    setSelectedProduct(product);
    dispatch(toggleViewProductModal());
  };

  const handleDelete = () => {
    if (!deleteModal) return;
    dispatch(deleteProduct(deleteModal));
    setDeleteModal(null);
  };

  const getProductImage = (product) => {
    const imgs = product.images;
    if (!imgs) return null;
    const arr = typeof imgs === "string" ? JSON.parse(imgs) : imgs;
    return Array.isArray(arr) && arr.length > 0 ? arr[0]?.url || arr[0] : null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Products</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {totalProducts} product{totalProducts !== 1 ? "s" : ""} in catalogue
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(fetchAllProducts())}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => dispatch(toggleCreateProductModal())}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* Search + Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors shadow-sm"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors shadow-sm cursor-pointer"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <LoaderCircle className="w-8 h-8 animate-spin text-blue-500" />
              <span className="text-sm font-medium">Loading products…</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <Package className="w-10 h-10" />
              <p className="text-sm font-medium">
                {searchQuery || selectedCategory !== "All"
                  ? "No products match your filters."
                  : "No products found."}
              </p>
              {(searchQuery || selectedCategory !== "All") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
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
                      "Product",
                      "Category",
                      "Price",
                      "Stock",
                      "Rating",
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
                  {filteredProducts.map((product) => {
                    const imgUrl = getProductImage(product);
                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Product */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={product.name}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                                {product.name || "—"}
                              </p>
                              <p className="text-xs text-gray-400 font-mono">
                                {(product.id || "").slice(0, 8)}…
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                            {product.category || "—"}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-5 py-4 font-semibold text-gray-800 whitespace-nowrap">
                          ₹{Number(product.price || 0).toLocaleString("en-IN")}
                        </td>

                        {/* Stock */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <StockBadge stock={product.stock} />
                        </td>

                        {/* Rating */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {Number(product.ratings || 0).toFixed(1)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openView(product)}
                              title="View Product"
                              className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openUpdate(product)}
                              title="Edit Product"
                              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteModal(product.id)}
                              title="Delete Product"
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

          {/* Footer */}
          {!loading && filteredProducts.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
              Showing {filteredProducts.length}{" "}
              {searchQuery || selectedCategory !== "All" ? "matching " : ""}
              of {totalProducts} product{totalProducts !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* ── CREATE PRODUCT MODAL ── */}
      {isCreateProductModalOpened && <CreateProductModal />}

      {/* ── UPDATE PRODUCT MODAL ── */}
      {isUpdateProductModalOpened && selectedProduct && (
        <UpdateProductModal selectedProduct={selectedProduct} />
      )}

      {/* ── VIEW PRODUCT MODAL ── */}
      {isViewProductModalOpened && selectedProduct && (
        <ViewProductModal selectedProduct={selectedProduct} />
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">
              Delete Product?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently remove the product from your catalogue.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
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

export default Products;

