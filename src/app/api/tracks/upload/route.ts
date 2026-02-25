import { NextRequest, NextResponse } from "next/server";
import { importXlsx } from "@/lib/xlsx/importer";

export async function POST(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Файл не загружен" }, { status: 400 });
    }

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return NextResponse.json({ error: "Поддерживаются только файлы .xlsx и .xls" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Файл слишком большой. Максимальный размер — 200 МБ" }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await importXlsx(buffer);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Ошибка загрузки файла" }, { status: 500 });
  }
}
