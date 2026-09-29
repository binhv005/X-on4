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

    if (!name || !price) {
      return NextResponse.json(
        { success: false, message: "Product name and price are required" },
        { status: 400 }
      );
    }

    const autoSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const autoSku = sku || `XON-${Math.floor(1000 + Math.random() * 9000)}`;

    const newProduct = DataStore.createProduct({
      name,
      slug: autoSlug,
      sku: autoSku,
      description: body.description || "",
      shortDescription: body.shortDescription || "",
      price: Number(price),
      salePrice: body.salePrice ? Number(body.salePrice) : null,
      stock: Number(body.stock || 0),
      sizeStock: body.sizeStock || undefined,
      images: body.images || ["/images/IMG_7098.webp"],
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
