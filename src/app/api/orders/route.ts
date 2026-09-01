import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { generateOrderNumber, generateTrackingNumber, normalizeSriLankanPhone } from "@/lib/utils";
import { sendWhatsAppOrder } from "@/lib/whatsapp";
import { requirePermission } from "@/lib/security/guard";
import { rateLimit, getClientIp } from "@/lib/security/rateLimit";

const VALID_ORDER_STATUSES = ["pending", "confirmed", "processing", "ready", "shipped", "completed", "cancelled"];
const MAX_NAME = 100;
const MAX_PHONE = 20;
const MAX_EMAIL = 150;
const MAX_ADDRESS = 500;
const MAX_NOTES = 1000;
const MAX_QUANTITY = 99;
const DELIVERY_FEE = 350;
const FREE_DELIVERY_MIN = 10000;

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed, response: rlResponse } = rateLimit(`orders-list:${ip}`, { maxRequests: 30, windowMs: 60_000 });
    if (!allowed) return rlResponse!;

    const auth = await requirePermission("orders:view");
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20") || 20));
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "newest";

    const where: any = {};

    if (search) {
      const or: any[] = [
        { orderNumber: { contains: search } },
        { trackingNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
      ];
      const normPhone = normalizeSriLankanPhone(search);
      if (normPhone) {
        const localDigits = normPhone.replace(/^94/, "");
        or.push({ customerPhone: { endsWith: localDigits } });
      }
      where.OR = or;
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
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed, response: rlResponse } = rateLimit(`order:${ip}`, { maxRequests: 5, windowMs: 60_000 });
    if (!allowed) return rlResponse!;

    const body = await request.json();
    const { customerName, customerEmail, customerPhone, customerAddress, items, notes } = body;

    if (!customerName || !customerPhone || !items?.length) {
      return NextResponse.json(
        { error: "Customer name, phone, and at least one item are required" },
        { status: 400 }
      );
    }

    if (typeof customerName !== "string" || customerName.trim().length < 2 || customerName.length > MAX_NAME) {
      return NextResponse.json({ error: "Invalid customer name" }, { status: 400 });
    }
    if (typeof customerPhone !== "string" || customerPhone.trim().length < 7 || customerPhone.length > MAX_PHONE) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }
    const normalizedPhone = normalizeSriLankanPhone(customerPhone);
    if (!normalizedPhone) {
      return NextResponse.json({ error: "Enter a valid Sri Lankan phone number" }, { status: 400 });
    }
    if (customerEmail && (typeof customerEmail !== "string" || customerEmail.length > MAX_EMAIL)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (customerAddress && (typeof customerAddress !== "string" || customerAddress.length > MAX_ADDRESS)) {
      return NextResponse.json({ error: "Address is too long" }, { status: 400 });
    }
    if (notes && (typeof notes !== "string" || notes.length > MAX_NOTES)) {
      return NextResponse.json({ error: "Notes are too long" }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length > 50) {
      return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }

    for (const item of items) {
      if (!item.productId || typeof item.productId !== "string") {
        return NextResponse.json({ error: "Invalid item data" }, { status: 400 });
      }
      const quantity = parseInt(item.quantity);
      if (isNaN(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
        return NextResponse.json({ error: "Invalid item quantity" }, { status: 400 });
      }
    }

    let subtotal = 0;
    const orderItemsData: { productId: string; quantity: number; price: number; variant: string | null }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return NextResponse.json({ error: "One or more products are no longer available" }, { status: 400 });
      }
      if (product.status !== "active") {
        return NextResponse.json({ error: "One or more products are no longer available" }, { status: 400 });
      }

      const quantity = parseInt(item.quantity);
      if (isNaN(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
        return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
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

    const deliveryFeeNum = subtotal >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;
    const total = subtotal + deliveryFeeNum;
    const orderNumber = generateOrderNumber();

    let trackingNumber = "";
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateTrackingNumber();
      const existing = await prisma.order.findUnique({ where: { trackingNumber: candidate }, select: { id: true } });
      if (!existing) {
        trackingNumber = candidate;
        break;
      }
    }
    if (!trackingNumber) {
      return NextResponse.json({ error: "Could not generate a unique tracking number. Please try again." }, { status: 500 });
    }

    const order = await prisma.$transaction(async (tx) => {
      const lockedProducts = await tx.$queryRaw<{ id: string; stock: number }[]>`
        SELECT id, stock FROM "Product"
        WHERE id IN (${orderItemsData.map((i) => i.productId)})
        FOR UPDATE
      `;

      const stockMap = new Map(lockedProducts.map((p) => [p.id, p.stock]));
      for (const item of orderItemsData) {
        const available = stockMap.get(item.productId) ?? 0;
        if (available < item.quantity) {
          throw new Error(`INSUFFICIENT_STOCK:${item.productId}`);
        }
      }

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          trackingNumber,
          customerName,
          customerEmail: customerEmail || null,
          customerPhone: normalizedPhone,
          customerAddress: customerAddress || null,
          items: JSON.stringify(orderItemsData),
          subtotal,
          deliveryFee: deliveryFeeNum,
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

    sendWhatsAppOrder({
      customerName,
      customerPhone: normalizedPhone,
      customerAddress: customerAddress || undefined,
      items: whatsappItems,
      subtotal,
      deliveryFee: deliveryFeeNum,
      total,
      orderNumber,
      trackingNumber,
    }).then((waResult) => {
      if (waResult.messageId && waResult.messageId !== "fallback-link") {
        prisma.order.update({
          where: { orderNumber },
          data: { whatsappSent: true },
        }).catch(() => {});
      }
    }).catch(() => {});

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Order create error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
