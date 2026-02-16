import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json({ error: "Введите трек-номер" }, { status: 400 });
    }

    const track = await prisma.track.findUnique({
      where: { trackNumber: q },
      include: {
        status: true,
        history: { include: { status: true }, orderBy: { date: "asc" } },
      },
    });

    if (!track) {
      return NextResponse.json({ found: false, message: "Трек не найден" });
    }

    return NextResponse.json({
      found: true,
      track: {
        trackNumber: track.trackNumber,
        status: track.status,
        weight: track.weight,
        history: track.history,
        createdAt: track.createdAt,
        updatedAt: track.updatedAt,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
