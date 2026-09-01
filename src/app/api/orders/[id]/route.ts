import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireAdmin, requirePermission } from "@/lib/security/guard";

function isUnauthed(result: unknown): result is NextResponse {
  return result instanceof NextResponse;
}

const VALID_STATUSES = ["pending", "confirmed", "processing", "ready", "shipped", "completed", "cancelled"];
const MAX_NOTES = 1000;

function safeParseItems(json: string | null): any[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (isUnauthed(auth)) return auth;

  try {
    const { id } = await params;
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: {
        orderItems: { include: { product: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("orders:manage");
  if (isUnauthed(auth)) return auth;

  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
      }
      updateData.status = body.status;
    }
    if (body.notes !== undefined) {
      if (typeof body.notes !== "string" || body.notes.length > MAX_NOTES) {
        return NextResponse.json({ error: "Notes are too long" }, { status: 400 });
      }
      updateData.notes = body.notes;
    }

    if (body.status && body.status !== existing.status) {
      if (body.status === "confirmed" || body.status === "processing") {
        const orderItems = safeParseItems(existing.items);
        for (const item of orderItems) {
          const product = await prisma.product.findUnique({ where: { id: item.productId } });
          if (product && product.stock < item.quantity) {
            return NextResponse.json(
              { error: `Insufficient stock for ${product.name}. Available: ${product.stock}` },
              { status: 400 }
            );
          }
        }
      }

      if (body.status === "cancelled" && existing.status !== "cancelled") {
        const orderItems = safeParseItems(existing.items);
        await prisma.$transaction(
          orderItems.map((item: any) =>
            prisma.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            })
          )
        );
      }
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        orderItems: { include: { product: true } },
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("orders:delete");
  if (isUnauthed(auth)) return auth;

  try {
    const { id } = await params;
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (existing.status !== "cancelled") {
      const orderItems = safeParseItems(existing.items);
      await prisma.$transaction(
        orderItems.map((item: any) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        )
      );
    }

    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
