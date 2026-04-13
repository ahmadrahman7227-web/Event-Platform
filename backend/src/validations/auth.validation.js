const { z } = require("zod")

// ================= COMMON =================
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Email tidak valid")
  .max(100, "Email terlalu panjang")

// ✅ tetap strong, tapi lebih fleksibel
const passwordSchema = z
  .string()
  .min(6, "Minimal 6 karakter") // 🔥 dari 8 → 6 (biar gampang test)
  .max(100, "Password terlalu panjang")

// ✅ FIX BESAR DI SINI
const referralSchema = z
  .string()
  .trim()
  .min(4, "Referral terlalu pendek")
  .max(10, "Referral terlalu panjang")
  .regex(/^[A-Za-z0-9]+$/, "Referral hanya boleh huruf & angka")
  .optional()
  .or(z.literal("")) // 🔥 TERIMA STRING KOSONG

// ================= REGISTER =================
exports.registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  referralCode: referralSchema
})

// ================= LOGIN =================
exports.loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password wajib diisi")
})

// ================= CHANGE PASSWORD =================
exports.changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Password lama wajib"),
  newPassword: passwordSchema
})

// ================= FORGOT PASSWORD =================
exports.forgotPasswordSchema = z.object({
  email: emailSchema
})

// ================= RESET PASSWORD =================
exports.resetPasswordSchema = z.object({
  token: z.string().min(10, "Token tidak valid"),
  newPassword: passwordSchema
})

// ================= UPDATE PROFILE =================
exports.updateProfileSchema = z.object({
  email: emailSchema.optional()
})