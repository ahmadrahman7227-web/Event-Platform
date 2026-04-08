const express = require("express")
const { register, login, updateProfile } = require("../controllers/auth.controller")
const authMiddleware = require("../middleware/auth.middleware")
const { forgotPassword, resetPassword } = require("../controllers/auth.controller")

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.put("/profile", authMiddleware, updateProfile)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)

module.exports = router