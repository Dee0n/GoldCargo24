import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/parcels/[id] — archive/unarchive parcel
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { isArchived } = await request.json();

    const parcel = await prisma.parcel.findFirst({ where: { id, userId } });
    if (!parcel) {
      return NextResponse.json({ error: "Посылка не найдена" }, { status: 404 });
    }

    const updated = await prisma.parcel.update({
      where: { id },
      data: { isArchived },
    });

    return NextResponse.json({ parcel: updated });
  } catch (error) {
    console.error("Archive parcel error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// DELETE /api/parcels/[id] — remove from user's parcels
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const parcel = await prisma.parcel.findFirst({ where: { id, userId } });
    if (!parcel) {
      return NextResponse.json({ error: "Посылка не найдена" }, { status: 404 });
    }

    await prisma.parcel.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete parcel error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
