import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Try uploading to Cloudinary first
    const cloudinaryResult = await uploadToCloudinary(buffer, "xon-nails/uploads");
    if (cloudinaryResult) {
      return NextResponse.json({
        success: true,
        data: {
          url: cloudinaryResult.url,
          name: file.name,
          size: file.size,
          public_id: cloudinaryResult.public_id,
        },
      });
    }

    // Fallback to base64 data URL if Cloudinary is not configured
    const mimeType = file.type || "image/jpeg";
    const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;

    return NextResponse.json({
      success: true,
      data: {
        url: base64Data,
        name: file.name,
        size: file.size,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload image" },
      { status: 500 }
    );
  }
}
