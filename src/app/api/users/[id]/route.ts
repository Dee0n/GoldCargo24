import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateUserSchema } from "@/lib/validations/user";
import { hashPassword } from "@/lib/auth/password";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, phone: true, name: true, surname: true, email: true,
        role: true, clientCode: true, isBlocked: true, createdAt: true,
        parcels: {
          include: { track: { include: { status: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const data = updateUserSchema.parse(body);

    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.surname) updateData.surname = data.surname;
    if (data.phone) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role) updateData.role = data.role;
    if (data.clientCode !== undefined) updateData.clientCode = data.clientCode;
    if (data.isBlocked !== undefined) updateData.isBlocked = data.isBlocked;
    if (data.password) updateData.password = await hashPassword(data.password);

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true, phone: true, name: true, surname: true, email: true,
        role: true, clientCode: true, isBlocked: true, createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Проверьте данные" }, { status: 400 });
    }
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
