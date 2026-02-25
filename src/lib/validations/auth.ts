import { z } from "zod";

export const loginSchema = z.object({
  phone: z.string().min(10, "Введите номер телефона").max(15),
  password: z.string().min(1, "Введите пароль"),
});

export const registerSchema = z.object({
  phone: z.string().min(10, "Введите номер телефона").max(15),
  password: z.string().min(8, "Минимум 8 символов"),
  name: z.string().min(1, "Введите имя").max(100),
  surname: z.string().max(100).optional().or(z.literal("")),
  email: z.string().email("Некорректный email").optional().or(z.literal("")),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
