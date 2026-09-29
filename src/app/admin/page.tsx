"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { DashboardStats } from "@/types/admin";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Clock,
  Briefcase,
  ArrowUpRight,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
  RefreshCw,
  FileText,
  Settings,
  TrendingUp,
  CheckCircle2,
  Truck,
  ExternalLink,
} from "lucide-react";

type PeriodType = "7d" | "30d" | "3m" | "12m";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodType>("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = useCallback(async (selectedPeriod: PeriodType = period) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/dashboard/stats?period=${selectedPeriod}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      }
    } catch (e) {
      console.error("Failed to load dashboard stats:", e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    fetchStats(period);
  }, [fetchStats, period]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStats(period);
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: stats ? `$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00",
      change: "+18.4% vs last period",
      icon: DollarSign,
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
    },
    {
      title: "Total Orders",
      value: stats ? stats.totalOrders.toString() : "0",
      change: `${stats?.pendingOrders ?? 0} pending fulfillment`,
      icon: ShoppingBag,
      textColor: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
    },
    {
      title: "Active Products",
      value: stats ? stats.totalProducts.toString() : "0",
      change: "Live in store",
      icon: Package,
      textColor: "text-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-100",
    },
    {
      title: "Total Customers",
      value: stats ? stats.totalCustomers.toString() : "0",
      change: "+12 new buyers",
      icon: Users,
      textColor: "text-sky-600",
      bgColor: "bg-sky-50",
      borderColor: "border-sky-100",
    },
    {
      title: "VIP Club Members",
      value: stats ? (stats.vipSubscribersCount ?? 0).toString() : "0",
      change: "Newsletter subscribers",
      icon: Sparkles,
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
    },
    {
      title: "Wholesale & Leads",
      value: stats ? ((stats.wholesaleRequests ?? 0) + (stats.contactMessagesCount ?? 0)).toString() : "0",
      change: "Inquiries & partner leads",
      icon: Briefcase,
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            Shop Overview
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Real-time analytics and inventory management for X-ON Nails
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-white border border-neutral-200 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 shadow-xs transition-all disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          {/* Add Product shortcut */}
          <Link
            href="/admin/products?new=true"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* 6 Key Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl ${card.bgColor} ${card.textColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                  {isLoading ? (
                    <div className="h-7 w-20 bg-neutral-100 animate-pulse rounded-md" />
                  ) : (
                    card.value
                  )}
                </div>
                <div className="text-[11px] text-neutral-400 mt-1 truncate">
                  {card.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid for Recent Orders & Best Sellers / Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Recent Customer Orders</h2>
              <p className="text-xs text-neutral-400">Latest incoming purchases awaiting fulfillment</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>All Orders</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-xs">
              <thead className="text-neutral-400 font-semibold uppercase tracking-wider border-b border-neutral-100">
                <tr>
                  <th className="pb-3 whitespace-nowrap">Order</th>
                  <th className="pb-3 min-w-[160px]">Customer</th>
                  <th className="pb-3 whitespace-nowrap">Amount</th>
                  <th className="pb-3 whitespace-nowrap">Payment</th>
                  <th className="pb-3 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {stats?.recentOrders?.length ? (
                  stats.recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 font-semibold text-neutral-900 whitespace-nowrap">
                        <Link href={`/admin/orders/${ord.id}`} className="hover:text-amber-600 hover:underline">
                          {ord.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-neutral-900 whitespace-nowrap">{ord.customer.name}</div>
                        <div className="text-[11px] text-neutral-400 whitespace-nowrap">{ord.customer.email}</div>
                      </td>
                      <td className="py-3 font-bold text-neutral-900 whitespace-nowrap">
                        ${ord.total.toFixed(2)}
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase inline-block ${
                            ord.paymentStatus === "paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase inline-block ${
                            ord.orderStatus === "delivered"
                              ? "bg-emerald-100 text-emerald-800"
                              : ord.orderStatus === "shipped"
                              ? "bg-sky-100 text-sky-800"
                              : ord.orderStatus === "processing"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-neutral-100 text-neutral-700"
                          }`}
                        >
                          {ord.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-400">
                      No recent orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side: Best Sellers & Low Stock Alert */}
        <div className="space-y-6">
          {/* Best Sellers */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
            <h2 className="text-base font-bold text-neutral-900 mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Top Best Sellers</span>
            </h2>
            <p className="text-xs text-neutral-400 mb-4">Highest volume press-on nail sets</p>

            <div className="space-y-3">
              {stats?.bestSellingProducts?.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 transition-colors">
                  <div className="relative w-11 h-11 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border border-neutral-100">
                    <Image
                      src={item.image || "/images/IMG_7098.webp"}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-neutral-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      {item.quantitySold} sets sold
                    </p>
                  </div>
                  <div className="text-xs font-extrabold text-neutral-900">
                    ${item.revenue.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-bold text-neutral-900">
                Low Stock Warning
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mb-3">Inventory items requiring restock</p>

            <div className="space-y-2">
              {stats?.lowStockProducts?.length ? (
                stats.lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 text-xs"
                  >
                    <div className="truncate mr-2">
                      <p className="font-semibold text-neutral-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-neutral-500">{p.sku}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold text-[10px] shrink-0">
                      {p.stock} left
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 py-3 text-xs text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>All product inventory levels healthy.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
