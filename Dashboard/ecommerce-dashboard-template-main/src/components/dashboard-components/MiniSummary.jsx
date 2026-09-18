import React from "react";
import {
  Users,
  UserPlus,
  AlertTriangle,
  Award,
} from "lucide-react";
import { useSelector } from "react-redux";
import { formatNumber } from "../../lib/helper";

const MiniSummary = () => {
  const {
    totalUsersCount,
    newUsersThisMonth,
    lowStockProducts,
    topSellingProducts,
  } = useSelector((state) => state.admin);

  const items = [
    {
      title: "Registered Customers",
      value: formatNumber(totalUsersCount || 0),
      subtitle: "Total registered users",
      icon: Users,
      iconColor: "text-sky-500",
      bgLight: "bg-sky-50",
    },
    {
      title: "New Users This Month",
      value: `+${formatNumber(newUsersThisMonth || 0)}`,
      subtitle: "Recent sign-ups",
      icon: UserPlus,
      iconColor: "text-violet-500",
      bgLight: "bg-violet-50",
    },
    {
      title: "Low Stock Alert",
      value: Array.isArray(lowStockProducts) ? lowStockProducts.length : 0,
      subtitle: "Products with stock <= 5",
      icon: AlertTriangle,
      iconColor: "text-amber-500",
      bgLight: "bg-amber-50",
    },
    {
      title: "Top Products Tracked",
      value: Array.isArray(topSellingProducts) ? topSellingProducts.length : 0,
      subtitle: "Best sellers ranked",
      icon: Award,
      iconColor: "text-rose-500",
      bgLight: "bg-rose-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${item.bgLight} ${item.iconColor}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {item.title}
              </p>
              <h4 className="text-xl font-bold text-gray-800 mt-0.5">{item.value}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{item.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MiniSummary;
