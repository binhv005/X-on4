"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import productsData from "@/data/products.json";
import { type Product } from "@/components/ProductCard";
import { mapApiProduct } from "@/lib/productMapper";
import { Search, ChevronRight } from "lucide-react";
import { PageDecorations } from "@/components/PageDecorations";

function ShopContent() {
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q") || searchParams.get("search") || "";
  const shapeParam = searchParams.get("shape") || "all";
  const themeParam = searchParams.get("theme");
  const typeParam = searchParams.get("type") || "all";

  const [productsList, setProductsList] = useState<Product[]>(() =>
    (productsData as any[]).map(mapApiProduct)
  );
  const [searchQuery, setSearchQuery] = useState(qParam);
  const [selectedTheme, setSelectedTheme] = useState<string[]>(themeParam ? [themeParam] : []);
  const [selectedShape, setSelectedShape] = useState<string>(shapeParam);
  const [selectedType, setSelectedType] = useState<string>(typeParam);
  const [maxPrice, setMaxPrice] = useState<number>(112);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedLength, setSelectedLength] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    if (qParam !== undefined) {
      setSearchQuery(qParam);
    }
  }, [qParam]);

  useEffect(() => {
    if (shapeParam) {
      setSelectedShape(shapeParam);
    }
  }, [shapeParam]);

  useEffect(() => {
    if (themeParam) {
      setSelectedTheme([themeParam]);
    }
  }, [themeParam]);

  useEffect(() => {
    if (typeParam) {
      setSelectedType(typeParam);
    }
  }, [typeParam]);

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

  const DEFAULT_DESIGN_THEMES = [
    "3D",
    "Flower",
    "Y2K",
    "Cat Eye",
    "Minimalist",
    "French Tip",
    "Glitter",
    "Chrome",
    "Gradient",
    "Cute / Cartoon",
    "Abstract",
  ];

  const DEFAULT_SIZES = ["XS", "S", "M", "L", "Custom"];

  const DEFAULT_LENGTHS = ["Short", "Medium", "Long", "Extra Long"];

  const DEFAULT_PRODUCT_TYPES = [
    { id: "all", name: "ALL TYPES" },
    { id: "best-seller", name: "BEST SELLER" },
    { id: "handmade-grip-x-nails", name: "HANDMADE X-ON NAILS" },
  ];

  // Dynamically extract all available themes across products + default presets
  const availableThemes = useMemo(() => {
    const themeSet = new Set<string>(DEFAULT_DESIGN_THEMES);
    productsList.forEach((p) => {
      if (Array.isArray(p.designThemes)) {
        p.designThemes.forEach((t) => {
          if (t && t.trim()) themeSet.add(t.trim());
        });
      }
    });
    return Array.from(themeSet);
  }, [productsList]);

  // Dynamically extract all available sizes across products + default presets
  const availableSizes = useMemo(() => {
    const sizeSet = new Set<string>(DEFAULT_SIZES);
    productsList.forEach((p) => {
      if (Array.isArray(p.sizes)) {
        p.sizes.forEach((s) => {
          if (s && s.trim()) sizeSet.add(s.trim());
        });
      }
      if (p.sizeStock && typeof p.sizeStock === "object") {
        Object.keys(p.sizeStock).forEach((s) => {
          if (s && s.trim()) sizeSet.add(s.trim());
        });
      }
    });
    return Array.from(sizeSet);
  }, [productsList]);

  // Dynamically extract all available lengths across products + default presets
  const availableLengths = useMemo(() => {
    const lengthSet = new Set<string>(DEFAULT_LENGTHS);
    productsList.forEach((p) => {
      if (p.length && p.length.trim()) lengthSet.add(p.length.trim());
      if (Array.isArray(p.lengths)) {
        p.lengths.forEach((l) => {
          if (l && l.trim()) lengthSet.add(l.trim());
        });
      }
    });
    return Array.from(lengthSet);
  }, [productsList]);

  const shapes = [
    { name: "Almond", img: "/images/shape-almond.webp" },
    { name: "Coffin", img: "/images/shape-coffin.webp" },
    { name: "Oval", img: "/images/shape-oval.webp" },
    { name: "Round", img: "/images/shape-round.webp" },
    { name: "Square", img: "/images/shape-square.webp" },
    { name: "Stiletto", img: "/images/shape-stiletto.webp" },
  ];

  const DEFAULT_COLORS = [
    { name: "Pink", hex: "#f472b6" },
    { name: "Nude / Beige", hex: "#e2cbaf" },
    { name: "White", hex: "#ffffff", border: true },
    { name: "Red / Crimson", hex: "#e11d48" },
    { name: "Black", hex: "#18181b" },
    { name: "Blue", hex: "#38bdf8" },
    { name: "Purple / Lavender", hex: "#c084fc" },
    { name: "Green / Emerald", hex: "#4ade80" },
    { name: "Gold / Shimmer", hex: "#eab308" },
    { name: "Silver / Chrome", hex: "#cbd5e1" },
    { name: "Pastel", hex: "#fed7aa" },
    { name: "Multi-color", hex: "linear-gradient(135deg, #f472b6, #38bdf8, #facc15)" },
  ];

  const getKnownColorHex = (name: string): string => {
    if (!name) return "#cbd5e1";
    const trimmed = name.trim();
    if (trimmed.startsWith("#") || trimmed.startsWith("rgb") || trimmed.startsWith("linear-gradient")) {
      return trimmed;
    }
    const lower = trimmed.toLowerCase();
    const KNOWN_COLORS: Record<string, string> = {
      orange: "#f97316",
      coral: "#fb7185",
      pink: "#f472b6",
      "hot pink": "#ec4899",
      rose: "#f43f5e",
      nude: "#e2cbaf",
      beige: "#e2cbaf",
      white: "#ffffff",
      red: "#e11d48",
      crimson: "#e11d48",
      black: "#18181b",
      blue: "#38bdf8",
      "sky blue": "#0ea5e9",
      navy: "#1e3a8a",
      purple: "#c084fc",
      lavender: "#c084fc",
      violet: "#8b5cf6",
      green: "#4ade80",
      emerald: "#10b981",
      mint: "#6ee7b7",
      olive: "#84cc16",
      gold: "#eab308",
      yellow: "#facc15",
      amber: "#f59e0b",
      silver: "#cbd5e1",
      gray: "#9ca3af",
      grey: "#9ca3af",
      charcoal: "#374151",
      brown: "#78350f",
      mocha: "#5c3d2e",
      pastel: "#fed7aa",
      cyan: "#06b6d4",
      teal: "#14b8a6",
      turquoise: "#2dd4bf",
      magenta: "#d946ef",
      plum: "#701a75",
      peach: "#fbcfe8",
      maroon: "#881337",
    };

    for (const [key, hex] of Object.entries(KNOWN_COLORS)) {
      if (lower.includes(key)) {
        return hex;
      }
    }

    return "#e2cbaf";
  };

  // Dynamically extract all available colors across products + default presets preserving exact dots!
  const availableColors = useMemo(() => {
    const colorMap = new Map<string, { name: string; hex: string; border?: boolean }>();

    DEFAULT_COLORS.forEach((c) => {
      colorMap.set(c.name.toLowerCase(), c);
    });

    productsList.forEach((p) => {
      // If product has exact colorOptions with saved hex
      if (Array.isArray(p.colorOptions)) {
        p.colorOptions.forEach((co) => {
          if (!co || !co.name) return;
          const key = co.name.trim().toLowerCase();
          if (co.hex) {
            colorMap.set(key, {
              name: co.name.trim(),
              hex: co.hex,
              border: co.border,
            });
          }
        });
      }
      if (Array.isArray(p.colors)) {
        p.colors.forEach((col) => {
          if (!col || !col.trim()) return;
          const colTrimmed = col.trim();
          const colLower = colTrimmed.toLowerCase();
          if (!colorMap.has(colLower)) {
            colorMap.set(colLower, {
              name: colTrimmed,
              hex: getKnownColorHex(colTrimmed),
            });
          }
        });
      }
    });

    return Array.from(colorMap.values());
  }, [productsList]);

  const filteredProducts = useMemo(() => {
    return productsList
      .filter((p) => {
        // Search
        if (searchQuery.trim() && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }

        // Shape filter
        if (selectedShape !== "all") {
          const sLower = selectedShape.toLowerCase();
          const hasShape = p.shapes?.some((s) => s.toLowerCase().includes(sLower));
          const inTitle = p.title.toLowerCase().includes(sLower);
          if (!hasShape && !inTitle) return false;
        }

        // Type filter
        if (selectedType !== "all") {
          const tLower = selectedType.toLowerCase();
          if (tLower === "best-seller") {
            const isBestSeller =
              p.bestSeller === true ||
              p.category?.toLowerCase().includes("best") ||
              p.title.toLowerCase().includes("best") ||
              p.slug.toLowerCase().includes("best");
            if (!isBestSeller) return false;
          } else if (tLower === "handmade-grip-x-nails") {
            const isHandmade =
              p.handmadeGripX === true ||
              p.featured === true ||
              p.category?.toLowerCase().includes("handmade") ||
              p.category?.toLowerCase().includes("grip-x") ||
              p.title.toLowerCase().includes("handmade") ||
              p.slug.toLowerCase().includes("handmade");
            if (!isHandmade) return false;
          } else {
            const tName = tLower.replace(/-/g, " ");
            const matches =
              p.category?.toLowerCase().includes(tName) ||
              p.title.toLowerCase().includes(tName) ||
              p.slug.toLowerCase().includes(tLower);
            if (!matches) return false;
          }
        }

        // Design Theme Filter
        if (selectedTheme.length > 0) {
          const matchesTheme = selectedTheme.some((theme) => {
            const tLower = theme.toLowerCase();
            const hasTheme = p.designThemes?.some((dt) => dt.toLowerCase() === tLower);
            const inTitle = p.title.toLowerCase().includes(tLower);
            const inCategory = p.category?.toLowerCase().includes(tLower);
            const inDesc = p.description?.toLowerCase().includes(tLower);
            return hasTheme || inTitle || inCategory || inDesc;
          });
          if (!matchesTheme) return false;
        }

        // Color filter
        if (selectedColor) {
          const cLower = selectedColor.toLowerCase();
          const searchTerms = cLower.split(/[\/\s,]+/).filter((t) => t.length > 1);

          const hasColor = p.colors?.some((c) => {
            const pColLower = c.toLowerCase();
            return pColLower === cLower || searchTerms.some((term) => pColLower.includes(term));
          });
          const inTitle = searchTerms.some((term) => p.title.toLowerCase().includes(term));
          const inCategory = searchTerms.some((term) => p.category?.toLowerCase().includes(term));
          const inDesc = searchTerms.some((term) => p.description?.toLowerCase().includes(term));

          if (!hasColor && !inTitle && !inCategory && !inDesc) return false;
        }

        // Size filter
        if (selectedSize) {
          const szLower = selectedSize.toLowerCase();
          const hasSize = p.sizes?.some((s) => s.toLowerCase() === szLower);
          const stockVal = p.sizeStock
            ? (p.sizeStock[selectedSize] ?? p.sizeStock[selectedSize.toUpperCase()] ?? 0)
            : 0;
          const hasStockInSize = Number(stockVal) > 0;
          if (!hasSize && !hasStockInSize) return false;
        }

        // Length filter
        if (selectedLength) {
          const lLower = selectedLength.toLowerCase();
          const hasLen =
            p.length?.toLowerCase() === lLower ||
            p.lengths?.some((l) => l.toLowerCase() === lLower);
          const inTitle = p.title.toLowerCase().includes(lLower);
          if (!hasLen && !inTitle) return false;
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
  }, [
    productsList,
    searchQuery,
    selectedShape,
    selectedType,
    selectedTheme,
    selectedColor,
    selectedSize,
    selectedLength,
    maxPrice,
    sortBy,
  ]);

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
        <div className="flex items-center justify-center gap-3 sm:gap-6 overflow-x-auto pb-4 mb-4 border-b border-gray-100 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {shapes.map((s) => (
            <button
              key={s.name}
              onClick={() => setSelectedShape(selectedShape === s.name ? "all" : s.name)}
              className={`flex flex-col items-center group cursor-pointer transition-transform ${
                selectedShape === s.name ? "scale-105" : "hover:scale-102"
              }`}
            >
              <div
                className={`relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden flex items-center justify-center p-1.5 transition-all ${
                  selectedShape === s.name
                    ? "ring-2 ring-black bg-neutral-50 shadow-xs"
                    : "border border-transparent hover:border-gray-200 bg-neutral-50/50"
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
        <div className="flex flex-wrap items-center justify-center gap-2 pb-2 mb-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {DEFAULT_PRODUCT_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
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
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Design theme
                </h4>
                {selectedTheme.length > 0 && (
                  <button
                    onClick={() => setSelectedTheme([])}
                    className="text-[10px] text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
                  >
                    Clear ({selectedTheme.length})
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs text-gray-700">
                {availableThemes.map((theme) => (
                  <label key={theme} className="flex items-center gap-2 cursor-pointer hover:text-black transition-colors">
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
                      className="rounded-sm accent-black cursor-pointer"
                    />
                    <span>{theme}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color Swatches */}
            <div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Color {selectedColor && <span className="normal-case text-gray-500 font-normal text-[11px]">({selectedColor})</span>}
                </h4>
                {selectedColor && (
                  <button
                    onClick={() => setSelectedColor(null)}
                    className="text-[10px] text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-6 gap-2.5">
                {availableColors.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(isSelected ? null : c.name)}
                      title={c.name}
                      className={`w-7 h-7 rounded-full relative transition-all cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? "ring-2 ring-black ring-offset-1 scale-110 shadow-xs"
                          : "hover:scale-105"
                      }`}
                      style={{
                        background: c.hex,
                        border: c.border ? "1px solid #d4d4d8" : "1px solid rgba(0,0,0,0.08)",
                      }}
                    >
                      {isSelected && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            c.name.toLowerCase().includes("white") ||
                            c.name.toLowerCase().includes("pastel") ||
                            c.name.toLowerCase().includes("nude") ||
                            c.name.toLowerCase().includes("silver")
                              ? "bg-black"
                              : "bg-white"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Options */}
            <div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Size {selectedSize && <span className="normal-case text-gray-500 font-normal text-[11px]">({selectedSize})</span>}
                </h4>
                {selectedSize && (
                  <button
                    onClick={() => setSelectedSize(null)}
                    className="text-[10px] text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(selectedSize === sz ? null : sz)}
                    className={`min-w-8 h-8 px-2 rounded-sm border text-xs font-bold uppercase transition-colors cursor-pointer flex items-center justify-center ${
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
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Length {selectedLength && <span className="normal-case text-gray-500 font-normal text-[11px]">({selectedLength})</span>}
                </h4>
                {selectedLength && (
                  <button
                    onClick={() => setSelectedLength(null)}
                    className="text-[10px] text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-2 text-xs text-gray-700">
                {availableLengths.map((len) => (
                  <label key={len} className="flex items-center gap-2 cursor-pointer hover:text-black transition-colors">
                    <input
                      type="radio"
                      name="length"
                      checked={selectedLength === len}
                      onClick={() => {
                        if (selectedLength === len) {
                          setSelectedLength(null);
                        }
                      }}
                      onChange={() => setSelectedLength(len)}
                      className="accent-black cursor-pointer"
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

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white py-20 text-center text-xs text-gray-400">
          Loading products...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
