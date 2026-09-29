"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ProductItem } from "@/types/admin";
import { useToast } from "@/context/ToastContext";
import {
  ArrowLeft,
  Upload,
  X,
  Sparkles,
  Check,
  Plus,
  FolderPlus,
} from "lucide-react";

interface ProductFormProps {
  initialData?: ProductItem;
  isEdit?: boolean;
}

const SHAPE_OPTIONS = ["Almond", "Coffin", "Square", "Oval", "Stiletto"];
const SIZE_OPTIONS = ["XS", "S", "M", "L", "Custom"];
const DESIGN_THEME_OPTIONS = ["3D", "Flower", "Y2K"];
const LENGTH_OPTIONS = ["Short", "Medium", "Long", "Extra Long"];

export function generateSlug(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove Vietnamese accents
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isSlugManual, setIsSlugManual] = useState<boolean>(Boolean(isEdit && initialData?.slug));
  const [sku, setSku] = useState(initialData?.sku || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [shortDescription, setShortDescription] = useState(
    initialData?.shortDescription || ""
  );
  const [price, setPrice] = useState(initialData?.price ? initialData.price.toString() : "24.99");
  const [salePrice, setSalePrice] = useState(
    initialData?.salePrice ? initialData.salePrice.toString() : ""
  );
  const [category, setCategory] = useState(
    initialData?.category || "Handmade Nails"
  );
  const [designThemes, setDesignThemes] = useState<string[]>(
    initialData?.designThemes || []
  );
  const [length, setLength] = useState<string>(
    initialData?.length || "Extra Long"
  );
  const [collection, setCollection] = useState(initialData?.collection || "Spring Luxe 2026");
  const [shapes, setShapes] = useState<string[]>(
    initialData?.shapes || ["Almond", "Coffin"]
  );
  const [sizes, setSizes] = useState<string[]>(
    initialData?.sizes || ["XS", "S", "M", "L"]
  );
  const [sizeStock, setSizeStock] = useState<Record<string, number>>(() => {
    if (initialData?.sizeStock && Object.keys(initialData.sizeStock).length > 0) {
      return initialData.sizeStock;
    }
    const init: Record<string, number> = {};
    const defaultSizes = initialData?.sizes || ["XS", "S", "M", "L"];
    const baseEach = Math.max(1, Math.floor((initialData?.stock || 20) / (defaultSizes.length || 1)));
    defaultSizes.forEach((sz) => {
      init[sz] = baseEach;
    });
    return init;
  });
  const [stock, setStock] = useState(() => {
    if (initialData?.stock !== undefined) return initialData.stock.toString();
    const initSizes = initialData?.sizes || ["XS", "S", "M", "L"];
    return (initSizes.length * 5).toString();
  });
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(
    initialData?.tags || ["handmade", "grip-x", "reusable"]
  );
  const [bestSeller, setBestSeller] = useState(initialData?.bestSeller || false);
  const [handmadeGripX, setHandmadeGripX] = useState(
    initialData?.handmadeGripX !== undefined
      ? initialData.handmadeGripX
      : (initialData?.featured ?? true)
  );
  const [status, setStatus] = useState<"active" | "draft" | "archived">(
    initialData?.status || "active"
  );

  const [images, setImages] = useState<string[]>(
    initialData?.images || ["/images/IMG_7098.webp"]
  );
  const [thumbnail, setThumbnail] = useState(
    initialData?.thumbnail || initialData?.images?.[0] || "/images/IMG_7098.webp"
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data);
      })
      .catch((e) => console.error(e));
  }, []);

  const handleCreateCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    setIsCreatingCategory(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: trimmed }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        success(`Category "${trimmed}" added`);
        setCategories((prev) => [...prev, json.data]);
        setCategory(json.data.name);
        setNewCategoryName("");
        setIsAddingCategory(false);
      } else {
        error(json.message || "Failed to create category");
      }
    } catch {
      error("Error creating category");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Auto generate slug from name in real-time
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManual) {
      setSlug(generateSlug(val));
    }
  };

  const handleManualSlugChange = (val: string) => {
    setSlug(val);
    setIsSlugManual(true);
  };

  const handleSyncSlug = () => {
    setIsSlugManual(false);
    setSlug(generateSlug(name));
  };

  const toggleShape = (shape: string) => {
    if (shapes.includes(shape)) {
      setShapes(shapes.filter((s) => s !== shape));
    } else {
      setShapes([...shapes, shape]);
    }
  };

  const toggleSize = (size: string) => {
    if (sizes.includes(size)) {
      const nextSizes = sizes.filter((s) => s !== size);
      setSizes(nextSizes);
      const nextStock = { ...sizeStock };
      delete nextStock[size];
      setSizeStock(nextStock);
      const total = Object.values(nextStock).reduce((a, b) => a + (Number(b) || 0), 0);
      setStock(total.toString());
    } else {
      const nextSizes = [...sizes, size];
      setSizes(nextSizes);
      const nextStock = { ...sizeStock, [size]: 5 };
      setSizeStock(nextStock);
      const total = Object.values(nextStock).reduce((a, b) => a + (Number(b) || 0), 0);
      setStock(total.toString());
    }
  };

  const handleSizeStockChange = (size: string, qty: number) => {
    const validQty = Math.max(0, isNaN(qty) ? 0 : qty);
    const updated = { ...sizeStock, [size]: validQty };
    setSizeStock(updated);
    const total = Object.values(updated).reduce((a, b) => a + (Number(b) || 0), 0);
    setStock(total.toString());
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const toggleDesignTheme = (theme: string) => {
    if (designThemes.includes(theme)) {
      setDesignThemes(designThemes.filter((t) => t !== theme));
    } else {
      setDesignThemes([...designThemes, theme]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const token = localStorage.getItem("admin_token");
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.url) {
            setImages((prev) => [...prev, json.data.url]);
            if (!thumbnail) setThumbnail(json.data.url);
          }
        }
      }
      success("Image uploaded successfully");
    } catch {
      error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (imgUrl: string) => {
    const nextImages = images.filter((img) => img !== imgUrl);
    setImages(nextImages);
    if (thumbnail === imgUrl) {
      setThumbnail(nextImages[0] || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error("Product name is required");
      return;
    }
    if (!price || isNaN(Number(price))) {
      error("Please enter a valid price");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("admin_token");
      const finalSlug = slug.trim() || generateSlug(name) || `product-${Date.now()}`;
      const payload = {
        name,
        slug: finalSlug,
        sku: sku || `XON-${Math.floor(1000 + Math.random() * 9000)}`,
        description,
        shortDescription,
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : null,
        stock: Number(stock || 0),
        sizeStock,
        category,
        collection,
        shapes,
        sizes,
        designThemes,
        length,
        tags,
        featured: handmadeGripX,
        handmadeGripX: handmadeGripX,
        bestSeller,
        status,
        images: images.length > 0 ? images : ["/images/IMG_7098.webp"],
        thumbnail: thumbnail || images[0] || "/images/IMG_7098.webp",
      };

      const url = isEdit && initialData ? `/api/products/${initialData.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        success(isEdit ? "Product updated successfully" : "Product created successfully");
        router.push("/admin/products");
      } else {
        error(json.message || "Failed to save product");
      }
    } catch {
      error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900">
              {isEdit ? `Edit: ${initialData?.name}` : "Create New Product"}
            </h1>
            <p className="text-xs text-neutral-500">
              Configure details, photography, shapes, sizing, and pricing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span>{isEdit ? "Update Product" : "Publish Product"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              General Information
            </h2>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Handmade Velvet Shimmer Press-On Nails"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Slug (URL)
                  </label>
                  <button
                    type="button"
                    onClick={handleSyncSlug}
                    title="Auto-sync slug from product title"
                    className="text-[10px] text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Sync</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleManualSlugChange(e.target.value)}
                  placeholder="handmade-velvet-shimmer"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 font-mono focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  SKU (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="XON-7098"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 font-mono focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Pricing and Stock */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Pricing & Inventory
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Regular Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="24.99"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 font-bold focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Sale Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="19.99 (Optional)"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-rose-600 font-bold focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Total Stock Quantity
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="20"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Nail Shapes & Sizes Options */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Nail Variants (Shapes & Sizes)
            </h2>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-2">
                Available Nail Shapes
              </label>
              <div className="flex flex-wrap gap-2">
                {SHAPE_OPTIONS.map((shape) => {
                  const isSelected = shapes.includes(shape);
                  return (
                    <button
                      type="button"
                      key={shape}
                      onClick={() => toggleShape(shape)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{shape}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-2">
                Available Nail Sizes
              </label>
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((sz) => {
                  const isSelected = sizes.includes(sz);
                  return (
                    <button
                      type="button"
                      key={sz}
                      onClick={() => toggleSize(sz)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-neutral-900 text-white shadow-xs"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{sz}</span>
                    </button>
                  );
                })}
              </div>

              {/* Quantity Per Size Breakdown */}
              {sizes.length > 0 && (
                <div className="mt-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-neutral-900">
                        Stock Quantity Per Size
                      </h3>
                      <p className="text-[11px] text-neutral-500">
                        Specify individual inventory count for each available nail size
                      </p>
                    </div>
                    <div className="text-xs font-bold px-3 py-1 bg-white border border-neutral-200 rounded-xl text-neutral-900 shadow-2xs">
                      Total: <span className="text-amber-600">{stock}</span> units
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                    {sizes.map((sz) => (
                      <div
                        key={sz}
                        className="bg-white p-3 rounded-xl border border-neutral-200/90 shadow-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-neutral-900 text-white">
                            Size {sz}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-medium">units</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleSizeStockChange(sz, (sizeStock[sz] || 0) - 1)
                            }
                            className="w-6 h-6 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={sizeStock[sz] ?? 0}
                            onChange={(e) =>
                              handleSizeStockChange(sz, parseInt(e.target.value) || 0)
                            }
                            className="w-full py-1 text-center bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-extrabold text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleSizeStockChange(sz, (sizeStock[sz] || 0) + 1)
                            }
                            className="w-6 h-6 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Image Gallery & Thumbnail */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Product Images
              </h2>
              <span className="text-xs text-neutral-500">
                Select star icon to set as primary thumbnail
              </span>
            </div>

            {/* Upload Box */}
            <div className="border-2 border-dashed border-neutral-200 hover:border-amber-500 rounded-2xl p-6 text-center transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                id="product-image-upload"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <label
                htmlFor="product-image-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-neutral-900">
                  {isUploading ? "Uploading photos..." : "Click to upload product images"}
                </div>
                <div className="text-[11px] text-neutral-400">
                  PNG, JPG, WebP up to 5MB each
                </div>
              </label>
            </div>

            {/* Image Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {images.map((img, idx) => {
                const isThumb = thumbnail === img;
                return (
                  <div
                    key={idx}
                    className={`group relative aspect-square rounded-xl bg-neutral-100 overflow-hidden border-2 transition-all ${
                      isThumb ? "border-amber-500 ring-2 ring-amber-500/20" : "border-neutral-200"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Product image ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />

                    {/* Thumbnail Badge */}
                    {isThumb && (
                      <span className="absolute bottom-1.5 left-1.5 bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase shadow-xs">
                        Thumbnail
                      </span>
                    )}

                    {/* Action buttons on hover */}
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setThumbnail(img)}
                        title="Set as Thumbnail"
                        className="p-1 bg-black/70 hover:bg-black text-white rounded-md transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img)}
                        title="Delete Image"
                        className="p-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-md transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Organization & Badges (1 col) */}
        <div className="space-y-6">
          {/* Status & Visibility */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Status & Visibility
            </h2>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "active" | "draft" | "archived")
                }
                className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 focus:outline-none focus:border-amber-500 focus:bg-white"
              >
                <option value="active">Active (Visible in Store)</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="pt-3 border-t border-neutral-100 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={bestSeller}
                  onChange={(e) => setBestSeller(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-neutral-300 text-neutral-900 focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block group-hover:text-black transition-colors">
                    BEST SELLER
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Display in Best Seller filter & tab
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={handmadeGripX}
                  onChange={(e) => setHandmadeGripX(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-neutral-300 text-neutral-900 focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block group-hover:text-black transition-colors">
                    HANDMADE X-ON NAILS
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Display in HANDMADE X-ON NAILS filter & tab
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Organization & Attributes */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-6">
            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-neutral-900">
                  Category
                </label>
                {!isAddingCategory && (
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(true)}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                )}
              </div>

              {/* Quick Add Category Form */}
              {isAddingCategory ? (
                <div className="mb-3 p-3 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                      <FolderPlus className="w-3.5 h-3.5 text-amber-600" />
                      New Category Name
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCategory(false);
                        setNewCategoryName("");
                      }}
                      className="text-neutral-400 hover:text-neutral-700 p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateCategory();
                        }
                      }}
                      placeholder="e.g. Handmade Nails"
                      className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-amber-600"
                    />
                    <button
                      type="button"
                      disabled={isCreatingCategory || !newCategoryName.trim()}
                      onClick={() => handleCreateCategory()}
                      className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center cursor-pointer"
                    >
                      {isCreatingCategory ? (
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-2xl text-sm font-medium text-neutral-800 focus:outline-none focus:border-neutral-900 shadow-2xs cursor-pointer appearance-none pr-10"
                >
                  {categories.length > 0 ? (
                    categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Handmade Nails">Handmade Nails</option>
                      <option value="Handmade Grip-X Nails">Handmade Grip-X Nails</option>
                      <option value="Ready to Ship">Ready to Ship</option>
                      <option value="Accessories & Care">Accessories & Care</option>
                    </>
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-neutral-500">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* DESIGN THEME */}
            <div className="pt-4 border-t border-neutral-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 mb-3.5">
                DESIGN THEME
              </h3>
              <div className="space-y-3">
                {DESIGN_THEME_OPTIONS.map((theme) => {
                  const isChecked = designThemes.includes(theme);
                  return (
                    <label
                      key={theme}
                      className="flex items-center gap-3 cursor-pointer text-sm font-medium text-neutral-700 hover:text-neutral-950 transition-colors select-none group"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleDesignTheme(theme)}
                        className="w-4.5 h-4.5 rounded border-neutral-300 text-neutral-900 focus:ring-0 cursor-pointer"
                      />
                      <span className="group-hover:translate-x-0.5 transition-transform">
                        {theme}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* LENGTH */}
            <div className="pt-4 border-t border-neutral-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 mb-3.5">
                LENGTH
              </h3>
              <div className="space-y-3">
                {LENGTH_OPTIONS.map((len) => {
                  const isSelected = length === len;
                  return (
                    <label
                      key={len}
                      className="flex items-center gap-3 cursor-pointer text-sm font-medium text-neutral-700 hover:text-neutral-950 transition-colors select-none group"
                    >
                      <input
                        type="radio"
                        name="product_length"
                        value={len}
                        checked={isSelected}
                        onChange={() => setLength(len)}
                        className="w-4.5 h-4.5 border-neutral-300 text-neutral-900 focus:ring-0 cursor-pointer"
                      />
                      <span className="group-hover:translate-x-0.5 transition-transform">
                        {len}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
