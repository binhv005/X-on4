import { Product } from "@/components/ProductCard";

export function mapApiProduct(p: any): Product {
  const priceVal =
    typeof p.price === "number"
      ? `$${p.price.toFixed(2)}`
      : typeof p.price === "string" && p.price.startsWith("$")
      ? p.price
      : p.price
      ? `$${p.price}`
      : "$24.99";

  const originalPriceVal = p.salePrice
    ? typeof p.salePrice === "number"
      ? `$${p.salePrice.toFixed(2)}`
      : `$${p.salePrice}`
    : undefined;

  return {
    id: p.id || p.slug,
    slug: p.slug,
    title: p.name || p.title || "X-ON Nails",
    price: priceVal,
    originalPrice: originalPriceVal,
    image: p.thumbnail || p.images?.[0] || p.image || "/images/IMG_7098.webp",
    category: p.category || "Handmade Grip-X Nails",
    shapes: Array.isArray(p.shapes) ? p.shapes : ["Almond", "Coffin"],
    designThemes: Array.isArray(p.designThemes) ? p.designThemes : [],
    colors: Array.isArray(p.colors) ? p.colors : [],
    colorOptions: Array.isArray(p.colorOptions) ? p.colorOptions : undefined,
    sizes: Array.isArray(p.sizes) ? p.sizes : ["XS", "S", "M", "L"],
    sizeStock: p.sizeStock || undefined,
    length: p.length || "Extra Long",
    lengths: Array.isArray(p.lengths) ? p.lengths : [p.length || "Extra Long"],
    bestSeller: Boolean(p.bestSeller),
    handmadeGripX: Boolean(p.handmadeGripX !== undefined ? p.handmadeGripX : p.featured),
    featured: Boolean(p.featured !== undefined ? p.featured : p.handmadeGripX),
    url: `/product/${p.slug}`,
    description: p.description || p.shortDescription || "",
    stock: typeof p.stock === "number" ? p.stock : 20,
  };
}
