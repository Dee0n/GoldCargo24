import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

// Chinese header mappings
const HEADER_MAP: Record<string, string> = {
  "快递单号": "trackNumber",
  "总单号": "batchNumber",
  "客户姓名": "clientCode",
  "添加时间": "addedDate",
  "更新时间": "updatedDate",
  "状态": "status",
};

interface XlsxRow {
  trackNumber: string;
  batchNumber: string;
  clientCode: string;
  addedDate: string;
  updatedDate: string;
  status: string;
}

interface ImportResult {
  created: number;
  updated: number;
  errors: string[];
  total: number;
}

export async function importXlsx(buffer: Buffer): Promise<ImportResult> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { raw: false });

  // Map Chinese headers to English
  const rows: XlsxRow[] = rawRows.map((row) => {
    const mapped: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      const englishKey = HEADER_MAP[key.trim()] || key;
      mapped[englishKey] = String(value || "").trim();
    }
    return mapped as unknown as XlsxRow;
  });

  // Load all statuses for Chinese name mapping
  const statuses = await prisma.status.findMany();
  type StatusRecord = (typeof statuses)[0];
  const statusByChineseName = new Map<string, StatusRecord>(
    statuses.filter((s: StatusRecord) => s.chineseName).map((s: StatusRecord) => [s.chineseName!, s])
  );
  const defaultStatus = statuses.find((s: StatusRecord) => s.order === 1);

  if (!defaultStatus) {
    return { created: 0, updated: 0, errors: ["No default status found. Please create statuses first."], total: 0 };
  }

  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  // Process in batches
  const BATCH_SIZE = 50;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    await prisma.$transaction(async (tx) => {
      for (const row of batch) {
        try {
          if (!row.trackNumber) {
            errors.push(`Row ${i + batch.indexOf(row) + 2}: missing track number`);
            continue;
          }

          // Resolve status from Chinese name
          const resolvedStatus = row.status
            ? statusByChineseName.get(row.status) || defaultStatus
            : defaultStatus;

          // Upsert batch
          let batchRecord = null;
          if (row.batchNumber) {
            batchRecord = await tx.batch.upsert({
              where: { batchNumber: row.batchNumber },
              update: {},
              create: { batchNumber: row.batchNumber },
            });
          }

          // Check if track exists
          const existingTrack = await tx.track.findUnique({
            where: { trackNumber: row.trackNumber },
          });

          if (existingTrack) {
            // Only update if status changed
            if (existingTrack.statusId !== resolvedStatus.id) {
              await tx.track.update({
                where: { id: existingTrack.id },
                data: {
                  statusId: resolvedStatus.id,
                  batchId: batchRecord?.id || existingTrack.batchId,
                },
              });
              await tx.trackHistory.create({
                data: {
                  trackId: existingTrack.id,
                  statusId: resolvedStatus.id,
                  date: row.updatedDate ? new Date(row.updatedDate) : new Date(),
                },
              });
            }
            updated++;
          } else {
            // Create new track
            const newTrack = await tx.track.create({
              data: {
                trackNumber: row.trackNumber,
                statusId: resolvedStatus.id,
                batchId: batchRecord?.id,
              },
            });
            await tx.trackHistory.create({
              data: {
                trackId: newTrack.id,
                statusId: resolvedStatus.id,
                date: row.addedDate ? new Date(row.addedDate) : new Date(),
              },
            });
            created++;
          }

          // Auto-link to user by clientCode
          if (row.clientCode) {
            const user = await tx.user.findUnique({
              where: { clientCode: row.clientCode },
            });
            if (user) {
              const track = await tx.track.findUnique({ where: { trackNumber: row.trackNumber } });
              if (track) {
                await tx.parcel.upsert({
                  where: { userId_trackId: { userId: user.id, trackId: track.id } },
                  update: {},
                  create: { userId: user.id, trackId: track.id },
                });
              }
            }
          }
        } catch (e) {
          errors.push(`Row ${i + batch.indexOf(row) + 2}: ${(e as Error).message}`);
        }
      }
    });
  }

  return { created, updated, errors, total: rows.length };
}
