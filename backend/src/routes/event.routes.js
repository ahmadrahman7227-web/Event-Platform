const express = require("express")
const router = express.Router()

// ================= CONTROLLER =================
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent
} = require("../controllers/event.controller")

// ================= MIDDLEWARE =================
const { verifyToken } = require("../middleware/auth.middleware")
const authorize = require("../middleware/role.middleware")
const { uploadSingle } = require("../middleware/upload.middleware")

// ================= PUBLIC =================
router.get("/", getEvents)
router.get("/:id", getEventById)

// ================= ORGANIZER =================
router.post(
  "/",
  verifyToken,
  authorize("ORGANIZER"),
  uploadSingle("image"), // 🔥 TAMBAHAN
  createEvent
)

router.patch(
  "/:id",
  verifyToken,
  authorize("ORGANIZER"),
  uploadSingle("image"), // 🔥 TAMBAHAN
  updateEvent
)

router.delete(
  "/:id",
  verifyToken,
  authorize("ORGANIZER"),
  deleteEvent
)

module.exports = router