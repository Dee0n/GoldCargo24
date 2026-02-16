import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/statuses/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const data = await request.json();

    const status = await prisma.status.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.chineseName !== undefined && { chineseName: data.chineseName }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.color && { color: data.color }),
        ...(data.isFinal !== undefined && { isFinal: data.isFinal }),
      },
    });

    return NextResponse.json({ status });
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// DELETE /api/statuses/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;

    // Check if any tracks use this status
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
