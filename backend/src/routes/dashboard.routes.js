const express = require("express")
const router = express.Router()

const {
  getDashboardStats,
  getAttendees,
  getChartData
} = require("../controllers/dashboard.controller")

const authenticate = require("../middleware/auth.middleware")
const authorize = require("../middleware/role.middleware")

// ================= DASHBOARD =================

// 📊 Stats
router.get(
  "/stats",
  authenticate,
  authorize("ORGANIZER"),
  getDashboardStats
)

// 👥 Attendees per event
router.get(
  "/attendees/:eventId",
  authenticate,
  authorize("ORGANIZER"),
  getAttendees
)

// 📈 Chart data
router.get(
  "/charts",
  authenticate,
  authorize("ORGANIZER"),
  getChartData
)

module.exports = router