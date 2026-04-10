const express = require("express")
const router = express.Router()

// ================= CONTROLLERS =================
const {
  register,
  login,
  updateProfile,
  forgotPassword,
  resetPassword,
  getProfile,
  changePassword,
  uploadProfile
} = require("../controllers/auth.controller")

// ================= MIDDLEWARE =================
const authenticate = require("../middleware/auth.middleware")
const authorize = require("../middleware/role.middleware")
const { uploadSingle } = require("../middleware/upload.middleware")

// 🔥 RATE LIMIT (KHUSUS LOGIN SAJA)
const rateLimit = require("express-rate-limit")

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts, please try again later"
  },
  standardHeaders: true,
  legacyHeaders: false
})

// ================= AUTH =================

// ✅ REGISTER (TIDAK kena limiter)
router.post("/register", register)

// 🔐 LOGIN (KENA limiter)
router.post("/login", loginLimiter, login)

// ================= PROFILE =================

router.get("/profile", authenticate, getProfile)

router.patch("/profile", authenticate, updateProfile)

// ================= PASSWORD =================

router.patch("/change-password", authenticate, changePassword)

// ================= RESET PASSWORD =================

router.post("/forgot-password", forgotPassword)

router.post("/reset-password", resetPassword)

// ================= UPLOAD PROFILE =================

router.patch(
  "/upload-profile",
  authenticate,
  uploadSingle("image"),
  uploadProfile
)

// ================= ROLE BASED ACCESS =================

router.get(
  "/organizer-only",
  authenticate,
  authorize("ORGANIZER"),
  (req, res) => {
    res.json({
      success: true,
      message: "Organizer access granted"
    })
  }
)

module.exports = router