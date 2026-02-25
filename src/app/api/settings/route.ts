import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSettingsSchema = z.object({
  exchangeRate: z.number().positive().finite().optional(),
  pricePerKg: z.number().positive().finite().optional(),
  chinaAddress: z.string().max(500).optional(),
  warehouseAddress: z.string().max(500).optional(),
  whatsappNumber: z.string().max(20).optional(),
  instagramLink: z.string().max(200).optional(),
  aboutText: z.string().max(5000).optional(),
  prohibitedItems: z.string().max(5000).optional(),
  instructionText: z.string().max(5000).optional(),
});

export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({ where: { id: "main" } });
    if (!settings) {
      settings = await prisma.settings.create({ data: { id: "main" } });
    }
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const data = updateSettingsSchema.parse(body);

    const settings = await prisma.settings.upsert({
      where: { id: "main" },
      update: data,
      create: { id: "main", ...data },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Проверьте данные" }, { status: 400 });
    }
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
