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
const { verifyToken } = require("../middleware/auth.middleware")
const authorize = require("../middleware/role.middleware")
const { uploadSingle } = require("../middleware/upload.middleware")

// ================= RATE LIMIT =================
const rateLimit = require("express-rate-limit")

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 🔥 jangan terlalu kecil
  message: {
    success: false,
    message: "Too many login attempts, please try again later"
  }
})

// ================= AUTH =================
router.post("/register", register)
router.post("/login", loginLimiter, login)

// ================= PROFILE =================
router.get("/profile", verifyToken, getProfile)
router.patch("/profile", verifyToken, updateProfile)

// ================= PASSWORD =================
router.patch("/change-password", verifyToken, changePassword)

// ================= RESET PASSWORD =================
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)

// ================= UPLOAD PROFILE =================
router.patch(
  "/upload-profile",
  verifyToken,
  uploadSingle("image"),
  uploadProfile
)

// ================= ROLE =================
router.get(
  "/organizer",
  verifyToken,
  authorize("ORGANIZER"),
  (req, res) => {
    res.json({
      success: true,
      message: "Organizer access granted"
    })
  }
)

module.exports = router