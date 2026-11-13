import z from "zod";

export const loginSchema = z.object({
  email: z.email().min(8, "Masukkan email dengan benar!"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const signUpSchema = z.object({
  full_name: z.string().min(3, "Nama lengkap minimal 3 karakter").regex(/^[a-zA-Z\s]+$/, "Nama lengkap hanya boleh mengandung huruf dan spasi"),
  user_name: z.string().min(3, "Username minimal 3 karakter").regex(/^[a-zA-Z]+$/, "Username hanya boleh mengandung huruf"),
  email: z.email().min(8, "Masukkan email dengan benar!"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

