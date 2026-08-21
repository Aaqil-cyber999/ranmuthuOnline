import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { sendWhatsAppOrder } from "@/lib/whatsapp";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20") || 20));
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "newest";

    const where: any = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const orderBy: any = {};
    switch (sort) {
      case "oldest": orderBy.createdAt = "asc"; break;
      case "total-asc": orderBy.total = "asc"; break;
      case "total-desc": orderBy.total = "desc"; break;
      default: orderBy.createdAt = "desc";
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: { include: { product: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerEmail, customerPhone, customerAddress, items, deliveryFee, notes } = body;

    if (!customerName || !customerPhone || !items?.length) {
      return NextResponse.json(
        { error: "Customer name, phone, and at least one item are required" },
        { status: 400 }
      );
    }

    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }
      if (product.status !== "active") {
        return NextResponse.json({ error: `Product not available: ${product.name}` }, { status: 400 });
      }

      const quantity = parseInt(item.quantity);
      if (isNaN(quantity) || quantity < 1) {
        return NextResponse.json({ error: `Invalid quantity for ${product.name}` }, { status: 400 });
      }

      if (product.stock < quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}. Available: ${product.stock}` }, { status: 400 });
      }

      const price = product.salePrice || product.price;
      subtotal += price * quantity;

      orderItemsData.push({
        productId: product.id,
        quantity,
        price,
        variant: item.variant || null,
      });
    }

    const deliveryFeeNum = parseFloat(deliveryFee || "0");
    const total = subtotal + (isNaN(deliveryFeeNum) ? 0 : deliveryFeeNum);
    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName,
          customerEmail: customerEmail || null,
          customerPhone,
          customerAddress: customerAddress || null,
          items: JSON.stringify(orderItemsData),
          subtotal,
          deliveryFee: isNaN(deliveryFeeNum) ? 0 : deliveryFeeNum,
          total,
          status: "pending",
          notes: notes || null,
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          orderItems: { include: { product: true } },
        },
      });

      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    const whatsappItems = order.orderItems.map((oi) => ({
      name: oi.product.name,
      quantity: oi.quantity,
      price: oi.price,
      variant: oi.variant || undefined,
    }));

    const waResult = await sendWhatsAppOrder({
      customerName,
      customerPhone,
      customerAddress: customerAddress || undefined,
      items: whatsappItems,
      subtotal,
      deliveryFee: isNaN(deliveryFeeNum) ? 0 : deliveryFeeNum,
      total,
      orderNumber,
    });

    return NextResponse.json({ order, whatsapp: waResult }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
