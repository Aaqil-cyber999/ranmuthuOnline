import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { normalizeSriLankanPhone } from "@/lib/utils";
import { rateLimit, getClientIp } from "@/lib/security/rateLimit";

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed, response: rlResponse } = rateLimit(`my-orders:${ip}`, { maxRequests: 10, windowMs: 60_000 });
    if (!allowed) return rlResponse!;

    const phone = request.nextUrl.searchParams.get("phone") || "";
    const normalized = normalizeSriLankanPhone(phone);

    if (!normalized) {
      return NextResponse.json({ error: "Please enter a valid phone number" }, { status: 400 });
    }

    const localDigits = normalized.replace(/^94/, ""); // 9-digit e.g. 779560026

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { customerPhone: normalized },
          { customerPhone: { endsWith: localDigits } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        orderItems: {
          select: {
            quantity: true,
            price: true,
            variant: true,
            product: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json({
      orders: orders.map((order) => ({
        trackingNumber: order.trackingNumber,
        orderNumber: order.orderNumber,
        status: order.status,
        customerName: order.customerName,
        customerAddress: order.customerAddress,
        items: order.orderItems.map((oi) => ({
          name: oi.product.name,
          variant: oi.variant,
          quantity: oi.quantity,
          price: oi.price,
        })),
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
        createdAt: order.createdAt,
      })),
    });
  } catch (err) {
    console.error("My orders lookup failed:", err);
    return NextResponse.json({ error: "Failed to look up orders" }, { status: 500 });
  }
}
