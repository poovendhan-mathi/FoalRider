import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";

// Security: Allowed MIME types
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// Security: Max file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Security: Verify admin access
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Security: Validate file type (strict MIME type checking)
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.",
          allowedTypes: ALLOWED_MIME_TYPES,
        },
        { status: 400 }
      );
    }

    // Security: Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          maxSize: MAX_FILE_SIZE,
        },
        { status: 400 }
      );
    }

    // Security: Validate file extension matches MIME type
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const mimeTypeExtMap: Record<string, string[]> = {
      "image/jpeg": ["jpg", "jpeg"],
      "image/png": ["png"],
      "image/webp": ["webp"],
      "image/gif": ["gif"],
    };

    const allowedExts = mimeTypeExtMap[file.type] || [];
    if (!fileExt || !allowedExts.includes(fileExt)) {
      return NextResponse.json(
        { error: "File extension does not match file type" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Security: Generate unique, unpredictable filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage with security headers
    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false, // Security: Prevent overwriting existing files
      });

    if (error) {
      console.error("Error uploading to Supabase:", error);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(filePath);

    return NextResponse.json({
      url: publicUrl,
      path: filePath,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    console.error("Error in upload:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Security: DELETE endpoint for cleaning up unused images
export async function DELETE(request: NextRequest) {
  try {
    // Security: Verify admin access
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 }
      );
    }

    // Security: Validate path is within products folder
    if (!filePath.startsWith("products/")) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase.storage
      .from("product-images")
      .remove([filePath]);

    if (error) {
      console.error("Error deleting from Supabase:", error);
      return NextResponse.json(
        { error: "Failed to delete image" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Error in delete:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
