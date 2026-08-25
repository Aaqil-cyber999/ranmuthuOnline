import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TRACKING_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateTrackingNumber(): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += TRACKING_CHARS[Math.floor(Math.random() * TRACKING_CHARS.length)];
  }
  return `RMX-${code.slice(0, 4)}-${code.slice(4)}`;
}

async function main() {
  const orders = await prisma.order.findMany({
    where: { trackingNumber: null },
    select: { id: true, orderNumber: true },
  });

  console.log(`Backfilling ${orders.length} orders with tracking numbers...`);

  for (const order of orders) {
    let assigned = false;
    for (let attempt = 0; attempt < 10 && !assigned; attempt++) {
      const trackingNumber = generateTrackingNumber();
      try {
        await prisma.order.update({
          where: { id: order.id },
          data: { trackingNumber },
        });
        console.log(`  ${order.orderNumber} -> ${trackingNumber}`);
        assigned = true;
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code;
        if (code === "P2002") continue;
        throw err;
      }
    }
    if (!assigned) {
      throw new Error(`Could not assign a unique tracking number to ${order.orderNumber}`);
    }
  }

  console.log("Backfill complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
