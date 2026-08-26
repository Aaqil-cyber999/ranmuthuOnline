import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    const url = process.env.DATABASE_URL || "";
    const hasDbUrl = url.length > 0;
    const masked = hasDbUrl ? url.replace(/:[^:@]+@/, ":***@") : "NOT SET";

    const count = await prisma.product.count();

    return NextResponse.json({
      ok: true,
      databaseUrl: masked,
      productCount: count,
    });
  } catch (error: any) {
    const url = process.env.DATABASE_URL || "";
    const masked = url.length > 0 ? url.replace(/:[^:@]+@/, ":***@") : "NOT SET";

    return NextResponse.json({
      ok: false,
      databaseUrl: masked,
      error: error?.message || String(error),
    });
  }
}
