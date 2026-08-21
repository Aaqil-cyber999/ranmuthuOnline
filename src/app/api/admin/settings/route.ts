import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

const SENSITIVE_KEYS = ["whatsapp_token"];

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { settings, banners } = body;

    if (settings) {
      for (const [key, value] of Object.entries(settings)) {
        if (SENSITIVE_KEYS.includes(key)) continue;
        await prisma.storeSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
      }
    }

    if (banners && Array.isArray(banners)) {
      for (const banner of banners) {
        if (banner.id) {
          await prisma.banner.update({
            where: { id: banner.id },
            data: {
              title: banner.title,
              subtitle: banner.subtitle,
              image: banner.image,
              link: banner.link,
              isActive: banner.isActive,
              sortOrder: banner.sortOrder,
            },
          });
        } else {
          await prisma.banner.create({
            data: {
              title: banner.title,
              subtitle: banner.subtitle,
              image: banner.image,
              link: banner.link,
              isActive: banner.isActive !== false,
              sortOrder: banner.sortOrder || 0,
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
