const { z } = require("zod")

// ================= COMMON =================
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Email tidak valid")
  .max(100, "Email terlalu panjang")

const passwordSchema = z
  .string()
  .min(8, "Minimal 8 karakter")
  .max(100, "Password terlalu panjang")
  .regex(/[A-Z]/, "Harus ada huruf besar")
  .regex(/[a-z]/, "Harus ada huruf kecil")
  .regex(/[0-9]/, "Harus ada angka")
  .regex(/[!@#$%^&*]/, "Harus ada simbol (!@#$%^&*)")
  .refine((val) => !/\s/.test(val), {
    message: "Password tidak boleh mengandung spasi"
  })

const referralSchema = z
  .string()
  .trim()
  .min(4, "Referral terlalu pendek")
  .max(10, "Referral terlalu panjang")
  .regex(/^[A-Za-z0-9]+$/, "Referral hanya boleh huruf & angka")
  .optional()

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