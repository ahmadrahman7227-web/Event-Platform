const express = require("express")
const router = express.Router()

// ================= CONTROLLER =================
const {
  getDashboardStats,
  getAttendees,
  getChartData
} = require("../controllers/dashboard.controller")

// ================= MIDDLEWARE =================
const { verifyToken } = require("../middleware/auth.middleware")
const authorize = require("../middleware/role.middleware")

// ================= DASHBOARD =================

// 📊 Stats
router.get(
  "/stats",
  verifyToken,
  authorize("ORGANIZER"),
  getDashboardStats
)

// 👥 Attendees per event
router.get(
  "/attendees/:eventId",
  verifyToken,
  authorize("ORGANIZER"),
  getAttendees
)

// 📈 Chart data
router.get(
  "/charts",
  verifyToken,
  authorize("ORGANIZER"),
  getChartData
)

module.exports = router