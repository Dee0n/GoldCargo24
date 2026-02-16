import { z } from "zod";

export const loginSchema = z.object({
  phone: z.string().min(10, "Введите номер телефона").max(15),
  password: z.string().min(4, "Минимум 4 символа"),
});

export const registerSchema = z.object({
  phone: z.string().min(10, "Введите номер телефона").max(15),
  password: z.string().min(4, "Минимум 4 символа"),
  name: z.string().min(1, "Введите имя"),
  surname: z.string().optional().or(z.literal("")),
  email: z.string().email("Некорректный email").optional().or(z.literal("")),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
