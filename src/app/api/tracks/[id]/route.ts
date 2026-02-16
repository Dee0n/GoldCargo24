import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateTrackSchema } from "@/lib/validations/track";

// GET /api/tracks/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const track = await prisma.track.findUnique({
      where: { id },
      include: {
        status: true,
        batch: true,
        history: { include: { status: true }, orderBy: { date: "asc" } },
        parcels: { include: { user: { select: { id: true, name: true, surname: true, phone: true, clientCode: true } } } },
      },
    });

    if (!track) {
      return NextResponse.json({ error: "Трек не найден" }, { status: 404 });
    }

    return NextResponse.json({ track });
  } catch (error) {
    console.error("Get track error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// PUT /api/tracks/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateTrackSchema.parse(body);

    const existing = await prisma.track.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Трек не найден" }, { status: 404 });
    }

    // If status changed, add history
    if (data.statusId && data.statusId !== existing.statusId) {
      await prisma.trackHistory.create({
        data: { trackId: id, statusId: data.statusId },
      });
    }

    const track = await prisma.track.update({
      where: { id },
      data: {
        ...(data.trackNumber && { trackNumber: data.trackNumber }),
        ...(data.statusId && { statusId: data.statusId }),
        ...(data.batchId !== undefined && { batchId: data.batchId }),
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: { status: true, batch: true },
    });

    return NextResponse.json({ track });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Проверьте данные" }, { status: 400 });
    }
    console.error("Update track error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// DELETE /api/tracks/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.track.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete track error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
