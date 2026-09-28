"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { ProductCard, type Product } from "@/components/ProductCard";
import productsData from "@/data/products.json";
import { mapApiProduct } from "@/lib/productMapper";
import { PageDecorations } from "@/components/PageDecorations";

const themeDescriptions: Record<string, { title: string; desc: string }> = {
  "3d": {
    title: "3D Nail Art & Sculpted Luxury",
    desc: "Dimensional nail jewels, textured ribbons, pearls, and handcrafted relief art.",
  },
  "flower": {
    title: "Floral & Botanical Themes",
    desc: "Hand-painted blossoms, petals, and nature-inspired elegance for any occasion.",
  },
  "y2k": {
    title: "Y2K Aesthetic & Cyberpunk Glam",
    desc: "Chrome finishes, futuristic metallics, bold graphics, and nostalgic retro charms.",
  },
};

export default function DesignThemeCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [productsList, setProductsList] = useState<Product[]>(() =>
    (productsData as any[]).map(mapApiProduct)
  );

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
        console.error("Failed to load live products:", err);
      }
    }
    loadLiveProducts();
  }, []);

  const info = themeDescriptions[slug] || {
    title: `${slug.toUpperCase()} Theme`,
    desc: "Discover our specialized nail art theme collection.",
  };

  const filtered = productsList.filter((p) => {
    const slugLower = slug.toLowerCase();
    const hasThemeMatch =
      Array.isArray(p.designThemes) &&
      p.designThemes.some((t) => t.toLowerCase() === slugLower || t.toLowerCase().includes(slugLower));

    return (
      hasThemeMatch ||
      p.title.toLowerCase().includes(slugLower) ||
      p.category?.toLowerCase().includes(slugLower) ||
      p.slug.toLowerCase().includes(slugLower)
    );
  });

  // Fallback to general list if filter produces few
  const displayProducts = filtered.length > 0 ? filtered : productsList.slice(0, 12);

  return (
    <div className="relative bg-white min-h-screen py-12 sm:py-16 overflow-hidden">
      {/* Background Motifs */}
      <PageDecorations preset="category" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="text-xs text-neutral-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-black">
            Shop
          </Link>
          <span>/</span>
          <span className="text-neutral-800 font-medium">{info.title}</span>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            Design Theme
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-gray-950 mt-1 font-serif">
            {info.title}
          </h1>
          <p className="text-sm text-gray-500 mt-2">{info.desc}</p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>
    </div>
  );
}
