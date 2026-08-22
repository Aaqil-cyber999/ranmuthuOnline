import prisma from "./db/prisma";

interface OrderItemData {
  name: string;
  quantity: number;
  price: number;
  variant?: string;
}

interface WhatsAppOrderParams {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: OrderItemData[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  orderNumber: string;
}

function buildOrderMessage(order: WhatsAppOrderParams): string {
  let msg = `🛒 *New Order - ${order.orderNumber}*\n\n`;
  msg += `👤 *Customer:* ${order.customerName}\n`;
  msg += `📱 *Phone:* ${order.customerPhone}\n`;
  if (order.customerAddress) {
    msg += `📍 *Address:* ${order.customerAddress}\n`;
  }
  msg += `\n📦 *Items:*\n`;
  msg += `─`.repeat(30) + "\n";

  order.items.forEach((item, idx) => {
    msg += `${idx + 1}. ${item.name}`;
    if (item.variant) msg += ` (${item.variant})`;
    msg += `\n   Qty: ${item.quantity} × ${formatWA(item.price)} = ${formatWA(item.quantity * item.price)}\n`;
  });

  msg += `─`.repeat(30) + "\n";
  msg += `💰 *Subtotal:* ${formatWA(order.subtotal)}\n`;
  if (order.deliveryFee > 0) {
    msg += `🚚 *Delivery:* ${formatWA(order.deliveryFee)}\n`;
  }
  msg += `💳 *Total:* ${formatWA(order.total)}\n\n`;
  msg += `📅 ${new Date().toLocaleString("en-LK")}`;

  return msg;
}

function formatWA(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-LK")}`;
}

export async function sendWhatsAppOrder(order: WhatsAppOrderParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiUrl = process.env.WHATSAPP_API_URL || process.env.WATSAPP_API_URL;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WATSAPP_ACCESS_TOKEN;

  if (!apiUrl || !accessToken) {
    const message = buildOrderMessage(order);
    const adminNumber = process.env.WHATSAPP_ADMIN_NUMBER || order.customerPhone;
    const waLink = `https://wa.me/${adminNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;

    await prisma.order.update({
      where: { orderNumber: order.orderNumber },
      data: { whatsappSent: true },
    }).catch(() => {});

    return { success: true, messageId: "fallback-link", error: `WhatsApp link: ${waLink}` };
  }

  const message = buildOrderMessage(order);
  const adminNumber = (process.env.WHATSAPP_ADMIN_NUMBER || "").replace(/[^0-9]/g, "");

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: adminNumber,
        type: "text",
        text: { body: message },
      }),
    });

    const data = await response.json();

    if (response.ok) {
      await prisma.order.update({
        where: { orderNumber: order.orderNumber },
        data: { whatsappSent: true },
      }).catch(() => {});

      return { success: true, messageId: data.messages?.[0]?.id };
    }

    return { success: false, error: data.error?.message || "Failed to send WhatsApp message" };
  } catch (error) {
    return { success: false, error: "Failed to connect to WhatsApp API" };
  }
}

export async function getWhatsAppSettings() {
  const settings = await prisma.storeSetting.findMany({
    where: {
      key: { in: ["whatsapp_number", "whatsapp_api_url", "whatsapp_token"] },
    },
  });

  const map: Record<string, string> = {};
  settings.forEach((s) => (map[s.key] = s.value));
  return map;
}
