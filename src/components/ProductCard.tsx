"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Eye } from "lucide-react";

export interface Product {
  id: string;
  slug: string;
  title: string;
  price: string;
  originalPrice?: string;
  image: string;
  category?: string;
  shapes?: string[];
  designThemes?: string[];
  colors?: string[];
  colorOptions?: { name: string; hex: string; border?: boolean }[];
  sizes?: string[];
  sizeStock?: Record<string, number>;
  length?: string;
  lengths?: string[];
  bestSeller?: boolean;
  handmadeGripX?: boolean;
  featured?: boolean;
  url: string;
  description?: string;
  stock?: number;
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  return (
    <div className="group relative flex flex-col bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        <Link href={`/product/${product.slug}`} className="relative block w-full h-full">
          <Image
            src={product.image || "/images/logolala.webp"}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {isOutOfStock ? (
            <span className="bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
              Out of stock
            </span>
          ) : product.originalPrice ? (
            <span className="bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
              Sale
            </span>
          ) : null}
        </div>

        {/* Quick Add Overlay Button on Hover */}
        <div className="absolute inset-x-2 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1.5">
          {!isOutOfStock ? (
            <button
              onClick={() =>
                addItem({
                  id: product.id,
                  slug: product.slug,
                  title: product.title,
                  price: product.price,
                  image: product.image,
                  maxStock: product.stock ?? 25,
                })
              }
              className="flex-1 bg-black/90 hover:bg-black text-white text-xs font-semibold py-2 px-3 rounded-md backdrop-blur-xs flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
            </button>
          ) : (
            <span className="flex-1 bg-neutral-800/80 text-white text-[11px] font-semibold py-2 px-3 rounded-md text-center">
              Out of stock
            </span>
          )}
          <Link
            href={`/product/${product.slug}`}
            className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-md backdrop-blur-xs flex items-center justify-center shadow-md transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-3.5 flex flex-col flex-1">
        {product.category && (
          <p className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400 mb-1">
            {product.category}
          </p>
        )}
        <h3 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 hover:text-rose-700 transition-colors mb-1.5">
          <Link href={`/product/${product.slug}`}>{product.title}</Link>
        </h3>

        <div className="mt-auto flex items-center gap-2 pt-1">
          <span className="text-sm sm:text-base font-bold text-gray-950">
            {product.price}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              {product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
