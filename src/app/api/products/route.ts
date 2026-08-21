import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/lib/security/guard";
import { productCreateSchema, formatZodError, toNumber, toInt } from "@/lib/security/validation";

function isUnauthed(result: unknown): result is NextResponse {
  return result instanceof NextResponse;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const featured = searchParams.get("featured") || "";
    const sort = searchParams.get("sort") || "newest";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (status) {
      where.status = status;
    } else {
      where.status = "active";
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };

    const orderBy: any = {};
    switch (sort) {
      case "price-asc": orderBy.price = "asc"; break;
      case "price-desc": orderBy.price = "desc"; break;
      case "name": orderBy.name = "asc"; break;
      case "oldest": orderBy.createdAt = "asc"; break;
      default: orderBy.createdAt = "desc";
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, variants: true },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (isUnauthed(auth)) return auth;

  try {
    const parsed = productCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { name, description, price, salePrice, sku, barcode, stock, lowStockThreshold, images, status, isFeatured, categoryId, variants } = parsed.data;

    const slug = slugify(name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    const uniqueSlug = existing ? `${slug}-${Date.now()}` : slug;

    const product = await prisma.product.create({
      data: {
        name,
        slug: uniqueSlug,
        description: description || null,
        price: toNumber(price),
        salePrice: salePrice ? toNumber(salePrice) : null,
        sku: sku || null,
        barcode: barcode || null,
        stock: toInt(stock),
        lowStockThreshold: toInt(lowStockThreshold, 5),
        images: JSON.stringify(images || []),
        status: status || "active",
        isFeatured: isFeatured || false,
        categoryId: categoryId || null,
        variants: variants
          ? {
              create: variants.map((v: any) => ({
                name: v.name,
                value: v.value,
                price: v.price ? toNumber(v.price) : null,
                stock: toInt(v.stock),
                sku: v.sku || null,
              })),
            }
          : undefined,
      },
      include: { category: true, variants: true },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Product create error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
