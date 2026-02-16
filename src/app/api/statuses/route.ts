import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const statuses = await prisma.status.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({ statuses });
  } catch (error) {
    console.error("Statuses list error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { name, chineseName, order, color, isFinal } = await request.json();
    if (!name || order === undefined) {
      return NextResponse.json({ error: "Название и порядок обязательны" }, { status: 400 });
    }

    const status = await prisma.status.create({
      data: { name, chineseName: chineseName || null, order, color: color || "#6B7280", isFinal: isFinal || false },
    });

    return NextResponse.json({ status }, { status: 201 });
  } catch (error) {
    console.error("Create status error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
