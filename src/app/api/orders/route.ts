import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { DataStore } from "@/lib/dataStore";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  const result = DataStore.getOrders({ search, status, page, limit });
  return NextResponse.json({ success: true, data: result });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, items, total } = body;

    if (!customer?.name || !customer?.email || !items || !items.length || !total) {
      return NextResponse.json(
        { success: false, message: "Customer details, items, and total are required" },
        { status: 400 }
      );
    }

    // Validate stock for all ordered items
    const storeProducts = DataStore.getProducts({ limit: 500 }).products;
    for (const item of items) {
      const prod = storeProducts.find(
        (p) =>
          p.id === item.productId ||
          p.slug === item.productId ||
          item.productId?.startsWith(`${p.id}-`) ||
          item.productId?.startsWith(`${p.slug}-`) ||
          p.name.toLowerCase() === (item.productName || item.name || item.title || "").toLowerCase()
      );

      if (prod) {
        if (prod.stock <= 0) {
          return NextResponse.json(
            {
              success: false,
              message: `Product "${prod.name}" is currently out of stock. Please update your cart.`,
            },
            { status: 400 }
          );
        }
        if (item.quantity > prod.stock) {
          return NextResponse.json(
            {
              success: false,
              message: `Cannot order ${item.quantity} units of "${prod.name}". Only ${prod.stock} items left in stock.`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Format items snapshot
    const normalizedItems = items.map((i: any) => ({
      productId: i.productId || i.id || "",
      productName: i.productName || i.name || i.title || "Press-On Nail Set",
      productImage: i.productImage || i.image || "/images/IMG_7098.webp",
      size: i.size || "Standard",
      quantity: Number(i.quantity) || 1,
      price: Number(i.price || i.priceNumber) || 19.99,
      subtotal: (Number(i.price || i.priceNumber) || 19.99) * (Number(i.quantity) || 1),
    }));

    const newOrder = DataStore.createOrder({
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
        address: customer.address || body.shippingAddress || "",
        city: customer.city || "",
        state: customer.state || "",
        zipCode: customer.zipCode || "",
        country: customer.country || "United States",
      },
      items: normalizedItems,
      subtotal: Number(body.subtotal || total),
      discount: Number(body.discount || 0),
      shipping: Number(body.shipping || 0),
      tax: Number(body.tax || 0),
      total: Number(total),
      paymentMethod: body.paymentMethod || "Credit Card",
      paymentStatus: body.paymentStatus || "paid",
      orderStatus: body.orderStatus || "pending",
      shippingAddress: body.shippingAddress || customer.address || "",
      trackingNumber: body.trackingNumber || "",
      notes: body.notes || "",
    });

    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 }
    );
  }
}
