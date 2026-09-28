"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { PageDecorations } from "@/components/PageDecorations";

const bundleProducts = [
  {
    id: "bundle-cold-gel-glue",
    title: "Combo Cold Gel Glue",
    slug: "cold-gel-glue",
    image: "/images/IMG_7098.JPG",
    badge: "17% OFF",
    originalPrice: "$11.97",
    salePrice: "$9.99",
    priceNum: 9.99,
    actionType: "add_to_cart" as const,
  },
  {
    id: "bundle-combo-glue-remover",
    title: "Combo Cold Gel Glue & Remover",
    slug: "combo-cold-gel-glue-remover",
    image: "/images/IMG_7102.JPG",
    badge: "25% OFF",
    originalPrice: "$7.98",
    salePrice: "$5.99",
    priceNum: 5.99,
    actionType: "add_to_cart" as const,
  },
  {
    id: "bundle-13-trending-y2k",
    title: "13 Trending Y2K Handmade Nail Sets + 2 Bottles Premium Gel Glue",
    slug: "13-trending-y2k-handmade-nail-sets-2-bottles-premium-gel-glue",
    image: "/images/IMG_7106.JPG",
    badge: "62% OFF",
    originalPrice: null,
    salePrice: "From $2.68",
    priceNum: 2.68,
    actionType: "select_options" as const,
  },
];

export default function BundleAndSavePage() {
  const { addItem } = useCart();
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="relative bg-white min-h-[75vh] overflow-hidden">
      {/* Background Motifs */}
      <PageDecorations preset="bundle" />

      <section className="relative z-10 py-8 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 tracking-tight">
            Bundle and Save
          </h2>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {bundleProducts.map((prod) => (
            <div
              key={prod.id}
              className="group relative flex flex-col bg-white border border-transparent hover:border-gray-100 rounded-sm transition-all"
            >
              {/* Image Box */}
              <div className="relative aspect-square w-full bg-neutral-50 overflow-hidden">
                {/* Discount Badge */}
                {prod.badge && (
                  <span className="absolute top-2 left-2 z-10 bg-amber-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                    {prod.badge}
                  </span>
                )}

                {/* Wishlist Button */}
                <button
                  onClick={(e) => toggleWishlist(prod.id, e)}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white text-neutral-600 hover:text-rose-600 transition-colors shadow-xs"
                  aria-label="Wishlist"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      wishlist[prod.id] ? "fill-rose-600 text-rose-600" : ""
                    }`}
                  />
                </button>

                <Link
                  href={
                    prod.actionType === "select_options"
                      ? `/product/${prod.slug}`
                      : `/product/${prod.slug}`
                  }
                  className="relative block w-full h-full"
                >
                  <Image
                    src={prod.image}
                    alt={prod.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
              </div>

              {/* Title & Price & Action */}
              <div className="pt-3 pb-2 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-neutral-900 line-clamp-2 leading-snug hover:text-neutral-600">
                    <Link href={`/product/${prod.slug}`}>{prod.title}</Link>
                  </h3>

                  <div className="mt-1 flex items-baseline gap-1.5 text-xs sm:text-sm font-semibold">
                    {prod.originalPrice ? (
                      <>
                        <span className="text-neutral-400 line-through text-xs font-normal">
                          {prod.originalPrice}
                        </span>
                        <span className="text-neutral-900">{prod.salePrice}</span>
                      </>
                    ) : (
                      <span className="text-neutral-900">{prod.salePrice}</span>
                    )}
                  </div>
                </div>

                <div className="pt-1">
                  {prod.actionType === "add_to_cart" ? (
                    <button
                      onClick={() =>
                        addItem({
                          id: prod.id,
                          title: prod.title,
                          slug: prod.slug,
                          price: prod.salePrice,
                          image: prod.image,
                          maxStock: 25,
                        })
                      }
                      className="w-full py-2 px-3 border border-black hover:bg-black hover:text-white text-black text-[11px] font-bold uppercase tracking-wider rounded-sm transition-colors text-center"
                    >
                      Add to cart
                    </button>
                  ) : (
                    <Link
                      href={`/product/${prod.slug}`}
                      className="block w-full py-2 px-3 border border-black hover:bg-black hover:text-white text-black text-[11px] font-bold uppercase tracking-wider rounded-sm transition-colors text-center"
                    >
                      Select options
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
