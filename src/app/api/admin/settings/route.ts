import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requirePermission } from "@/lib/security/guard";

const SENSITIVE_KEYS = ["whatsapp_token"];
const MAX_BANNER_TITLE = 100;
const MAX_BANNER_SUBTITLE = 200;
const MAX_BANNER_IMAGE = 2000;
const MAX_BANNER_LINK = 500;
const MAX_SETTING_VALUE = 500;

export async function GET() {
  try {
    const auth = await requirePermission("store-settings:manage");
    if (auth instanceof NextResponse) return auth;

    const settings = await prisma.storeSetting.findMany();
    const map: Record<string, string> = {};
    settings.forEach((s) => {
      if (!SENSITIVE_KEYS.includes(s.key)) {
        map[s.key] = s.value;
      }
    });

    const banners = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });

    return NextResponse.json({ settings: map, banners });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requirePermission("store-settings:manage");
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { settings, banners } = body;

    if (settings) {
      for (const [key, value] of Object.entries(settings)) {
        if (SENSITIVE_KEYS.includes(key)) continue;
        if (typeof value !== "string" || value.length > MAX_SETTING_VALUE) continue;
        await prisma.storeSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
      }
    }

    if (banners && Array.isArray(banners)) {
      for (const banner of banners) {
        const title = typeof banner.title === "string" ? banner.title.slice(0, MAX_BANNER_TITLE) : "";
        const subtitle = typeof banner.subtitle === "string" ? banner.subtitle.slice(0, MAX_BANNER_SUBTITLE) : null;
        const image = typeof banner.image === "string" ? banner.image.slice(0, MAX_BANNER_IMAGE) : "";
        const link = typeof banner.link === "string" ? banner.link.slice(0, MAX_BANNER_LINK) : null;
        const sortOrder = typeof banner.sortOrder === "number" ? banner.sortOrder : 0;
        const isActive = banner.isActive !== false;

        if (!title || !image) continue;
        if (banner.id) {
          await prisma.banner.update({
            where: { id: banner.id },
            data: {
              title,
              subtitle,
              image,
              link,
              isActive,
              sortOrder,
            },
          });
        } else {
          await prisma.banner.create({
            data: {
              title,
              subtitle,
              image,
              link,
              isActive,
              sortOrder,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
