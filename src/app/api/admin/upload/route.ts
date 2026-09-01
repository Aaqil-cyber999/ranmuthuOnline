import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/security/guard";

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission("upload");
    if (auth instanceof NextResponse) return auth;

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    if (!ALLOWED_MIME[file.type]) {
      return NextResponse.json({ error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const magic = buffer.slice(0, 8);
    const validMagic =
      (file.type === "image/jpeg" && magic[0] === 0xff && magic[1] === 0xd8) ||
      (file.type === "image/png" && magic[0] === 0x89 && magic[1] === 0x50) ||
      (file.type === "image/gif" && magic[0] === 0x47 && magic[1] === 0x49) ||
      (file.type === "image/webp" && magic.slice(0, 4).toString("ascii") === "RIFF");

    if (!validMagic) {
      return NextResponse.json({ error: "File content does not match image type" }, { status: 400 });
    }

    const ext = ALLOWED_MIME[file.type];
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseKey) {
        const uploadRes = await fetch(
          `${supabaseUrl}/storage/v1/object/uploads/${filename}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": file.type,
            },
            body: buffer,
          }
        );

        if (uploadRes.ok) {
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/uploads/${filename}`;
          return NextResponse.json({ url: publicUrl });
        }
      }

      return NextResponse.json(
        { error: "File upload not configured for production. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
        { status: 500 }
      );
    }

    const { writeFile, mkdir } = await import("fs/promises");
    const { join } = await import("path");
    const { existsSync } = await import("fs");

    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
