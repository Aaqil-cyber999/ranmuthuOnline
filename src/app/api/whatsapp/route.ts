import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppOrder } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, customerAddress, items, subtotal, deliveryFee, total, orderNumber } = body;

    if (!customerName || !customerPhone || !items?.length || !orderNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await sendWhatsAppOrder({
      customerName,
      customerPhone,
      customerAddress,
      items,
      subtotal: parseFloat(subtotal),
      deliveryFee: parseFloat(deliveryFee || "0"),
      total: parseFloat(total),
      orderNumber,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to send WhatsApp message" }, { status: 500 });
  }
}
