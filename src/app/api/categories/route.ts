import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, image, sortOrder, isActive } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

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
