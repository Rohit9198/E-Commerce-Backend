import React from "react";
import { formatNumber } from "../../lib/helper";
import { useSelector } from "react-redux";
import { DollarSign, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";

const Stats = () => {
  const {
    totalRevenueAllTime,
    todayRevenue,
    yesterdayRevenue,
    currentMonthSales,
    revenueGrowth,
  } = useSelector((state) => state.admin);

  const isPositiveGrowth = !revenueGrowth?.startsWith("-");

  const statCards = [
    {
      title: "Total Revenue (All Time)",
      value: `$${formatNumber(totalRevenueAllTime || 0)}`,
      icon: DollarSign,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgLight: "bg-blue-50",
    },
    {
      title: "Today's Revenue",
      value: `$${formatNumber(todayRevenue || 0)}`,
      icon: Calendar,
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
      bgLight: "bg-emerald-50",
    },
    {
      title: "Yesterday's Revenue",
      value: `$${formatNumber(yesterdayRevenue || 0)}`,
      icon: Calendar,
      color: "bg-indigo-500",
      textColor: "text-indigo-600",
      bgLight: "bg-indigo-50",
    },
    {
      title: "Current Month Sales",
      value: `$${formatNumber(currentMonthSales || 0)}`,
      icon: TrendingUp,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgLight: "bg-purple-50",
      badge: revenueGrowth,
      badgePositive: isPositiveGrowth,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-xl ${card.bgLight} ${card.textColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                {card.value}
              </h3>
              {card.badge && (
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    card.badgePositive
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {card.badgePositive ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {card.badge}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Stats;
