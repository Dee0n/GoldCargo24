import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateStatusSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  chineseName: z.string().max(100).nullable().optional(),
  order: z.number().int().positive().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  isFinal: z.boolean().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const data = updateStatusSchema.parse(body);

    const status = await prisma.status.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.chineseName !== undefined && { chineseName: data.chineseName }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.isFinal !== undefined && { isFinal: data.isFinal }),
      },
    });

    return NextResponse.json({ status });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Проверьте данные" }, { status: 400 });
    }
    console.error("Update status error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;

    const trackCount = await prisma.track.count({ where: { statusId: id } });
    if (trackCount > 0) {
      return NextResponse.json({ error: `Нельзя удалить: ${trackCount} треков используют этот статус` }, { status: 409 });
    }

    await prisma.status.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete status error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
