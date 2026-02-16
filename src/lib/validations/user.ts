import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  surname: z.string().min(1).optional(),
  phone: z.string().min(10).max(15).optional(),
  email: z.string().email().nullable().optional(),
  role: z.enum(["CLIENT", "ADMIN"]).optional(),
  clientCode: z.string().nullable().optional(),
  isBlocked: z.boolean().optional(),
  password: z.string().min(4).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  surname: z.string().optional(),
  email: z.string().email().nullable().optional().or(z.literal("")),
  phone: z.string().min(10).max(15).optional(),
  password: z.string().min(4).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
