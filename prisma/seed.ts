import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const adminPhone = process.env.ADMIN_PHONE || "77001234567";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { phone: adminPhone },
    update: {},
    create: {
      phone: adminPhone,
      password: hashedPassword,
      name: "Admin",
      surname: "Admin",
      role: Role.ADMIN,
    },
  });

  console.log(`Admin user created: ${adminPhone}`);

  // Seed statuses
  const statuses = [
    { name: "Ожидает", chineseName: null, order: 1, color: "#9CA3AF", isFinal: false },
    { name: "На складе в Китае", chineseName: "已入库", order: 2, color: "#F59E0B", isFinal: false },
    { name: "Отправлено из Китая", chineseName: "已出库", order: 3, color: "#3B82F6", isFinal: false },
    { name: "В пути", chineseName: "运输中", order: 4, color: "#8B5CF6", isFinal: false },
    { name: "На складе в Казахстане", chineseName: "已到达", order: 5, color: "#10B981", isFinal: false },
    { name: "Готов к выдаче", chineseName: "待取件", order: 6, color: "#06B6D4", isFinal: false },
    { name: "Выдан", chineseName: "已签收", order: 7, color: "#22C55E", isFinal: true },
  ];

  for (const status of statuses) {
    await prisma.status.upsert({
      where: { name: status.name },
      update: { chineseName: status.chineseName, order: status.order, color: status.color, isFinal: status.isFinal },
      create: status,
    });
  }

  console.log(`${statuses.length} statuses created`);

  // Seed settings
  await prisma.settings.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      exchangeRate: 495,
      pricePerKg: 3.5,
      chinaAddress: "",
      warehouseAddress: "Космическая 8/2",
      whatsappNumber: "",
      aboutText: "Мы предлагаем Вам услуги в области грузоперевозки.\nНаше карго доставляет товары со всех китайских маркетплейсов!\nМы всегда на связи со своими клиентами, помогаем решить любые возникшие вопросы и трудности.",
      prohibitedItems: "Драгоценные камни и металлы (бижутерные украшения разрешены)\nНезадекларированную валюту в крупных размерах\nПорнографические материалы\nОружие и боеприпасы\nНаркотические и психотропные вещества",
      instructionText: "",
    },
  });

  console.log("Settings created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
