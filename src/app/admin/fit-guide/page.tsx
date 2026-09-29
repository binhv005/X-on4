"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useToast } from "@/context/ToastContext";
import { Ruler, Save, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminFitGuidePage() {
  const { success } = useToast();
  const [guideTitle, setGuideTitle] = useState("Nail Sizing Guide & Fit Instructions");
  const [guideDescription, setGuideDescription] = useState(
    "How to measure your natural nails with millimeter tape or measuring paper for a 100% bespoke fit."
  );

  const [sizes, setSizes] = useState([
    { name: "XS", thumb: "14mm", index: "11mm", middle: "12mm", ring: "10mm", pinky: "8mm" },
    { name: "S", thumb: "15mm", index: "12mm", middle: "13mm", ring: "11mm", pinky: "9mm" },
    { name: "M", thumb: "16mm", index: "13mm", middle: "14mm", ring: "12mm", pinky: "10mm" },
    { name: "L", thumb: "18mm", index: "14mm", middle: "15mm", ring: "13mm", pinky: "11mm" },
  ]);

  const [images] = useState([
    "/images/336ec7dd-4ed8-40e2-9cfb-777a558ebf10.webp",
    "/images/sizing-chart-banner-horizontal.webp",
    "/images/1adfa597-e3d5-4214-aba5-40377e6f0ddc.webp",
  ]);

  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateSize = (index: number, field: string, value: string) => {
    const updated = [...sizes];
    updated[index] = { ...updated[index], [field]: value };
    setSizes(updated);
  };

  const handleAddSize = () => {
    setSizes([
      ...sizes,
      { name: "Custom", thumb: "15mm", index: "12mm", middle: "13mm", ring: "11mm", pinky: "9mm" },
    ]);
  };

  const handleRemoveSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      success("Fit Guide & Sizing Chart saved successfully!");
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
              Sizing System
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Fit Guide &amp; Sizing Chart
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Manage nail measurements, size presets (XS, S, M, L), and diagram illustrations.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          {isSaving ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Save Changes</span>
        </button>
      </div>

      {/* Sizing Chart Matrix */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-indigo-600" />
              <span>Standard Sizing Matrix (mm)</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Customers use these preset measurements when selecting their nail size.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddSize}
            className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 self-start cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Preset</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-400 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Preset Name</th>
                <th className="py-2.5 px-3">Thumb</th>
                <th className="py-2.5 px-3">Index</th>
                <th className="py-2.5 px-3">Middle</th>
                <th className="py-2.5 px-3">Ring</th>
                <th className="py-2.5 px-3">Pinky</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium text-neutral-800">
              {sizes.map((row, idx) => (
                <tr key={idx} className="hover:bg-neutral-50/70">
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => handleUpdateSize(idx, "name", e.target.value)}
                      className="w-20 px-2 py-1 bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-bold text-neutral-900 focus:bg-white"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={row.thumb}
                      onChange={(e) => handleUpdateSize(idx, "thumb", e.target.value)}
                      className="w-16 px-2 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-700 focus:bg-white"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={row.index}
                      onChange={(e) => handleUpdateSize(idx, "index", e.target.value)}
                      className="w-16 px-2 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-700 focus:bg-white"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={row.middle}
                      onChange={(e) => handleUpdateSize(idx, "middle", e.target.value)}
                      className="w-16 px-2 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-700 focus:bg-white"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={row.ring}
                      onChange={(e) => handleUpdateSize(idx, "ring", e.target.value)}
                      className="w-16 px-2 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-700 focus:bg-white"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={row.pinky}
                      onChange={(e) => handleUpdateSize(idx, "pinky", e.target.value)}
                      className="w-16 px-2 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-700 focus:bg-white"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(idx)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Preset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guide Images & Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3">
            Fit Guide Header &amp; Instructions
          </h2>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Guide Title
            </label>
            <input
              type="text"
              value={guideTitle}
              onChange={(e) => setGuideTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Measuring Instructions
            </label>
            <textarea
              rows={4}
              value={guideDescription}
              onChange={(e) => setGuideDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-indigo-600 focus:bg-white leading-relaxed"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3 flex items-center justify-between">
            <span>Visual Diagrams &amp; Illustrations</span>
            <span className="text-[10px] text-neutral-400 normal-case font-normal">
              {images.length} images active
            </span>
          </h2>

          <div className="grid grid-cols-3 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 group"
              >
                <Image
                  src={img}
                  alt={`Diagram ${idx + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            ))}
          </div>

          <p className="text-[11px] text-neutral-500 flex items-center gap-1.5 pt-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Diagrams are rendered automatically on /sizing-chart page.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
