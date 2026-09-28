"use client";

import React, { useState } from "react";
import Image from "next/image";
import gcsTabs from "@/data/gcs-tabs.json";
import { X, ZoomIn } from "lucide-react";
import { PageDecorations } from "@/components/PageDecorations";

export default function GalleryComingSoonPage() {
  const [activeTab, setActiveTab] = useState<
    "christmas-nail-collection" | "fall-nail-collection" | "halloween-nail-collection" | "new-favourite-collection"
  >("christmas-nail-collection");

  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const tabs = [
    { id: "christmas-nail-collection", label: "Christmas Nail Collection" },
    { id: "fall-nail-collection", label: "Fall Nail Collection" },
    { id: "halloween-nail-collection", label: "Halloween Nail Collection" },
    { id: "new-favourite-collection", label: "NEW FAVOURITE COLLECTION" },
  ] as const;

  const currentImages = (gcsTabs as Record<string, string[]>)[activeTab] || [];

  return (
    <div className="relative bg-white min-h-screen py-10 sm:py-16 overflow-hidden">
      {/* Background Motifs */}
      <PageDecorations preset="floral-soft" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-widest text-gray-900 font-serif">
            Gallery Coming Soon
          </h1>
        </div>

        {/* 4 Tabs Styled as Flatsome */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto pb-4 mb-8 border-b border-gray-100 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-b-2 border-black text-black font-bold"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 4-Column Grid as Flatsome row large-columns-4 medium-columns-3 small-columns-2 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {currentImages.map((img: string, idx: number) => (
            <div
              key={idx}
              onClick={() => setLightboxImg(img)}
              className="group relative aspect-square rounded-md overflow-hidden bg-neutral-100 cursor-pointer shadow-xs hover:shadow-md transition-shadow"
            >
              <Image
                src={img}
                alt={`Collection item ${idx + 1}`}
                fill
                unoptimized
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white" />
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {lightboxImg && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-xs"
            onClick={() => setLightboxImg(null)}
          >
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-6 right-6 p-2 text-white hover:text-neutral-300 rounded-full bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
            <div
              className="relative max-w-4xl max-h-[85vh] w-full h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightboxImg}
                alt="Enlarged nail look"
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
