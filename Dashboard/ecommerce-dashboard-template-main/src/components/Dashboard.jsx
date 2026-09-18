import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "./Header";
import MiniSummary from "./dashboard-components/MiniSummary";
import TopSellingProducts from "./dashboard-components/TopSellingProducts";
import Stats from "./dashboard-components/Stats";
import MonthlySalesChart from "./dashboard-components/MonthlySalesChart";
import OrdersChart from "./dashboard-components/OrdersChart";
import TopProductsChart from "./dashboard-components/TopProductsChart";
import { getDashboardStats } from "../store/slices/adminSlice";
import { AlertTriangle, RefreshCw } from "lucide-react";

const SkeletonCard = ({ className = "" }) => (
  <div
    className={`bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse ${className}`}
  >
    <div className="p-5 space-y-3">
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-7 bg-gray-100 rounded w-1/3" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
    </div>
  </div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { loading, lowStockProducts } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getDashboardStats());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Page Title Row */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Welcome back, Admin — here's your store overview
            </p>
          </div>
          <button
            onClick={() => dispatch(getDashboardStats())}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Low Stock Alert Banner */}
        {!loading &&
          Array.isArray(lowStockProducts) &&
          lowStockProducts.length > 0 && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Low Stock Warning — {lowStockProducts.length} product
                  {lowStockProducts.length !== 1 ? "s" : ""} running low
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {lowStockProducts
                    .map((p) => `${p.name} (${p.stock} left)`)
                    .join(" · ")}
                </p>
              </div>
            </div>
          )}

        {/* Revenue Stats Row */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <Stats />
        )}

        {/* Mini Summary Row */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <MiniSummary />
        )}

        {/* Charts Row — Monthly Sales + Order Status Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            {loading ? (
              <SkeletonCard className="h-72" />
            ) : (
              <MonthlySalesChart />
            )}
          </div>
          <div>
            {loading ? (
              <SkeletonCard className="h-72" />
            ) : (
              <OrdersChart />
            )}
          </div>
        </div>

        {/* Bottom Row — Top Products Bar Chart + Top Selling List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pb-6">
          <div>
            {loading ? (
              <SkeletonCard className="h-72" />
            ) : (
              <TopProductsChart />
            )}
          </div>
          <div>
            {loading ? (
              <SkeletonCard className="h-72" />
            ) : (
              <TopSellingProducts />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

