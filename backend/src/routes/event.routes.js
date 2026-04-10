const express = require("express")
const router = express.Router()

const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent
} = require("../controllers/event.controller")

const authenticate = require("../middleware/auth.middleware")
const authorize = require("../middleware/role.middleware")

// PUBLIC
router.get("/", getEvents)
router.get("/:id", getEventById)

// ORGANIZER ONLY
router.post("/", authenticate, authorize("ORGANIZER"), createEvent)
router.patch("/:id", authenticate, authorize("ORGANIZER"), updateEvent)
router.delete("/:id", authenticate, authorize("ORGANIZER"), deleteEvent)

module.exports = router