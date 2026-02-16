import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTrackSchema } from "@/lib/validations/track";

// GET /api/tracks — list all tracks (admin) or user's tracks
export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const statusId = searchParams.get("statusId") || "";
    const sortBy = searchParams.get("sortBy") || "updatedAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

    const where: Record<string, unknown> = {};
    if (search) {
      where.trackNumber = { contains: search, mode: "insensitive" };
    }
    if (statusId) {
      where.statusId = statusId;
    }

    const [tracks, total] = await Promise.all([
      prisma.track.findMany({
        where,
        include: {
          status: true,
          batch: true,
          parcels: { include: { user: { select: { id: true, name: true, surname: true, phone: true, clientCode: true } } } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.track.count({ where }),
    ]);

    return NextResponse.json({
      tracks,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Tracks list error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// POST /api/tracks — create track (admin)
export async function POST(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const data = createTrackSchema.parse(body);

    const existing = await prisma.track.findUnique({ where: { trackNumber: data.trackNumber } });
    if (existing) {
      return NextResponse.json({ error: "Трек с таким номером уже существует" }, { status: 409 });
    }

    const track = await prisma.track.create({
      data: {
        trackNumber: data.trackNumber,
        statusId: data.statusId,
        batchId: data.batchId || null,
        weight: data.weight || null,
        description: data.description || null,
      },
      include: { status: true, batch: true },
    });

    await prisma.trackHistory.create({
      data: { trackId: track.id, statusId: data.statusId },
    });

    return NextResponse.json({ track }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Проверьте данные" }, { status: 400 });
    }
    console.error("Create track error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// DELETE /api/tracks — bulk delete (admin)
export async function DELETE(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { trackIds } = body;

    if (!trackIds?.length) {
      return NextResponse.json({ error: "No track IDs" }, { status: 400 });
    }

    await prisma.track.deleteMany({ where: { id: { in: trackIds } } });

    return NextResponse.json({ deleted: trackIds.length });
  } catch (error) {
    console.error("Bulk delete error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// PATCH /api/tracks — bulk status update (admin)
export async function PATCH(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { trackIds, statusId } = body;

    if (!trackIds?.length || !statusId) {
      return NextResponse.json({ error: "Missing trackIds or statusId" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.track.updateMany({
        where: { id: { in: trackIds } },
        data: { statusId },
      });
      // Add history entries
      const historyData = trackIds.map((trackId: string) => ({
        trackId,
        statusId,
      }));
      await tx.trackHistory.createMany({ data: historyData });
    });

    return NextResponse.json({ updated: trackIds.length });
  } catch (error) {
    console.error("Bulk update error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
