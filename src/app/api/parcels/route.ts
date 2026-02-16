import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/parcels — get current user's parcels
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const archived = searchParams.get("archived") === "true";

    const parcels = await prisma.parcel.findMany({
      where: { userId, isArchived: archived },
      include: {
        track: {
          include: {
            status: true,
            history: { include: { status: true }, orderBy: { date: "desc" }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ parcels });
  } catch (error) {
    console.error("Get parcels error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// POST /api/parcels — add track number to user's parcels
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { trackNumber } = await request.json();
    if (!trackNumber) {
      return NextResponse.json({ error: "Введите трек-номер" }, { status: 400 });
    }

    const track = await prisma.track.findUnique({ where: { trackNumber: trackNumber.trim() } });
    if (!track) {
      return NextResponse.json({ error: "Трек не найден в системе" }, { status: 404 });
    }

    const existing = await prisma.parcel.findUnique({
      where: { userId_trackId: { userId, trackId: track.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Этот трек уже в ваших посылках" }, { status: 409 });
    }

    const parcel = await prisma.parcel.create({
      data: { userId, trackId: track.id },
      include: { track: { include: { status: true } } },
    });

    return NextResponse.json({ parcel }, { status: 201 });
  } catch (error) {
    console.error("Add parcel error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
