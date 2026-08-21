import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/lib/security/guard";
import { categoryUpdateSchema, formatZodError } from "@/lib/security/validation";

function isUnauthed(result: unknown): result is NextResponse {
  return result instanceof NextResponse;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await prisma.category.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { products: { where: { status: "active" } } },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (isUnauthed(auth)) return auth;

  try {
    const { id } = await params;
    const parsed = categoryUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const body = parsed.data;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (body.name !== undefined) {
      updateData.name = body.name;
      const newSlug = slugify(body.name);
      const slugExists = await prisma.category.findFirst({ where: { slug: newSlug, id: { not: id } } });
      updateData.slug = slugExists ? `${newSlug}-${Date.now()}` : newSlug;
    }
    if (body.description !== undefined) updateData.description = body.description;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const category = await prisma.category.update({ where: { id }, data: updateData });
    return NextResponse.json({ category });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (isUnauthed(auth)) return auth;

  try {
    const { id } = await params;

    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${productCount} products. Reassign products first.` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
