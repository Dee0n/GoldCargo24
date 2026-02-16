import { z } from "zod";

export const createTrackSchema = z.object({
  trackNumber: z.string().min(1, "Введите трек-номер"),
  statusId: z.string().min(1, "Выберите статус"),
  batchId: z.string().optional(),
  weight: z.number().positive().optional(),
  description: z.string().optional(),
});

export const updateTrackSchema = z.object({
  trackNumber: z.string().min(1).optional(),
  statusId: z.string().min(1).optional(),
  batchId: z.string().nullable().optional(),
  weight: z.number().positive().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const bulkStatusUpdateSchema = z.object({
  trackIds: z.array(z.string()).min(1),
  statusId: z.string().min(1),
});

export const bulkDeleteSchema = z.object({
  trackIds: z.array(z.string()).min(1),
});

export type CreateTrackInput = z.infer<typeof createTrackSchema>;
export type UpdateTrackInput = z.infer<typeof updateTrackSchema>;
