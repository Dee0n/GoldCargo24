import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const data = await request.json();

    const updateData: Record<string, unknown> = {};
    if (data.exchangeRate !== undefined) updateData.exchangeRate = Number(data.exchangeRate) || 0;
    if (data.pricePerKg !== undefined) updateData.pricePerKg = Number(data.pricePerKg) || 0;
    if (data.chinaAddress !== undefined) updateData.chinaAddress = String(data.chinaAddress ?? "");
    if (data.warehouseAddress !== undefined) updateData.warehouseAddress = String(data.warehouseAddress ?? "");
    if (data.whatsappNumber !== undefined) updateData.whatsappNumber = String(data.whatsappNumber ?? "");
    if (data.instagramLink !== undefined) updateData.instagramLink = String(data.instagramLink ?? "");
    if (data.aboutText !== undefined) updateData.aboutText = String(data.aboutText ?? "");
    if (data.prohibitedItems !== undefined) updateData.prohibitedItems = String(data.prohibitedItems ?? "");
    if (data.instructionText !== undefined) updateData.instructionText = String(data.instructionText ?? "");

    const settings = await prisma.settings.upsert({
      where: { id: "main" },
      update: updateData,
      create: { id: "main", ...updateData },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
