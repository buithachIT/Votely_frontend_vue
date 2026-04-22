import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "Họ phải từ 2 ký tự"),
    lastName: z.string().min(2, "Tên phải từ 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    phone: z.string().regex(/^(0\d{9}|\+84\s?\d{9})$/, "Số điện thoại phải bắt đầu bằng 0 hoặc +84 và có 10 chữ số"),
    password: z.string().min(6, "Mật khẩu phải từ 6 ký tự"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: "Bạn phải đồng ý với Điều khoản & Điều kiện",
    }),
    marketing_emails: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
