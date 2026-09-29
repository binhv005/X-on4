"use client";

import React, { useState, use, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ProductCard, type Product } from "@/components/ProductCard";
import productsData from "@/data/products.json";
import {
  Star,
  ShieldCheck,
  Zap,
  Truck,
  RotateCcw,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageDecorations } from "@/components/PageDecorations";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const rawSlug = resolvedParams.slug;
  const decodedSlug = decodeURIComponent(rawSlug).toLowerCase().trim();

  // Find static product fallback if available
  const staticProduct = (productsData as Product[]).find((p) => {
    const s = (p.slug || "").toLowerCase().trim();
    const id = (p.id || "").toLowerCase().trim();
    return s === decodedSlug || id === decodedSlug || s === rawSlug.toLowerCase() || id === rawSlug.toLowerCase();
  });

  const { addItem, items } = useCart();
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);
  const [selectedSize, setSelectedSize] = useState<string>("S");
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState(false);
  const [stock, setStock] = useState<number>(staticProduct?.stock ?? 20);
  const [productDetails, setProductDetails] = useState<any>(staticProduct || null);
  const [notFoundState, setNotFoundState] = useState(false);
  const [activeImage, setActiveImage] = useState<string>("");

  // Fetch live product from API to get exact product & stock from DataStore
  useEffect(() => {
    let isMounted = true;
    async function fetchLiveProduct() {
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(rawSlug)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            setProductDetails(json.data);
            if (typeof json.data.stock === "number") {
              setStock(json.data.stock);
            }
          }
        } else if (!staticProduct && isMounted) {
          setNotFoundState(true);
        }
      } catch (err) {
        console.error("Error fetching live product stock:", err);
        if (!staticProduct && isMounted) {
          setNotFoundState(true);
        }
      }
    }
    fetchLiveProduct();
    return () => {
      isMounted = false;
    };
  }, [rawSlug, staticProduct]);

  if (notFoundState && !staticProduct && !productDetails) {
    notFound();
  }

  const DEFAULT_SIZE_INFO: Record<string, { label: string; desc: string }> = {
    XS: { label: "XS", desc: "14 · 10 · 11 · 10 · 7 mm" },
    S: { label: "S", desc: "15 · 11 · 12 · 11 · 8 mm" },
    M: { label: "M", desc: "16 · 12 · 13 · 12 · 9 mm" },
    L: { label: "L", desc: "17 · 13 · 14 · 13 · 10 mm" },
    Custom: { label: "Custom", desc: "Custom Sizing" },
  };

  const raw = productDetails || staticProduct;

  interface SizeOption {
    label: string;
    desc: string;
  }

  const sizes: SizeOption[] = React.useMemo(() => {
    const list: string[] = Array.isArray(raw?.sizes) && raw.sizes.length > 0
      ? raw.sizes
      : ["XS", "S", "M", "L", "Custom"];
    return list.map((sz: string) => ({
      label: sz,
      desc: DEFAULT_SIZE_INFO[sz]?.desc || "Standard Size",
    }));
  }, [raw?.sizes]);

  // Size-specific stock calculation
  const getSizeStock = (sizeLabel: string): number => {
    if (!raw) return 0;
    if (raw.sizeStock && raw.sizeStock[sizeLabel] !== undefined) {
      return Math.max(0, parseInt(raw.sizeStock[sizeLabel]) || 0);
    }
    return Math.max(0, typeof raw.stock === "number" ? raw.stock : 20);
  };

  const currentSizeStock = getSizeStock(selectedSize);
  const itemCartId = `${raw?.id || raw?.slug || rawSlug}-${selectedSize}`;
  const inCartQty = items.find((i) => i.id === itemCartId || (i.slug === (raw?.slug || rawSlug) && i.size === selectedSize))?.quantity || 0;
  const remainingAllowed = Math.max(0, currentSizeStock - inCartQty);

  // Auto-clamp quantity if exceeding remaining stock
  useEffect(() => {
    if (remainingAllowed > 0 && quantity > remainingAllowed) {
      setQuantity(remainingAllowed);
    } else if (remainingAllowed === 0 && quantity !== 1) {
      setQuantity(1);
    }
  }, [selectedSize, remainingAllowed, quantity]);

  const scrollThumbnails = (direction: "left" | "right") => {
    if (thumbnailScrollRef.current) {
      const scrollAmount = 200;
      thumbnailScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!raw) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const product: Product = {
    id: raw.id || raw.slug || rawSlug,
    slug: raw.slug || rawSlug,
    title: raw.name || raw.title || "X-ON Nails",
    price:
      typeof raw.price === "number"
        ? `$${raw.price.toFixed(2)}`
        : typeof raw.price === "string" && raw.price.startsWith("$")
        ? raw.price
        : raw.price
        ? `$${raw.price}`
        : "$24.99",
    originalPrice: raw.salePrice
      ? typeof raw.salePrice === "number"
        ? `$${raw.salePrice.toFixed(2)}`
        : `$${raw.salePrice}`
      : undefined,
    image:
      activeImage ||
      raw.thumbnail ||
      raw.images?.[0] ||
      raw.image ||
      "/images/IMG_7098.webp",
    category: raw.category || "Handmade Grip-X Nails",
    url: `/product/${raw.slug || rawSlug}`,
    description: raw.description || "",
    stock: currentSizeStock,
  };

  const rawImagesList: string[] = Array.isArray(raw.images) && raw.images.length > 0 
    ? raw.images 
    : [raw.thumbnail || raw.image || product.image].filter(Boolean);
  const galleryImages: string[] = Array.from(new Set(rawImagesList.filter(Boolean)));

  const handleAddToCart = () => {
    if (remainingAllowed <= 0) return;

    const addedQty = Math.min(quantity, remainingAllowed);
    addItem(
      {
        id: `${product.id}-${selectedSize}`,
        slug: product.slug,
        title: product.title,
        price: product.price,
        image: product.image,
        size: selectedSize,
        maxStock: currentSizeStock,
      },
      addedQty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const relatedProducts = (productsData as Product[])
    .filter((p) => p.slug !== product.slug && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="relative bg-white min-h-screen py-10 sm:py-16 overflow-hidden">
      {/* Background Motifs */}
      <PageDecorations preset="category" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-neutral-400 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-black">
            Shop
          </Link>
          <span>/</span>
          <span className="text-neutral-800 font-medium truncate max-w-xs">
            {product.title}
          </span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Product Images Gallery */}
          <div className="space-y-4">
            {/* Main Featured Image */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-50 border border-gray-100 shadow-sm group">
              <Image
                src={product.image || "/images/logolala.webp"}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {product.originalPrice && (
                <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md z-10">
                  Sale
                </span>
              )}

              {/* Prev / Next navigation on main image if multiple images exist */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const curIdx = galleryImages.indexOf(product.image);
                      const nextIdx = curIdx <= 0 ? galleryImages.length - 1 : curIdx - 1;
                      setActiveImage(galleryImages[nextIdx]);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-neutral-800 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer z-10 hover:scale-110"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const curIdx = galleryImages.indexOf(product.image);
                      const nextIdx = curIdx >= galleryImages.length - 1 ? 0 : curIdx + 1;
                      setActiveImage(galleryImages[nextIdx]);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-neutral-800 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer z-10 hover:scale-110"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Horizontal Scrolling Thumbnail Slider */}
            {galleryImages.length > 1 && (
              <div className="relative group/thumbs pt-1">
                {/* Scroll Left Button */}
                <button
                  type="button"
                  onClick={() => scrollThumbnails("left")}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/95 hover:bg-white text-neutral-800 rounded-full shadow-md border border-neutral-200 flex items-center justify-center transition-all opacity-0 group-hover/thumbs:opacity-100 hover:scale-105 cursor-pointer"
                  aria-label="Scroll thumbnails left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Horizontal Scrollable Thumbnails Container */}
                <div
                  ref={thumbnailScrollRef}
                  className="flex items-center gap-3 overflow-x-auto py-1 px-1 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                  {galleryImages.map((img: string, idx: number) => {
                    const isSelected = product.image === img;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImage(img)}
                        className={`relative w-20 h-20 sm:w-22 sm:h-22 shrink-0 rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200 snap-start ${
                          isSelected
                            ? "border-black ring-2 ring-black/15 shadow-sm scale-102"
                            : "border-neutral-200/80 hover:border-neutral-400 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${product.title} thumbnail ${idx + 1}`}
                          fill
                          sizes="88px"
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Scroll Right Button */}
                <button
                  type="button"
                  onClick={() => scrollThumbnails("right")}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/95 hover:bg-white text-neutral-800 rounded-full shadow-md border border-neutral-200 flex items-center justify-center transition-all opacity-0 group-hover/thumbs:opacity-100 hover:scale-105 cursor-pointer"
                  aria-label="Scroll thumbnails right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Right: Product Info & Purchase Options */}
          <div className="flex flex-col space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                {product.category || "Handmade Grip-X Nails"}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-gray-950 mt-3 font-serif">
                {product.title}
              </h1>

              {/* Rating & Review counter */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-semibold text-gray-700">4.9 / 5.0</span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500 underline cursor-pointer hover:text-black">
                  128 Customer Reviews
                </span>
              </div>

              {/* Price & Live Stock */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-2xl sm:text-3xl font-bold text-gray-950">
                  {product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {product.originalPrice}
                  </span>
                )}
                {currentSizeStock > 0 ? (
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    In Stock ({currentSizeStock} available for Size {selectedSize})
                  </span>
                ) : (
                  <span className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                    Size {selectedSize} Out of Stock
                  </span>
                )}
              </div>
            </div>

              {/* Size Selector with Per-Size Stock Breakdown */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    Select Size
                  </label>
                  <Link
                    href="/sizing-chart"
                    className="text-xs text-rose-600 hover:underline font-medium"
                  >
                    Size Guide &amp; Measurement
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {sizes.map((s) => {
                    const szStock = getSizeStock(s.label);
                    const isSelected = selectedSize === s.label;
                    const isSoldOut = szStock <= 0;

                    return (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => setSelectedSize(s.label)}
                        className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer relative ${
                          isSelected
                            ? "border-black bg-black text-white shadow-sm ring-1 ring-black"
                            : isSoldOut
                            ? "border-gray-200 bg-gray-50/70 text-gray-400 hover:border-gray-300"
                            : "border-gray-200 bg-white text-gray-800 hover:border-gray-400"
                        }`}
                      >
                        <span className="block font-bold text-sm">{s.label}</span>
                        <span
                          className={`block text-[10px] mt-0.5 ${
                            isSelected ? "text-neutral-300" : "text-neutral-400"
                          }`}
                        >
                          {s.desc}
                        </span>
                        <span
                          className={`block text-[10px] font-bold mt-1 ${
                            isSoldOut
                              ? isSelected
                                ? "text-rose-300"
                                : "text-rose-500"
                              : szStock <= 3
                              ? isSelected
                                ? "text-amber-300"
                                : "text-amber-600"
                              : isSelected
                              ? "text-emerald-300"
                              : "text-emerald-600"
                          }`}
                        >
                          {isSoldOut
                            ? "Sold out"
                            : szStock <= 3
                            ? `${szStock} left`
                            : `${szStock} in stock`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector & Add to Cart */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    Quantity
                  </label>
                  {currentSizeStock > 0 && (
                    <span className="text-[11px] text-neutral-500">
                      {inCartQty > 0
                        ? `${inCartQty} in cart · ${remainingAllowed} more allowed`
                        : `${remainingAllowed} units allowed max`}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50/50 p-1 w-full sm:w-auto justify-between sm:justify-start">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1 || remainingAllowed <= 0}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-black hover:bg-white rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-sm text-gray-900">
                      {remainingAllowed > 0 ? quantity : 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(remainingAllowed, quantity + 1))}
                      disabled={quantity >= remainingAllowed || remainingAllowed <= 0}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-black hover:bg-white rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={remainingAllowed <= 0 || currentSizeStock <= 0}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-md ${
                      currentSizeStock <= 0 || remainingAllowed <= 0
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                        : added
                        ? "bg-emerald-600 text-white"
                        : "bg-neutral-900 hover:bg-black text-white hover:shadow-lg cursor-pointer"
                    }`}
                  >
                    {added ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 animate-bounce" />
                        <span>Added to Bag!</span>
                      </>
                    ) : currentSizeStock <= 0 ? (
                      <span>Size {selectedSize} - Sold Out</span>
                    ) : remainingAllowed <= 0 ? (
                      <span>Max In Cart ({currentSizeStock} Total)</span>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Shopping Bag</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Stock alert messages */}
                {currentSizeStock <= 0 ? (
                  <p className="text-[11px] text-rose-600 font-medium">
                    This size is currently sold out. Please select another size variant.
                  </p>
                ) : remainingAllowed <= 0 ? (
                  <p className="text-[11px] text-amber-600 font-medium">
                    You have added all available stock ({currentSizeStock} units) for Size {selectedSize} to your shopping bag.
                  </p>
                ) : null}
              </div>

            {/* Value Props */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 text-xs text-gray-700">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Patented Cold Gel Tech</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Non-damaging Natural Nails</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-blue-600" />
                <span>Reusable 5+ Times</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-rose-600" />
                <span>Free Shipping over $50</span>
              </div>
            </div>

            {/* Product Details & Specs */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                What&apos;s Included
              </h3>
              <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4">
                <li>10 Custom Handmade Press-On Nails</li>
                <li>Lalafolie Cold Gel Adhesive Formulation</li>
                <li>Mini nail buffer &amp; cuticle pusher</li>
                <li>Alcohol prep wipes &amp; instructional guide</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-24 pt-12 border-t border-gray-100">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              Complete Your Look
            </span>
            <h2 className="text-2xl font-extrabold uppercase tracking-tight text-gray-950 mt-1">
              You May Also Love
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
