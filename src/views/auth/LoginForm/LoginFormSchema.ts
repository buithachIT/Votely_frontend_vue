import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email không được để trống' })
    .email({ message: 'Địa chỉ email không đúng định dạng' }),
  password: z
    .string()
    .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    .max(20, { message: 'Mật khẩu không được quá 20 ký tự' }),
});
export type LoginInput = z.infer<typeof loginSchema>;
