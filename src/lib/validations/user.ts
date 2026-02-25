import { z } from "zod";

export const createUserSchema = z.object({
  phone: z.string().min(10, "Введите номер телефона").max(15),
  password: z.string().min(8, "Минимум 8 символов"),
  name: z.string().min(1, "Введите имя").max(100),
  surname: z.string().max(100).optional().or(z.literal("")),
  email: z.string().email("Некорректный email").optional().or(z.literal("")),
  role: z.enum(["CLIENT", "ADMIN"]).optional().default("CLIENT"),
  clientCode: z.string().max(50).nullable().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  surname: z.string().min(1).max(100).optional(),
  phone: z.string().min(10).max(15).optional(),
  email: z.string().email().nullable().optional(),
  role: z.enum(["CLIENT", "ADMIN"]).optional(),
  clientCode: z.string().max(50).nullable().optional(),
  isBlocked: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  surname: z.string().optional(),
  email: z.string().email().nullable().optional().or(z.literal("")),
  phone: z.string().min(10).max(15).optional(),
  password: z.string().min(8).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
