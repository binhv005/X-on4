"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import productsData from "@/data/products.json";
import { type Product } from "@/components/ProductCard";
import { mapApiProduct } from "@/lib/productMapper";
import { Search, ChevronRight } from "lucide-react";
import { PageDecorations } from "@/components/PageDecorations";

export default function ShopPage() {
  const [productsList, setProductsList] = useState<Product[]>(() =>
    (productsData as any[]).map(mapApiProduct)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string[]>([]);
  const [selectedShape, setSelectedShape] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(112);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedLength, setSelectedLength] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    async function loadLiveProducts() {
      try {
        const res = await fetch("/api/products?limit=500");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && Array.isArray(json.data.products) && json.data.products.length > 0) {
            setProductsList(json.data.products.map(mapApiProduct));
          }
        }
      } catch (err) {
        console.error("Failed to fetch live products:", err);
      }
    }
    loadLiveProducts();
  }, []);

  const shapes = [
    { name: "Almond", img: "/images/ChatGPT-Image-14_53_06-6-thg-7-2026.png" },
    { name: "Coffin", img: "/images/ChatGPT-Image-15_02_06-6-thg-7-2026.png" },
    { name: "Oval", img: "/images/ChatGPT-Image-14_47_28-6-thg-7-2026.png" },
    { name: "Round", img: "/images/ChatGPT-Image-14_57_49-6-thg-7-2026.png" },
    { name: "Square", img: "/images/ChatGPT-Image-14_44_08-6-thg-7-2026.png" },
    { name: "Stiletto", img: "/images/1b230f22-4354-4e6e-b2e0-cdfae0aea0c0-Photoroom.png" },
  ];

  const types = [
    { id: "all", name: "All Types" },
    { id: "best-seller", name: "Best seller" },
    { id: "handmade-grip-x-nails", name: "Handmade grip-x nails" },
  ];

  const colors = [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#ffffff" },
    { name: "Red", hex: "#b20000" },
    { name: "Pink", hex: "#f78da7" },
    { name: "Blue", hex: "#0693e3" },
    { name: "Baby Blue", hex: "#8ed1fc" },
    { name: "Gold", hex: "#fcb900" },
    { name: "Brown", hex: "#7a5230" },
    { name: "Purple", hex: "#9b51e0" },
    { name: "Green", hex: "#00d084" },
    { name: "Nude", hex: "#e8c9b9" },
    { name: "Silver", hex: "#abb8c3" },
  ];

  const filteredProducts = useMemo(() => {
    return productsList
      .filter((p) => {
        // Search
        if (searchQuery.trim() && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }

        // Shape filter
        if (selectedShape !== "all" && !p.title.toLowerCase().includes(selectedShape.toLowerCase())) {
          return false;
        }

        // Type filter
        if (selectedType !== "all") {
          if (selectedType === "best-seller") {
            const isBestSeller =
              p.bestSeller === true ||
              p.category?.toLowerCase().includes("best") ||
              p.title.toLowerCase().includes("best") ||
              p.slug.toLowerCase().includes("best");
            if (!isBestSeller) return false;
          } else if (selectedType === "handmade-grip-x-nails") {
            const isHandmade =
              p.handmadeGripX === true ||
              p.featured === true ||
              p.category?.toLowerCase().includes("handmade") ||
              p.category?.toLowerCase().includes("grip-x") ||
              p.title.toLowerCase().includes("handmade") ||
              p.slug.toLowerCase().includes("handmade");
            if (!isHandmade) return false;
          } else {
            const tName = selectedType.replace(/-/g, " ");
            const matches =
              p.category?.toLowerCase().includes(tName.toLowerCase()) ||
              p.title.toLowerCase().includes(tName.toLowerCase()) ||
              p.slug.toLowerCase().includes(selectedType.toLowerCase());
            if (!matches) return false;
          }
        }

        // Price filter
        const priceNum = parseFloat(p.price.replace(/[^0-9.]/g, "")) || 0;
        if (priceNum > maxPrice) return false;

        return true;
      })
      .sort((a, b) => {
        const pA = parseFloat(a.price.replace(/[^0-9.]/g, "")) || 0;
        const pB = parseFloat(b.price.replace(/[^0-9.]/g, "")) || 0;
        if (sortBy === "price-low") return pA - pB;
        if (sortBy === "price-high") return pB - pA;
        if (sortBy === "title-asc") return a.title.localeCompare(b.title);
        return 0;
      });
  }, [productsList, searchQuery, selectedShape, selectedType, maxPrice, sortBy]);

  return (
    <div className="relative bg-white min-h-screen py-8 overflow-hidden">
      {/* Background Motifs */}
      <PageDecorations preset="shop" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb */}
        <div className="text-xs text-neutral-400 mb-6 flex items-center gap-1.5 uppercase font-medium">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-800 font-semibold">Shop</span>
        </div>

        {/* 1. TOP SHAPE CATEGORY BAR (Flatsome .shape-category-wrap) */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 overflow-x-auto pb-4 mb-4 border-b border-gray-100 scrollbar-none">
          {shapes.map((s) => (
            <button
              key={s.name}
              onClick={() => setSelectedShape(selectedShape === s.name ? "all" : s.name)}
              className={`flex flex-col items-center group cursor-pointer transition-transform ${
                selectedShape === s.name ? "scale-105" : "hover:scale-102"
              }`}
            >
              <div
                className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden flex items-center justify-center p-1 transition-all ${
                  selectedShape === s.name
                    ? "ring-2 ring-black bg-neutral-50"
                    : "border border-transparent hover:border-gray-200"
                }`}
              >
                <Image
                  src={s.img}
                  alt={s.name}
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              </div>
              <span
                className={`text-xs mt-1.5 font-medium uppercase tracking-wider ${
                  selectedShape === s.name ? "font-bold text-black" : "text-gray-700"
                }`}
              >
                {s.name}
              </span>
            </button>
          ))}
        </div>

        {/* 2. CATEGORY PILL TABS (Flatsome .typenail) */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-6 mb-8 scrollbar-none">
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-4 sm:px-6 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors ${
                selectedType === t.id
                  ? "bg-black text-white"
                  : "bg-neutral-100 text-gray-700 hover:bg-neutral-200"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* 3. MAIN SHOP LAYOUT: LEFT SIDEBAR + PRODUCT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Filter Sidebar (1 col) */}
          <div className="space-y-8 lg:border-r border-gray-100 lg:pr-8">
            {/* Search Input */}
            <div>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-3 pr-8 py-2 text-xs border border-gray-300 rounded-sm focus:outline-hidden focus:border-black"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5" />
              </div>
            </div>

            {/* Filter by Price Slider */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-2 mb-3">
                Filter by price
              </h4>
              <input
                type="range"
                min="3"
                max="112"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
              <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                <span>Price: $3 — ${maxPrice}</span>
                <button
                  onClick={() => setMaxPrice(112)}
                  className="px-3 py-1 bg-black text-white text-[10px] uppercase font-bold tracking-wider rounded-sm hover:bg-neutral-800"
                >
                  Filter
                </button>
              </div>
            </div>

            {/* Design Theme */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-2 mb-3">
                Design theme
              </h4>
              <div className="space-y-2 text-xs text-gray-700">
                {["3D", "Flower", "Y2K"].map((theme) => (
                  <label key={theme} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTheme.includes(theme)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTheme([...selectedTheme, theme]);
                        } else {
                          setSelectedTheme(selectedTheme.filter((t) => t !== theme));
                        }
                      }}
                      className="rounded-sm accent-black"
                    />
                    <span>{theme}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color Swatches */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-2 mb-3">
                Color
              </h4>
              <div className="grid grid-cols-6 gap-2">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(selectedColor === c.name ? null : c.name)}
                    title={c.name}
                    className={`w-6 h-6 rounded-full border border-gray-300 relative transition-transform ${
                      selectedColor === c.name ? "ring-2 ring-black scale-110" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Size Options */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-2 mb-3">
                Size
              </h4>
              <div className="flex gap-2">
                {["S", "M", "L", "XL"].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(selectedSize === sz ? null : sz)}
                    className={`w-8 h-8 rounded-sm border text-xs font-bold uppercase transition-colors ${
                      selectedSize === sz
                        ? "bg-black text-white border-black"
                        : "border-gray-200 text-gray-700 hover:border-black"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Length Filter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-2 mb-3">
                Length
              </h4>
              <div className="space-y-2 text-xs text-gray-700">
                {["Short", "Medium", "Long", "Extra Long"].map((len) => (
                  <label key={len} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="length"
                      checked={selectedLength === len}
                      onChange={() => setSelectedLength(len)}
                      className="accent-black"
                    />
                    <span>{len}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Product Grid Area (3 cols) */}
          <div className="lg:col-span-3">
            {/* Sort & Results Bar */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100 text-xs text-gray-500">
              <p>Showing 1–{filteredProducts.length} of {productsData.length} results</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-sm px-2 py-1 text-xs text-gray-700 bg-white focus:outline-hidden"
              >
                <option value="default">Default sorting</option>
                <option value="price-low">Sort by price: low to high</option>
                <option value="price-high">Sort by price: high to low</option>
                <option value="title-asc">Sort by name: A to Z</option>
              </select>
            </div>

            {/* 4-Column Product Grid as Flatsome */}
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                <p>No products were found matching your selection.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((prod) => (
                  <div key={prod.id} className="group flex flex-col bg-white">
                    <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
                      <Link href={`/product/${prod.slug}`} className="relative block w-full h-full">
                        <Image
                          src={prod.image}
                          alt={prod.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                    </div>

                    <div className="py-3 text-center flex flex-col flex-1">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wide truncate">
                        <Link href={`/product/${prod.slug}`}>{prod.title}</Link>
                      </h3>
                      <p className="text-xs sm:text-sm font-bold text-gray-800 mt-1">
                        {prod.price}
                      </p>
                      <div className="mt-auto pt-2.5">
                        <Link
                          href={`/product/${prod.slug}`}
                          className="inline-block w-full py-2 border border-black hover:bg-black hover:text-white text-[11px] font-bold uppercase tracking-wider text-black rounded-sm transition-colors text-center"
                        >
                          SELECT OPTIONS
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
