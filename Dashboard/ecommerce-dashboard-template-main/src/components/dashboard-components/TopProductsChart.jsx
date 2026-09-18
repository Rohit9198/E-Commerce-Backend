import { useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";

const BAR_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-2.5 text-sm">
        <p className="text-gray-600 font-medium mb-0.5 truncate max-w-[150px]">
          {label}
        </p>
        <p className="font-bold text-gray-800">
          {payload[0].value} units sold
        </p>
      </div>
    );
  }
  return null;
};

const TopProductsChart = () => {
  const { topSellingProducts } = useSelector((state) => state.admin);

  const data = Array.isArray(topSellingProducts)
    ? topSellingProducts.map((p) => ({
        name:
          (p.name || "").length > 12
            ? (p.name || "").slice(0, 12) + "…"
            : p.name || "Product",
        sold: parseInt(p.total_sold) || 0,
      }))
    : [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
          Top 5 Products
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">By total units sold</p>
      </div>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-300 text-sm">
          No product data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
            <Bar dataKey="sold" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TopProductsChart;

