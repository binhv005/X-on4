import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { DataStore } from "@/lib/dataStore";
import productsJson from "@/data/products.json";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const rawId = params.id;
  const decodedId = decodeURIComponent(rawId).toLowerCase().trim();

  let product: any = DataStore.getProductById(rawId);
  if (!product) {
    product = DataStore.getProductById(decodedId);
  }

  // Fallback to static products.json
  if (!product) {
    const rawStatic = productsJson.find(
      (p) =>
        p.id?.toLowerCase() === decodedId ||
        p.slug?.toLowerCase() === decodedId ||
        p.id === rawId ||
        p.slug === rawId
    );
    if (rawStatic) {
      product = {
        id: rawStatic.id,
        name: rawStatic.title,
        slug: rawStatic.slug,
        sku: rawStatic.id.toUpperCase(),
        description:
          "Handmade luxury press-on nails crafted with ultra-durable Grip-X technology and Cold Gel Tech. Reusable up to 5x with proper care.",
        shortDescription: "Artisan handcrafted cold-gel press-on nails",
        price: 24.99,
        salePrice: 19.99,
        stock: 20,
        images: [rawStatic.image || "/images/IMG_7098.webp"],
        thumbnail: rawStatic.image || "/images/IMG_7098.webp",
        category: rawStatic.category || "Handmade Grip-X Nails",
        shapes: ["Almond", "Coffin", "Square"],
        sizes: ["XS", "S", "M", "L", "Custom"],
        tags: ["handmade", "grip-x"],
        featured: true,
        bestSeller: true,
        comingSoon: false,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  }

  if (!product) {
    return NextResponse.json(
      { success: false, message: "Product not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: product });
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const updated = DataStore.updateProduct(params.id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const success = DataStore.deleteProduct(params.id);
  if (!success) {
    return NextResponse.json(
      { success: false, message: "Product not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, message: "Product deleted successfully" });
}
