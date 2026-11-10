import z from "zod";

export const loginSchema = z.object({
  username: z.string().min(5, "Masukkan username dengan benar!"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

