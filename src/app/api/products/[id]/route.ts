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

    if (body.name !== undefined && body.name.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: "Product name must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (body.price !== undefined) {
      const numPrice = Number(body.price);
      if (isNaN(numPrice) || numPrice <= 0) {
        return NextResponse.json(
          { success: false, message: "Price must be a positive number greater than 0" },
          { status: 400 }
        );
      }
    }

    if (body.salePrice !== undefined && body.salePrice !== null && body.salePrice !== "") {
      const numSale = Number(body.salePrice);
      const currentPrice = body.price !== undefined ? Number(body.price) : DataStore.getProductById(params.id)?.price || 0;
      if (isNaN(numSale) || numSale <= 0) {
        return NextResponse.json(
          { success: false, message: "Sale price must be a positive number greater than 0" },
          { status: 400 }
        );
      }
      if (numSale >= currentPrice) {
        return NextResponse.json(
          { success: false, message: "Sale price must be strictly lower than regular price" },
          { status: 400 }
        );
      }
    }

    if (body.stock !== undefined) {
      const numStock = Number(body.stock);
      if (isNaN(numStock) || numStock < 0) {
        return NextResponse.json(
          { success: false, message: "Stock cannot be a negative number" },
          { status: 400 }
        );
      }
    }

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

  // Check if product is tied to any active/processing orders
  const orders = DataStore.getOrders({ limit: 500 }).orders;
  const hasActiveOrder = orders.some(
    (o) =>
      o.orderStatus !== "delivered" &&
      o.orderStatus !== "cancelled" &&
      o.items?.some(
        (i) =>
          i.productId === params.id ||
          i.productId?.startsWith(`${params.id}-`)
      )
  );

  if (hasActiveOrder) {
    return NextResponse.json(
      {
        success: false,
        message: "Cannot delete this product because it is currently part of an active unfulfilled order.",
      },
      { status: 400 }
    );
  }

  const success = DataStore.deleteProduct(params.id);
  if (!success) {
    return NextResponse.json(
      { success: false, message: "Product not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, message: "Product deleted successfully" });
}
