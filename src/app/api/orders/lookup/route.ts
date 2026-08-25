import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { rateLimit, getClientIp } from "@/lib/security/rateLimit";

const NOT_FOUND = "Tracking number not found. Please check the number and try again.";

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed, response: rlResponse } = rateLimit(`tracking:${ip}`, { maxRequests: 20, windowMs: 60_000 });
    if (!allowed) return rlResponse!;

    const raw = request.nextUrl.searchParams.get("tracking") || "";

    const cleaned = raw.trim().toUpperCase().replace(/\s+/g, "");
    let formatted: string;

    if (/^RMX-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/.test(cleaned)) {
      formatted = cleaned;
    } else if (/^RMX[A-HJ-NP-Z2-9]{8}$/.test(cleaned)) {
      formatted = `RMX-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    } else {
      return NextResponse.json({ error: "Please enter a valid tracking number (e.g. RMX-7K4P-92QF)" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { trackingNumber: formatted },
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

    if (!order) {
      return NextResponse.json({ error: NOT_FOUND }, { status: 404 });
    }

    return NextResponse.json({
      order: {
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
      },
    });
  } catch (err) {
    console.error("Order lookup failed:", err);
    return NextResponse.json({ error: "Failed to look up the order" }, { status: 500 });
  }
}
