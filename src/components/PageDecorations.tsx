"use client";

import React from "react";
import Image from "next/image";

export type DecorationPreset =
  | "about"
  | "shop"
  | "sizing-chart"
  | "wholesale"
  | "bundle"
  | "contact"
  | "blog"
  | "category"
  | "cart"
  | "gallery"
  | "floral-soft"
  | "tools-luxe";

interface PageDecorationsProps {
  preset?: DecorationPreset;
  className?: string;
}

export function PageDecorations({ preset = "floral-soft", className = "" }: PageDecorationsProps) {
  if (preset === "about") {
    return (
      <div className={`pointer-events-none select-none overflow-hidden ${className}`}>
        {/* Top-Left: Rose Bloom */}
        <div className="absolute -top-10 -left-10 w-48 h-48 sm:w-64 sm:h-64 opacity-25 rotate-[-15deg]">
          <Image
            src="/images/decorations/rose-bloom.webp"
            alt=""
            fill
            sizes="256px"
            className="object-contain"
          />
        </div>
        {/* Top-Right: Daisy Cluster */}
        <div className="absolute top-12 -right-8 w-52 h-52 sm:w-72 sm:h-72 opacity-25 rotate-15">
          <Image
            src="/images/decorations/daisy-cluster.webp"
            alt=""
            fill
            sizes="288px"
            className="object-contain"
          />
        </div>
        {/* Mid-Left: Chamomile Sprig */}
        <div className="absolute top-1/2 -left-8 w-40 h-40 sm:w-56 sm:h-56 opacity-20 rotate-[-20deg]">
          <Image
            src="/images/decorations/chamomile-sprig.webp"
            alt=""
            fill
            sizes="224px"
            className="object-contain"
          />
        </div>
        {/* Bottom-Left: Gold Scissors */}
        <div className="absolute -bottom-8 left-4 w-36 h-36 sm:w-48 sm:h-48 opacity-20 rotate-[-10deg]">
          <Image
            src="/images/decorations/gold-scissors.webp"
            alt=""
            fill
            sizes="192px"
            className="object-contain"
          />
        </div>
        {/* Bottom-Right: Polish Bottle & Petals */}
        <div className="absolute -bottom-10 -right-6 w-44 h-52 sm:w-56 sm:h-64 opacity-25 rotate-12">
          <Image
            src="/images/decorations/polish-bottle.webp"
            alt=""
            fill
            sizes="224px"
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  if (preset === "shop" || preset === "category") {
    return (
      <div className={`pointer-events-none select-none overflow-hidden ${className}`}>
        {/* Top-Left: Petals Scatter */}
        <div className="absolute top-6 -left-10 w-52 h-52 sm:w-68 sm:h-68 opacity-20 rotate-[-12deg]">
          <Image
            src="/images/decorations/petals-scatter.webp"
            alt=""
            fill
            sizes="272px"
            className="object-contain"
          />
        </div>
        {/* Top-Right: Pink Brush */}
        <div className="absolute top-24 -right-8 w-40 h-52 sm:w-52 sm:h-68 opacity-20 rotate-[35deg]">
          <Image
            src="/images/decorations/pink-brush.webp"
            alt=""
            fill
            sizes="256px"
            className="object-contain"
          />
        </div>
        {/* Mid-Right: Daisy Rose Sprig */}
        <div className="absolute top-1/2 -right-8 w-48 h-48 sm:w-60 sm:h-60 opacity-20 rotate-[-15deg]">
          <Image
            src="/images/decorations/daisy-rose-sprig.webp"
            alt=""
            fill
            sizes="240px"
            className="object-contain"
          />
        </div>
        {/* Bottom-Left: Rose Bloom */}
        <div className="absolute -bottom-12 -left-10 w-52 h-52 sm:w-68 sm:h-68 opacity-20 rotate-15">
          <Image
            src="/images/decorations/rose-bloom.webp"
            alt=""
            fill
            sizes="272px"
            className="object-contain"
          />
        </div>
        {/* Bottom-Right: Gold Stars */}
        <div className="absolute -bottom-8 right-6 w-40 h-40 sm:w-52 sm:h-52 opacity-25 rotate-[-10deg]">
          <Image
            src="/images/decorations/gold-stars.webp"
            alt=""
            fill
            sizes="208px"
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  if (preset === "sizing-chart") {
    return (
      <div className={`pointer-events-none select-none overflow-hidden ${className}`}>
        {/* Top-Left: Daisy Cluster */}
        <div className="absolute top-4 -left-10 w-48 h-48 sm:w-64 sm:h-64 opacity-25 rotate-[-10deg]">
          <Image
            src="/images/decorations/daisy-cluster.webp"
            alt=""
            fill
            sizes="256px"
            className="object-contain"
          />
        </div>
        {/* Top-Right: Manicure Tools */}
        <div className="absolute top-10 -right-6 w-44 h-52 sm:w-56 sm:h-64 opacity-20 rotate-15">
          <Image
            src="/images/decorations/manicure-tools.webp"
            alt=""
            fill
            sizes="224px"
            className="object-contain"
          />
        </div>
        {/* Mid-Left: Gold Scissors */}
        <div className="absolute top-1/3 -left-6 w-36 h-36 sm:w-48 sm:h-48 opacity-20 rotate-[-25deg]">
          <Image
            src="/images/decorations/gold-scissors.webp"
            alt=""
            fill
            sizes="192px"
            className="object-contain"
          />
        </div>
        {/* Mid-Right: Pink Brush */}
        <div className="absolute top-2/3 -right-6 w-36 h-48 sm:w-48 sm:h-60 opacity-20 rotate-[30deg]">
          <Image
            src="/images/decorations/pink-brush.webp"
            alt=""
            fill
            sizes="240px"
            className="object-contain"
          />
        </div>
        {/* Bottom-Left: Rose Bloom */}
        <div className="absolute -bottom-10 -left-8 w-48 h-48 sm:w-60 sm:h-60 opacity-20 rotate-12">
          <Image
            src="/images/decorations/rose-bloom.webp"
            alt=""
            fill
            sizes="240px"
            className="object-contain"
          />
        </div>
        {/* Bottom-Right: Pearl Diamond */}
        <div className="absolute -bottom-6 right-8 w-36 h-36 sm:w-48 sm:h-48 opacity-25 rotate-[-15deg]">
          <Image
            src="/images/decorations/pearl-diamond.webp"
            alt=""
            fill
            sizes="192px"
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  if (preset === "wholesale") {
    return (
      <div className={`pointer-events-none select-none overflow-hidden ${className}`}>
        {/* Top-Left: Polish Bottle */}
        <div className="absolute top-8 -left-8 w-40 h-52 sm:w-52 sm:h-64 opacity-25 rotate-[-15deg]">
          <Image
            src="/images/decorations/polish-bottle.webp"
            alt=""
            fill
            sizes="224px"
            className="object-contain"
          />
        </div>
        {/* Top-Right: Manicure Tools */}
        <div className="absolute top-6 -right-8 w-48 h-56 sm:w-60 sm:h-68 opacity-20 rotate-15">
          <Image
            src="/images/decorations/manicure-tools.webp"
            alt=""
            fill
            sizes="240px"
            className="object-contain"
          />
        </div>
        {/* Mid-Left: Gold Stars */}
        <div className="absolute top-1/2 -left-6 w-36 h-36 sm:w-48 sm:h-48 opacity-25 rotate-12">
          <Image
            src="/images/decorations/gold-stars.webp"
            alt=""
            fill
            sizes="192px"
            className="object-contain"
          />
        </div>
        {/* Bottom-Left: Chamomile Sprig */}
        <div className="absolute -bottom-8 -left-6 w-44 h-44 sm:w-56 sm:h-56 opacity-20 rotate-[-15deg]">
          <Image
            src="/images/decorations/chamomile-sprig.webp"
            alt=""
            fill
            sizes="224px"
            className="object-contain"
          />
        </div>
        {/* Bottom-Right: Daisy Rose Sprig */}
        <div className="absolute -bottom-8 -right-6 w-48 h-48 sm:w-60 sm:h-60 opacity-25 rotate-10">
          <Image
            src="/images/decorations/daisy-rose-sprig.webp"
            alt=""
            fill
            sizes="240px"
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  if (preset === "contact") {
    return (
      <div className={`pointer-events-none select-none overflow-hidden ${className}`}>
        {/* Top-Left: Daisy Cluster */}
        <div className="absolute top-6 -left-10 w-48 h-48 sm:w-64 sm:h-64 opacity-25 rotate-[-12deg]">
          <Image
            src="/images/decorations/daisy-cluster.webp"
            alt=""
            fill
            sizes="256px"
            className="object-contain"
          />
        </div>
        {/* Top-Right: Petals Scatter */}
        <div className="absolute top-8 -right-10 w-52 h-52 sm:w-68 sm:h-68 opacity-25 rotate-15">
          <Image
            src="/images/decorations/petals-scatter.webp"
            alt=""
            fill
            sizes="272px"
            className="object-contain"
          />
        </div>
        {/* Mid-Left: Gold Scissors */}
        <div className="absolute top-1/2 -left-6 w-36 h-36 sm:w-48 sm:h-48 opacity-20 rotate-[-20deg]">
          <Image
            src="/images/decorations/gold-scissors.webp"
            alt=""
            fill
            sizes="192px"
            className="object-contain"
          />
        </div>
        {/* Bottom-Left: Rose Bloom */}
        <div className="absolute -bottom-10 -left-6 w-48 h-48 sm:w-60 sm:h-60 opacity-20 rotate-15">
          <Image
            src="/images/decorations/rose-bloom.webp"
            alt=""
            fill
            sizes="240px"
            className="object-contain"
          />
        </div>
        {/* Bottom-Right: Polish Bottle */}
        <div className="absolute -bottom-8 -right-6 w-40 h-52 sm:w-52 sm:h-64 opacity-25 rotate-[-10deg]">
          <Image
            src="/images/decorations/polish-bottle.webp"
            alt=""
            fill
            sizes="224px"
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  if (preset === "bundle") {
    return (
      <div className={`pointer-events-none select-none overflow-hidden ${className}`}>
        {/* Top-Left: Rose Bloom */}
        <div className="absolute top-4 -left-10 w-48 h-48 sm:w-64 sm:h-64 opacity-25 rotate-[-15deg]">
          <Image
            src="/images/decorations/rose-bloom.webp"
            alt=""
            fill
            sizes="256px"
            className="object-contain"
          />
        </div>
        {/* Top-Right: Pink Brush */}
        <div className="absolute top-8 -right-8 w-40 h-52 sm:w-52 sm:h-68 opacity-20 rotate-[30deg]">
          <Image
            src="/images/decorations/pink-brush.webp"
            alt=""
            fill
            sizes="256px"
            className="object-contain"
          />
        </div>
        {/* Bottom-Left: Petals Scatter */}
        <div className="absolute -bottom-8 -left-8 w-48 h-48 sm:w-60 sm:h-60 opacity-20 rotate-[-10deg]">
          <Image
            src="/images/decorations/petals-scatter.webp"
            alt=""
            fill
            sizes="240px"
            className="object-contain"
          />
        </div>
        {/* Bottom-Right: Daisy Cluster */}
        <div className="absolute -bottom-10 -right-8 w-48 h-48 sm:w-64 sm:h-64 opacity-25 rotate-15">
          <Image
            src="/images/decorations/daisy-cluster.webp"
            alt=""
            fill
            sizes="256px"
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  if (preset === "blog") {
    return (
      <div className={`pointer-events-none select-none overflow-hidden ${className}`}>
        {/* Top-Left: Daisy Cluster */}
        <div className="absolute top-6 -left-10 w-48 h-48 sm:w-64 sm:h-64 opacity-25 rotate-[-10deg]">
          <Image
            src="/images/decorations/daisy-cluster.webp"
            alt=""
            fill
            sizes="256px"
            className="object-contain"
          />
        </div>
        {/* Top-Right: Rose Bloom */}
        <div className="absolute top-10 -right-8 w-52 h-52 sm:w-68 sm:h-68 opacity-25 rotate-15">
          <Image
            src="/images/decorations/rose-bloom.webp"
            alt=""
            fill
            sizes="272px"
            className="object-contain"
          />
        </div>
        {/* Mid-Right: Pink Brush */}
        <div className="absolute top-1/2 -right-8 w-36 h-48 sm:w-48 sm:h-64 opacity-20 rotate-[35deg]">
          <Image
            src="/images/decorations/pink-brush.webp"
            alt=""
            fill
            sizes="240px"
            className="object-contain"
          />
        </div>
        {/* Bottom-Left: Chamomile Sprig */}
        <div className="absolute -bottom-8 -left-6 w-44 h-44 sm:w-56 sm:h-56 opacity-20 rotate-[-15deg]">
          <Image
            src="/images/decorations/chamomile-sprig.webp"
            alt=""
            fill
            sizes="224px"
            className="object-contain"
          />
        </div>
        {/* Bottom-Right: Petals Scatter */}
        <div className="absolute -bottom-10 right-6 w-48 h-48 sm:w-60 sm:h-60 opacity-25 rotate-12">
          <Image
            src="/images/decorations/petals-scatter.webp"
            alt=""
            fill
            sizes="240px"
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  if (preset === "cart") {
    return (
      <div className={`pointer-events-none select-none overflow-hidden ${className}`}>
        {/* Top-Left: Daisy Rose Sprig */}
        <div className="absolute top-6 -left-8 w-44 h-44 sm:w-56 sm:h-56 opacity-25 rotate-[-12deg]">
          <Image
            src="/images/decorations/daisy-rose-sprig.webp"
            alt=""
            fill
            sizes="224px"
            className="object-contain"
          />
        </div>
        {/* Top-Right: Pearl Diamond */}
        <div className="absolute top-8 -right-6 w-36 h-36 sm:w-48 sm:h-48 opacity-25 rotate-15">
          <Image
            src="/images/decorations/pearl-diamond.webp"
            alt=""
            fill
            sizes="192px"
            className="object-contain"
          />
        </div>
        {/* Bottom-Left: Petals Scatter */}
        <div className="absolute -bottom-8 -left-6 w-48 h-48 sm:w-60 sm:h-60 opacity-20 rotate-[-10deg]">
          <Image
            src="/images/decorations/petals-scatter.webp"
            alt=""
            fill
            sizes="240px"
            className="object-contain"
          />
        </div>
        {/* Bottom-Right: Rose Bloom */}
        <div className="absolute -bottom-10 -right-8 w-48 h-48 sm:w-60 sm:h-60 opacity-25 rotate-12">
          <Image
            src="/images/decorations/rose-bloom.webp"
            alt=""
            fill
            sizes="240px"
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  if (preset === "gallery") {
    return (
      <div className={`pointer-events-none select-none overflow-hidden ${className}`}>
        {/* Top-Left: Rose Bloom */}
        <div className="absolute top-10 -left-10 w-52 h-52 sm:w-72 sm:h-72 opacity-25 rotate-[-15deg]">
          <Image
            src="/images/decorations/rose-bloom.webp"
            alt=""
            fill
            sizes="288px"
            className="object-contain"
          />
        </div>
        {/* Top-Right: Daisy Rose Sprig */}
        <div className="absolute top-16 -right-10 w-52 h-52 sm:w-68 sm:h-68 opacity-25 rotate-15">
          <Image
            src="/images/decorations/daisy-rose-sprig.webp"
            alt=""
            fill
            sizes="272px"
            className="object-contain"
          />
        </div>
        {/* Upper-Mid Left: Pink Brush */}
        <div className="absolute top-[18%] -left-8 w-40 h-52 sm:w-56 sm:h-68 opacity-20 rotate-[-25deg]">
          <Image
            src="/images/decorations/pink-brush.webp"
            alt=""
            fill
            sizes="256px"
            className="object-contain"
          />
        </div>
        {/* Upper-Mid Right: Petals Scatter */}
        <div className="absolute top-[25%] -right-10 w-48 h-48 sm:w-64 sm:h-64 opacity-25 rotate-12">
          <Image
            src="/images/decorations/petals-scatter.webp"
            alt=""
            fill
            sizes="256px"
            className="object-contain"
          />
        </div>
        {/* Mid-Left: Chamomile Sprig */}
        <div className="absolute top-[40%] -left-6 w-44 h-44 sm:w-60 sm:h-60 opacity-20 rotate-15">
          <Image
            src="/images/decorations/chamomile-sprig.webp"
            alt=""
            fill
            sizes="240px"
            className="object-contain"
          />
        </div>
        {/* Mid-Right: Daisy Cluster */}
        <div className="absolute top-[48%] -right-8 w-48 h-48 sm:w-64 sm:h-64 opacity-25 rotate-[-10deg]">
          <Image
            src="/images/decorations/daisy-cluster.webp"
            alt=""
            fill
            sizes="256px"
            className="object-contain"
          />
        </div>
        {/* Lower-Mid Left: Gold Stars & Sparkles */}
        <div className="absolute top-[65%] -left-6 w-40 h-40 sm:w-56 sm:h-56 opacity-25 rotate-12">
          <Image
            src="/images/decorations/gold-stars.webp"
            alt=""
            fill
            sizes="224px"
            className="object-contain"
          />
        </div>
        {/* Lower-Mid Right: Polish Bottle */}
        <div className="absolute top-[72%] -right-6 w-40 h-52 sm:w-52 sm:h-64 opacity-20 rotate-[-15deg]">
          <Image
            src="/images/decorations/polish-bottle.webp"
            alt=""
            fill
            sizes="224px"
            className="object-contain"
          />
        </div>
        {/* Bottom-Left: Daisy Cluster */}
        <div className="absolute -bottom-10 -left-10 w-52 h-52 sm:w-68 sm:h-68 opacity-25 rotate-[-12deg]">
          <Image
            src="/images/decorations/daisy-cluster.webp"
            alt=""
            fill
            sizes="272px"
            className="object-contain"
          />
        </div>
        {/* Bottom-Right: Rose Bloom */}
        <div className="absolute -bottom-10 -right-8 w-52 h-52 sm:w-72 sm:h-72 opacity-25 rotate-15">
          <Image
            src="/images/decorations/rose-bloom.webp"
            alt=""
            fill
            sizes="288px"
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  // Default: floral-soft
  return (
    <div className={`pointer-events-none select-none overflow-hidden ${className}`}>
      <div className="absolute -top-10 -left-10 w-48 h-48 sm:w-64 sm:h-64 opacity-25 rotate-[-15deg]">
        <Image
          src="/images/decorations/rose-bloom.webp"
          alt=""
          fill
          sizes="256px"
          className="object-contain"
        />
      </div>
      <div className="absolute -bottom-10 -right-8 w-48 h-48 sm:w-64 sm:h-64 opacity-25 rotate-15">
        <Image
          src="/images/decorations/daisy-cluster.webp"
          alt=""
          fill
          sizes="256px"
          className="object-contain"
        />
      </div>
    </div>
  );
}
