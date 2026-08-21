import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "admin123",
    12
  );

  await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@ranmuthu.com" },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || "admin@ranmuthu.com",
      password: adminPassword,
      name: "Admin",
    },
  });

  const categories = [
    { name: "Electronics", slug: "electronics", description: "Latest gadgets and electronics", sortOrder: 1 },
    { name: "Fashion", slug: "fashion", description: "Trendy clothing and accessories", sortOrder: 2 },
    { name: "Home & Living", slug: "home-living", description: "Furniture and home decor", sortOrder: 3 },
    { name: "Beauty", slug: "beauty", description: "Skincare and beauty products", sortOrder: 4 },
    { name: "Sports", slug: "sports", description: "Sports and fitness equipment", sortOrder: 5 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const allCategories = await prisma.category.findMany();
  const getCat = (slug: string) => allCategories.find((c) => c.slug === slug)?.id;

  const products = [
    {
      name: "Wireless Bluetooth Headphones",
      slug: "wireless-bluetooth-headphones",
      description:
        "Premium noise-cancelling wireless headphones with 40-hour battery life. Crystal clear sound quality with deep bass. Comfortable over-ear design with memory foam cushions.",
      price: 12500,
      salePrice: 9999,
      sku: "WBH-001",
      stock: 45,
      isFeatured: true,
      categoryId: getCat("electronics"),
      images: JSON.stringify(["/uploads/headphones.jpg"]),
    },
    {
      name: "Smart Watch Pro",
      slug: "smart-watch-pro",
      description:
        "Advanced smartwatch with health monitoring, GPS tracking, and 7-day battery life. Water resistant up to 50m. Compatible with iOS and Android.",
      price: 18999,
      salePrice: 15999,
      sku: "SWP-002",
      stock: 30,
      isFeatured: true,
      categoryId: getCat("electronics"),
      images: JSON.stringify(["/uploads/smartwatch.jpg"]),
    },
    {
      name: "Premium Cotton T-Shirt",
      slug: "premium-cotton-tshirt",
      description:
        "100% organic cotton t-shirt with a modern fit. Available in multiple colors. Breathable and comfortable for everyday wear.",
      price: 2999,
      sku: "PCT-003",
      stock: 100,
      isFeatured: true,
      categoryId: getCat("fashion"),
      images: JSON.stringify(["/uploads/tshirt.jpg"]),
    },
    {
      name: "Designer Sunglasses",
      slug: "designer-sunglasses",
      description:
        "UV400 protection designer sunglasses with polarized lenses. Lightweight titanium frame. Includes premium carrying case.",
      price: 7500,
      salePrice: 5999,
      sku: "DSG-004",
      stock: 25,
      categoryId: getCat("fashion"),
      images: JSON.stringify(["/uploads/sunglasses.jpg"]),
    },
    {
      name: "Minimalist Desk Lamp",
      slug: "minimalist-desk-lamp",
      description:
        "Modern LED desk lamp with adjustable brightness and color temperature. Touch control with USB charging port. Energy efficient design.",
      price: 4999,
      sku: "MDL-005",
      stock: 40,
      isFeatured: true,
      categoryId: getCat("home-living"),
      images: JSON.stringify(["/uploads/desklamp.jpg"]),
    },
    {
      name: "Ceramic Plant Pot Set",
      slug: "ceramic-plant-pot-set",
      description:
        "Set of 3 handcrafted ceramic plant pots in graduated sizes. Drainage holes included. Perfect for indoor plants and succulents.",
      price: 3499,
      salePrice: 2999,
      sku: "CPP-006",
      stock: 60,
      categoryId: getCat("home-living"),
      images: JSON.stringify(["/uploads/plantpot.jpg"]),
    },
    {
      name: "Vitamin C Serum",
      slug: "vitamin-c-serum",
      description:
        "Brightening vitamin C serum with hyaluronic acid and vitamin E. Paraben-free and dermatologist tested. 30ml bottle.",
      price: 3299,
      sku: "VCS-007",
      stock: 80,
      isFeatured: true,
      categoryId: getCat("beauty"),
      images: JSON.stringify(["/uploads/serum.jpg"]),
    },
    {
      name: "Yoga Mat Premium",
      slug: "yoga-mat-premium",
      description:
        "Extra thick non-slip yoga mat with alignment lines. Eco-friendly TPE material. Includes carrying strap. 6mm thickness.",
      price: 4500,
      salePrice: 3999,
      sku: "YMP-008",
      stock: 35,
      isFeatured: true,
      categoryId: getCat("sports"),
      images: JSON.stringify(["/uploads/yogamat.jpg"]),
    },
    {
      name: "Wireless Charging Pad",
      slug: "wireless-charging-pad",
      description:
        "Fast wireless charging pad compatible with all Qi-enabled devices. Sleek minimalist design with LED indicator. 15W fast charge.",
      price: 2499,
      sku: "WCP-009",
      stock: 55,
      categoryId: getCat("electronics"),
      images: JSON.stringify(["/uploads/charger.jpg"]),
    },
    {
      name: "Stainless Steel Water Bottle",
      slug: "stainless-steel-water-bottle",
      description:
        "Double-wall vacuum insulated water bottle. Keeps drinks cold for 24 hours or hot for 12 hours. BPA-free, 750ml capacity.",
      price: 1999,
      sku: "SSWB-010",
      stock: 120,
      categoryId: getCat("sports"),
      images: JSON.stringify(["/uploads/waterbottle.jpg"]),
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product as any,
    });
  }

  const settings = [
    { key: "store_name", value: process.env.STORE_NAME || "Ranmuthu Fancy" },
    { key: "store_email", value: "info@ranmuthu.com" },
    { key: "store_phone", value: "+94771234567" },
    { key: "store_address", value: "Colombo, Sri Lanka" },
    { key: "store_currency", value: process.env.STORE_CURRENCY || "LKR" },
    { key: "delivery_fee", value: "350" },
    { key: "free_delivery_min", value: "10000" },
    { key: "whatsapp_number", value: process.env.WHATSAPP_ADMIN_NUMBER || "+94771234567" },
  ];

  for (const setting of settings) {
    await prisma.storeSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  const banners = [
    {
      title: "Welcome to Ranmuthu Fancy",
      subtitle: "Discover premium products at amazing prices",
      image: "/uploads/banner1.jpg",
      isActive: true,
      sortOrder: 1,
    },
    {
      title: "Summer Sale",
      subtitle: "Up to 40% off on selected items",
      image: "/uploads/banner2.jpg",
      link: "/products",
      isActive: true,
      sortOrder: 2,
    },
  ];

  for (const banner of banners) {
    const existing = await prisma.banner.findFirst({ where: { title: banner.title } });
    if (!existing) {
      await prisma.banner.create({ data: banner });
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
