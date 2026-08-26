import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { slugify } from "@/lib/utils";
import { requirePermission } from "@/lib/security/guard";
import { categoryCreateSchema, formatZodError } from "@/lib/security/validation";
import { getAdminSession } from "@/lib/security/session";

function isUnauthed(result: unknown): result is NextResponse {
  return result instanceof NextResponse;
}

export async function GET(request: NextRequest) {
  try {
    const includeInactive = request.nextUrl.searchParams.get("all") === "true";
    let categories;

    if (includeInactive) {
      const session = await getAdminSession();
      if (!session) {
        categories = await prisma.category.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: { _count: { select: { products: true } } },
        });
      } else {
        categories = await prisma.category.findMany({
          orderBy: { sortOrder: "asc" },
          include: { _count: { select: { products: true } } },
        });
      }
    } else {
      categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { products: true } } },
      });
    }

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("Categories fetch error:", error?.message || error);
    return NextResponse.json({ error: "Failed to fetch categories", detail: error?.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission("categories:manage");
  if (isUnauthed(auth)) return auth;

  try {
    const parsed = categoryCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { name, description, image, sortOrder, isActive } = parsed.data;

    const slug = slugify(name);
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        image: image || null,
        sortOrder: sortOrder || 0,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
