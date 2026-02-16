import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/stats — admin dashboard stats
export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const [totalUsers, totalTracks, totalParcels, statuses, recentTracks, tracksByStatus] = await Promise.all([
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.track.count(),
      prisma.parcel.count(),
      prisma.status.findMany({ orderBy: { order: "asc" } }),
      prisma.track.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { status: true },
      }),
      prisma.track.groupBy({
        by: ["statusId"],
        _count: { id: true },
      }),
    ]);

    const statusCounts = tracksByStatus.map((item: { statusId: string; _count: { id: number } }) => {
      const status = statuses.find((s: { id: string; name: string; color: string }) => s.id === item.statusId);
      return {
        statusId: item.statusId,
        statusName: status?.name || "Unknown",
        color: status?.color || "#6B7280",
        count: item._count.id,
      };
    });

    return NextResponse.json({
      totalUsers,
      totalTracks,
      totalParcels,
      statusCounts,
      recentTracks,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
