import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { slugify } from "@/lib/utils";
import { requirePermission } from "@/lib/security/guard";
import { productUpdateSchema, formatZodError, toNumber, toInt } from "@/lib/security/validation";

function isUnauthed(result: unknown): result is NextResponse {
  return result instanceof NextResponse;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        status: "active",
      },
      include: { category: true, variants: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("products:manage");
  if (isUnauthed(auth)) return auth;

  try {
    const { id } = await params;
    const parsed = productUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { name, description, price, salePrice, sku, barcode, stock, lowStockThreshold, images, status, isFeatured, categoryId, variants } = parsed.data;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let slug = existing.slug;
    if (name && name !== existing.name) {
      slug = slugify(name);
      const slugExists = await prisma.product.findFirst({ where: { slug, id: { not: id } } });
      if (slugExists) slug = `${slug}-${Date.now()}`;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== existing.slug) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = toNumber(price);
    if (salePrice !== undefined) updateData.salePrice = salePrice ? toNumber(salePrice) : null;
    if (sku !== undefined) updateData.sku = sku;
    if (barcode !== undefined) updateData.barcode = barcode;
    if (stock !== undefined) updateData.stock = toInt(stock);
    if (lowStockThreshold !== undefined) updateData.lowStockThreshold = toInt(lowStockThreshold, 5);
    if (images !== undefined) updateData.images = JSON.stringify(images);
    if (status !== undefined) updateData.status = status;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;

    if (variants !== undefined && variants !== null) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      if (Array.isArray(variants) && variants.length > 0) {
        await prisma.productVariant.createMany({
          data: variants.map((v: any) => ({
            name: v.name,
            value: v.value,
            price: v.price ? toNumber(v.price) : null,
            stock: toInt(v.stock),
            sku: v.sku || null,
            productId: id,
          })),
        });
      }
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("inventory:manage");
  if (isUnauthed(auth)) return auth;

  try {
    const { id } = await params;
    const body = await request.json();
    const stock = toInt(body.stock);

    if (body.stock === undefined || isNaN(stock) || stock < 0) {
      return NextResponse.json({ error: "A valid stock quantity is required" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: { stock },
    });

    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("products:manage");
  if (isUnauthed(auth)) return auth;

  try {
    const { id } = await params;

    const hasOrders = await prisma.orderItem.findFirst({ where: { productId: id } });
    if (hasOrders) {
      await prisma.product.update({
        where: { id },
        data: { status: "archived" },
      });
      return NextResponse.json({ success: true, message: "Product archived (has order history)" });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
