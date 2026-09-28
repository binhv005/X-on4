"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard, type Product } from "@/components/ProductCard";
import productsData from "@/data/products.json";
import { mapApiProduct } from "@/lib/productMapper";
import { PageDecorations } from "@/components/PageDecorations";

const categoryNames: Record<string, { title: string; desc: string }> = {
  "handmade-grip-x-nails": {
    title: "Handmade Grip-X Nails",
    desc: "Patented Grip-X technology crafted by hand. Lightweight, flexible, and perfectly shaped for an undetectable fit.",
  },
  "cold-gel-glue": {
    title: "Cold Gel Glue",
    desc: "Non-damaging, room-temperature curing gel adhesive engineered to hold your nails secure for 3-4 weeks.",
  },
  "cold-gel-remover": {
    title: "Cold Gel Remover",
    desc: "Nourishing and gentle removal solution. Dissolves adhesive safely without drying cuticles or soaking in acetone.",
  },
  "best-seller": {
    title: "Best Sellers",
    desc: "Our most sought-after designs and iconic nail art, loved and reviewed by thousands nationwide.",
  },
};

export default function ProductTypeCategoryPage({
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

  const info = categoryNames[slug] || {
    title: slug.replace(/-/g, " ").toUpperCase(),
    desc: "Explore our premium handcrafted nail collection.",
  };

  // Filter products matching category
  const filtered = productsList.filter((p) => {
    if (slug === "handmade-grip-x-nails") {
      return (
        p.handmadeGripX === true ||
        p.featured === true ||
        p.category?.toLowerCase().includes("handmade") ||
        p.category?.toLowerCase().includes("grip-x") ||
        p.title.toLowerCase().includes("handmade") ||
        p.slug.toLowerCase().includes("handmade")
      );
    }
    if (slug === "best-seller") {
      return (
        p.bestSeller === true ||
        p.category?.toLowerCase().includes("best") ||
        p.title.toLowerCase().includes("best") ||
        p.slug.toLowerCase().includes("best")
      );
    }
    if (slug === "cold-gel-glue") return p.slug.includes("glue") || p.title.toLowerCase().includes("glue");
    if (slug === "cold-gel-remover") return p.slug.includes("remover") || p.title.toLowerCase().includes("remover");
    return p.category?.toLowerCase().includes(slug.toLowerCase()) || p.slug.toLowerCase().includes(slug.toLowerCase());
  });

  return (
    <div className="relative bg-white min-h-screen py-12 sm:py-16 overflow-hidden">
      {/* Background Motifs */}
      <PageDecorations preset="category" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
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
            Category
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-gray-950 mt-1 font-serif">
            {info.title}
          </h1>
          <p className="text-sm text-gray-500 mt-2">{info.desc}</p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>
    </div>
  );
}
