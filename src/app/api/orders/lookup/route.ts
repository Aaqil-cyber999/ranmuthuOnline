import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export async function GET(request: NextRequest) {
  try {
    const phoneParam = request.nextUrl.searchParams.get("phone") || "";
    const digits = phoneParam.replace(/\D/g, "");

    if (digits.length < 9 || digits.length > 15) {
      return NextResponse.json({ error: "Please enter a valid phone number" }, { status: 400 });
    }

    const tail = digits.slice(-9);

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        orderNumber: true,
        customerPhone: true,
        status: true,
        total: true,
        createdAt: true,
        _count: { select: { orderItems: true } },
      },
    });

    const matched = orders
      .filter((o) => o.customerPhone.replace(/\D/g, "").slice(-9) === tail)
      .map((o) => ({
        orderNumber: o.orderNumber,
        status: ORDER_STATUSES.includes(o.status) ? o.status : "pending",
        total: o.total,
        itemCount: o._count.orderItems,
        createdAt: o.createdAt,
      }));

    return NextResponse.json({ orders: matched });
  } catch (err) {
    console.error("Order lookup failed:", err);
    return NextResponse.json({ error: "Failed to look up orders" }, { status: 500 });
  }
}
