import React from "react";
import { useSelector } from "react-redux";
import { Package, Star } from "lucide-react";

const RANK_COLORS = [
  "bg-amber-400 text-white",
  "bg-gray-400 text-white",
  "bg-orange-400 text-white",
  "bg-blue-100 text-blue-600",
  "bg-purple-100 text-purple-600",
];

const TopSellingProducts = () => {
  const { topSellingProducts } = useSelector((state) => state.admin);

  const products = Array.isArray(topSellingProducts) ? topSellingProducts : [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
          Top Selling Products
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">Best performing items</p>
      </div>

      {products.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-gray-300 text-sm">
          No data available
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {/* Rank Badge */}
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                  RANK_COLORS[idx] || "bg-gray-100 text-gray-500"
                }`}
              >
                {idx + 1}
              </span>

              {/* Product Image */}
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {product.name || "—"}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-gray-400">
                    {product.category || ""}
                  </span>
                  {product.ratings && (
                    <span className="inline-flex items-center gap-0.5 text-[11px] text-amber-500 font-semibold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {Number(product.ratings).toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Units Sold */}
              <span className="flex-shrink-0 text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">
                {parseInt(product.total_sold) || 0} sold
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopSellingProducts;

