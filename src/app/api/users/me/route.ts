import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validations/user";
import { hashPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, phone: true, name: true, surname: true, email: true, role: true, clientCode: true, createdAt: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.surname !== undefined) updateData.surname = data.surname;
    if (data.email !== undefined) updateData.email = data.email || null;

    if (data.phone) {
      const existing = await prisma.user.findUnique({ where: { phone: data.phone } });
      if (existing && existing.id !== userId) {
        return NextResponse.json({ error: "Этот номер уже используется другим пользователем" }, { status: 409 });
      }
      updateData.phone = data.phone;
    }

    if (data.password) {
      updateData.password = await hashPassword(data.password);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, phone: true, name: true, surname: true, email: true, role: true, clientCode: true, createdAt: true },
    });

    if (data.phone) {
      const tokenPayload = { userId: user.id, role: user.role, phone: user.phone };
      const accessToken = await signAccessToken(tokenPayload);
      const refreshToken = await signRefreshToken(tokenPayload);

      const response = NextResponse.json({ user });
      response.cookies.set("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
      response.cookies.set("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60,
        path: "/",
      });
      return response;
    }

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Проверьте данные" }, { status: 400 });
    }
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
