import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { DataStore } from "@/lib/dataStore";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get("search") || undefined;
  const category = searchParams.get("category") || undefined;
  const status = searchParams.get("status") || undefined;
  const shape = searchParams.get("shape") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const result = DataStore.getProducts({ search, category, status, shape, page, limit });
  return NextResponse.json({ success: true, data: result });
}

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { name, slug, sku, price } = body;

    if (!name || name.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: "Product name must be at least 3 characters" },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return NextResponse.json(
        { success: false, message: "Price must be a positive number greater than 0" },
        { status: 400 }
      );
    }

    let numericSalePrice: number | null = null;
    if (body.salePrice !== undefined && body.salePrice !== null && body.salePrice !== "") {
      numericSalePrice = Number(body.salePrice);
      if (isNaN(numericSalePrice) || numericSalePrice <= 0) {
        return NextResponse.json(
          { success: false, message: "Sale price must be a positive number greater than 0" },
          { status: 400 }
        );
      }
      if (numericSalePrice >= numericPrice) {
        return NextResponse.json(
          { success: false, message: "Sale price must be strictly lower than regular price" },
          { status: 400 }
        );
      }
    }

    const numericStock = Math.max(0, parseInt(body.stock) || 0);

    const autoSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const autoSku = sku?.trim() || `XON-${Math.floor(1000 + Math.random() * 9000)}`;

    // Check SKU duplicate
    const existingProducts = DataStore.getProducts({ limit: 500 }).products;
    const isSkuTaken = existingProducts.some(
      (p) => p.sku?.toLowerCase() === autoSku.toLowerCase()
    );
    if (isSkuTaken) {
      return NextResponse.json(
        { success: false, message: `SKU "${autoSku}" already exists. Please choose a unique SKU.` },
        { status: 400 }
      );
    }

    const newProduct = DataStore.createProduct({
      name: name.trim(),
      slug: autoSlug,
      sku: autoSku,
      description: body.description || "",
      shortDescription: body.shortDescription || "",
      price: numericPrice,
      salePrice: numericSalePrice,
      stock: numericStock,
      sizeStock: body.sizeStock || undefined,
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : ["/images/IMG_7098.webp"],
      thumbnail: body.thumbnail || body.images?.[0] || "/images/IMG_7098.webp",
      category: body.category || "Handmade Nails",
      collection: body.collection || "",
      shapes: body.shapes || ["Almond"],
      sizes: body.sizes || ["XS", "S", "M", "L"],
      designThemes: body.designThemes || [],
      length: body.length || "Extra Long",
      tags: body.tags || [],
      featured: Boolean(body.featured !== undefined ? body.featured : body.handmadeGripX),
      handmadeGripX: Boolean(body.handmadeGripX !== undefined ? body.handmadeGripX : body.featured),
      bestSeller: Boolean(body.bestSeller),
      comingSoon: Boolean(body.comingSoon),
      status: body.status || "active",
    });

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create product" },
      { status: 500 }
    );
  }
}
