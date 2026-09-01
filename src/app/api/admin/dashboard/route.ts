import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requirePermission } from "@/lib/security/guard";

export async function GET() {
  try {
    const auth = await requirePermission("dashboard:view");
    if (auth instanceof NextResponse) return auth;

    const [
      totalOrders,
      totalProducts,
      totalCustomers,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.product.count({ where: { status: { not: "archived" } } }),
      prisma.order.findMany({
        select: { customerPhone: true },
        distinct: ["customerPhone"],
      }).then((r) => r.length),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.order.count({ where: { status: "completed" } }),
      prisma.order.count({ where: { status: "cancelled" } }),
      prisma.order.findMany({
        include: { orderItems: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const revenueResult = await prisma.order.aggregate({
      where: { status: { in: ["confirmed", "processing", "ready", "shipped", "completed"] } },
      _sum: { total: true },
    });

    const ordersByStatusRows = await prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    });
    const ordersByStatus: Record<string, number> = {};
    ordersByStatusRows.forEach((row) => {
      ordersByStatus[row.status] = row._count.id;
    });

    const lowStockProducts = await prisma.product.findMany({
      where: {
        status: "active",
        stock: { lte: 10 },
      },
      orderBy: { stock: "asc" },
      take: 10,
    });

    const now = new Date();
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthStr = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });

      const result = await prisma.order.aggregate({
        where: {
          status: { in: ["confirmed", "processing", "ready", "shipped", "completed"] },
          createdAt: { gte: date, lt: nextDate },
        },
        _sum: { total: true },
      });

      monthlyRevenue.push({
        month: monthStr,
        revenue: result._sum.total || 0,
      });
    }

    return NextResponse.json({
      stats: {
        totalOrders,
        totalRevenue: revenueResult._sum.total || 0,
        totalProducts,
        totalCustomers,
        pendingOrders,
        completedOrders,
        cancelledOrders,
      },
      ordersByStatus,
      recentOrders,
      lowStockProducts,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
