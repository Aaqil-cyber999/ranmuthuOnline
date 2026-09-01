import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getAdminSession } from "@/lib/security/session";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20") || 20));
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const featured = searchParams.get("featured") || "";
    const sort = searchParams.get("sort") || "newest";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const sale = searchParams.get("sale") || "";

    const session = await getAdminSession();
    const isAdmin = !!session;

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

    if (status && isAdmin) {
      where.status = status;
    } else if (!isAdmin) {
      where.status = "active";
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    if (sale === "true") {
      where.salePrice = { not: null };
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
  } catch (error: any) {
    console.error("Products fetch error:", error?.message || error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
