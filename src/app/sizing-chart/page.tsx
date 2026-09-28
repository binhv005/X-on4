"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, Ruler, Check, HelpCircle, Layers } from "lucide-react";
import { PageDecorations } from "@/components/PageDecorations";

interface SizeRow {
  size: string;
  name: string;
  thumb: { num: string; mm: string };
  index: { num: string; mm: string };
  middle: { num: string; mm: string };
  ring: { num: string; mm: string };
  pinky: { num: string; mm: string };
}

const standardSizes: SizeRow[] = [
  {
    size: "XS",
    name: "Extra Small",
    thumb: { num: "#3", mm: "15mm" },
    index: { num: "#6", mm: "12mm" },
    middle: { num: "#5", mm: "13mm" },
    ring: { num: "#7", mm: "11mm" },
    pinky: { num: "#9", mm: "9mm" },
  },
  {
    size: "S",
    name: "Small",
    thumb: { num: "#2", mm: "16mm" },
    index: { num: "#5", mm: "13mm" },
    middle: { num: "#4", mm: "14mm" },
    ring: { num: "#6", mm: "12mm" },
    pinky: { num: "#9", mm: "9mm" },
  },
  {
    size: "M",
    name: "Medium",
    thumb: { num: "#1", mm: "17mm" },
    index: { num: "#5", mm: "13mm" },
    middle: { num: "#4", mm: "14mm" },
    ring: { num: "#6", mm: "12mm" },
    pinky: { num: "#8", mm: "10mm" },
  },
  {
    size: "L",
    name: "Large",
    thumb: { num: "#0", mm: "19mm" },
    index: { num: "#4", mm: "14mm" },
    middle: { num: "#3", mm: "15mm" },
    ring: { num: "#5", mm: "13mm" },
    pinky: { num: "#7", mm: "11mm" },
  },
];

const measureSteps = [
  {
    step: "01",
    title: "Apply Tape Horizontally",
    desc: "Press a piece of clear scotch tape across the widest part of your natural nail bed.",
  },
  {
    step: "02",
    title: "Mark Both Edges",
    desc: "Using a pen, mark both sides of your nail exactly where it meets the skin of your sidewall.",
  },
  {
    step: "03",
    title: "Measure on Ruler",
    desc: "Remove the tape, press flat against a millimeter ruler, and note your width in millimeters (mm).",
  },
];

export default function SizingChartPage() {
  const [activeTab, setActiveTab] = useState<"size" | "shapes" | "length">("size");

  return (
    <div className="relative bg-white min-h-screen text-neutral-900 overflow-hidden">
      {/* Background Motifs */}
      <PageDecorations preset="sizing-chart" />

      {/* 1. TOP BANNER IMAGE */}
      <div className="w-full overflow-hidden bg-neutral-100 relative z-10">
        <Image
          src="/images/ChatGPT-Image-18_51_04-20-thg-7-2026.png"
          alt="X-ON Sizing Chart Banner"
          width={1983}
          height={793}
          priority
          className="w-full h-auto block"
          quality={100}
          unoptimized
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
        {/* 2. HEADER & INTRO */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Perfect Fit Guarantee</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif tracking-tight text-neutral-900">
            Nail Sizing &amp; Fit Guide
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            Achieve salon-quality comfort with press-on nails that look and feel custom-made for your natural nails.
          </p>
        </div>

        {/* 3. MODERN LUXURY PILL TABS */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-full bg-neutral-100 border border-neutral-200/80 shadow-xs">
            <button
              onClick={() => setActiveTab("size")}
              className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all ${
                activeTab === "size"
                  ? "bg-black text-white shadow-sm"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              <Ruler className="w-4 h-4" />
              <span>Size Guide</span>
            </button>
            <button
              onClick={() => setActiveTab("shapes")}
              className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all ${
                activeTab === "shapes"
                  ? "bg-black text-white shadow-sm"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Shapes &amp; Length</span>
            </button>
            <button
              onClick={() => setActiveTab("length")}
              className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all ${
                activeTab === "length"
                  ? "bg-black text-white shadow-sm"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Length Details</span>
            </button>
          </div>
        </div>

        {/* 4. TAB PANELS */}
        <div>
          {/* TAB 1: SIZE GUIDE */}
          {activeTab === "size" && (
            <div className="space-y-12">
              {/* SIZE TABLE CARD */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold font-serif text-neutral-900">
                      Standard Size Chart
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                      Finger sequence: Thumb → Index → Middle → Ring → Pinky
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-xs font-medium text-neutral-600 bg-white px-3 py-1.5 rounded-lg border border-neutral-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Nail number (#) with millimeter (mm) width</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 text-[11px] sm:text-xs uppercase tracking-wider text-neutral-500 bg-neutral-50/80">
                        <th className="py-3.5 px-4 sm:px-6 font-semibold">Size</th>
                        <th className="py-3.5 px-3 sm:px-4 font-semibold text-center">Thumb</th>
                        <th className="py-3.5 px-3 sm:px-4 font-semibold text-center">Index</th>
                        <th className="py-3.5 px-3 sm:px-4 font-semibold text-center">Middle</th>
                        <th className="py-3.5 px-3 sm:px-4 font-semibold text-center">Ring</th>
                        <th className="py-3.5 px-3 sm:px-4 font-semibold text-center">Pinky</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs sm:text-sm">
                      {standardSizes.map((row) => (
                        <tr
                          key={row.size}
                          className="hover:bg-neutral-50/60 transition-colors"
                        >
                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex items-center gap-2.5">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-neutral-900 text-white font-bold text-xs tracking-wider">
                                {row.size}
                              </span>
                              <span className="font-medium text-neutral-700 hidden sm:inline">
                                {row.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-3 sm:px-4 text-center">
                            <span className="inline-block font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-sm">
                              {row.thumb.num}
                            </span>
                            <span className="block text-[11px] text-neutral-500 mt-1">
                              {row.thumb.mm}
                            </span>
                          </td>
                          <td className="py-4 px-3 sm:px-4 text-center">
                            <span className="inline-block font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-sm">
                              {row.index.num}
                            </span>
                            <span className="block text-[11px] text-neutral-500 mt-1">
                              {row.index.mm}
                            </span>
                          </td>
                          <td className="py-4 px-3 sm:px-4 text-center">
                            <span className="inline-block font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-sm">
                              {row.middle.num}
                            </span>
                            <span className="block text-[11px] text-neutral-500 mt-1">
                              {row.middle.mm}
                            </span>
                          </td>
                          <td className="py-4 px-3 sm:px-4 text-center">
                            <span className="inline-block font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-sm">
                              {row.ring.num}
                            </span>
                            <span className="block text-[11px] text-neutral-500 mt-1">
                              {row.ring.mm}
                            </span>
                          </td>
                          <td className="py-4 px-3 sm:px-4 text-center">
                            <span className="inline-block font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-sm">
                              {row.pinky.num}
                            </span>
                            <span className="block text-[11px] text-neutral-500 mt-1">
                              {row.pinky.mm}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* CUSTOM SIZE CALLOUT BOX */}
                <div className="p-5 sm:p-6 bg-[#faf8f5] border-t border-[#f0eae1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">
                        Need a Custom Size?
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-600 mt-0.5 leading-relaxed">
                        If your nails don&apos;t match standard sizes, select <span className="font-semibold text-neutral-900">&ldquo;Custom Size&rdquo;</span> at checkout and write your 5 finger measurements in the note to seller.
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-neutral-900 text-white tracking-wide">
                    Free Custom Fitting
                  </span>
                </div>
              </div>

              {/* VISUAL DIAGRAM CARD */}
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="text-base sm:text-lg font-bold font-serif text-neutral-900">
                    Visual Measurement Reference
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500">
                    Width measurements in millimeters (mm) across nail tips #0 to #9
                  </p>
                </div>
                <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden border border-neutral-200 shadow-sm bg-neutral-50">
                  <Image
                    src="/images/ChatGPT-Image-19_11_41-20-thg-7-2026.png"
                    alt="Nail Size Guide Visual"
                    width={1024}
                    height={991}
                    className="w-full h-auto block"
                    quality={100}
                    unoptimized
                  />
                </div>
              </div>

              {/* 3-STEP MEASURING GUIDE */}
              <div className="pt-4 space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="text-base sm:text-lg font-bold font-serif text-neutral-900">
                    How to Measure at Home
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500">
                    All you need is clear scotch tape, a pen, and a ruler
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {measureSteps.map((s) => (
                    <div
                      key={s.step}
                      className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <span className="text-2xl font-bold font-serif text-neutral-400">
                          {s.step}
                        </span>
                        <h4 className="text-sm font-bold text-neutral-900">
                          {s.title}
                        </h4>
                        <p className="text-xs text-neutral-600 leading-relaxed">
                          {s.desc}
                        </p>
                      </div>
                      <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                        <Check className="w-3.5 h-3.5" />
                        <span>Simple &amp; Accurate</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHAPES & LENGTH */}
          {activeTab === "shapes" && (
            <div className="space-y-6">
              <div className="text-center space-y-1 max-w-xl mx-auto">
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-neutral-900">
                  Available Nail Shapes &amp; Lengths
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500">
                  From subtle natural silhouettes to dramatic statement lengths, find your signature look.
                </p>
              </div>

              <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden border border-neutral-200 shadow-sm bg-neutral-50">
                <Image
                  src="/images/ChatGPT-Image-19_24_29-20-thg-7-2026.png"
                  alt="Nail Shapes and Length Visual"
                  width={1254}
                  height={1254}
                  className="w-full h-auto block"
                  quality={100}
                  unoptimized
                />
              </div>
            </div>
          )}

          {/* TAB 3: LENGTH DETAILS */}
          {activeTab === "length" && (
            <div className="space-y-6">
              <div className="text-center space-y-1 max-w-xl mx-auto">
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-neutral-900">
                  Comprehensive Length Matrix
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500">
                  Exact millimeter length specifications for every nail shape and size from #0 to #9.
                </p>
              </div>

              <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden border border-neutral-200 shadow-sm bg-neutral-50">
                <Image
                  src="/images/1adfa597-e3d5-4214-aba5-40377e6f0ddc.png"
                  alt="Nail Length Details Measurement Diagram"
                  width={1535}
                  height={1024}
                  className="w-full h-auto block"
                  quality={100}
                  unoptimized
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
