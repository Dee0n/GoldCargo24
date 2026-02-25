import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createStatusSchema = z.object({
  name: z.string().min(1, "Название обязательно").max(100),
  chineseName: z.string().max(100).nullable().optional(),
  order: z.number().int().positive("Порядок должен быть положительным числом"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Некорректный цвет").optional().default("#6B7280"),
  isFinal: z.boolean().optional().default(false),
});

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

    const body = await request.json();
    const data = createStatusSchema.parse(body);

    const status = await prisma.status.create({
      data: {
        name: data.name,
        chineseName: data.chineseName ?? null,
        order: data.order,
        color: data.color ?? "#6B7280",
        isFinal: data.isFinal ?? false,
      },
    });

    return NextResponse.json({ status }, { status: 201 });
  } catch (error) {
    console.error("Create status error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
