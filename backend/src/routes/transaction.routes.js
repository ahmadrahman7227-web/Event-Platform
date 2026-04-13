const express = require("express")
const router = express.Router()

// ================= CONTROLLER =================
const {
  createTransaction,
  acceptTransaction,
  rejectTransaction,
  getUserTransactions,
  getOrganizerTransactions,
  getEventAttendees,     // 🔥 FIX
  uploadPaymentProof     // 🔥 FIX
} = require("../controllers/transaction.controller")

// ================= MIDDLEWARE =================
const { verifyToken } = require("../middleware/auth.middleware")
const authorize = require("../middleware/role.middleware")
const { uploadSingle } = require("../middleware/upload.middleware") // 🔥 FIX

// ================= USER ROUTES =================

// 🔥 Create transaction
router.post(
  "/",
  verifyToken,
  authorize("CUSTOMER"),
  createTransaction
)

// 🔥 Get my transactions
router.get(
  "/me",
  verifyToken,
  authorize("CUSTOMER"),
  getUserTransactions
)

// ================= ORGANIZER ROUTES =================

// 🔥 Get all transactions
router.get(
  "/organizer",
  verifyToken,
  authorize("ORGANIZER"),
  getOrganizerTransactions
)

// 🔥 Accept transaction
router.patch(
  "/:id/accept",
  verifyToken,
  authorize("ORGANIZER"),
  acceptTransaction
)

// 🔥 Reject transaction
router.patch(
  "/:id/reject",
  verifyToken,
  authorize("ORGANIZER"),
  rejectTransaction
)

// 🔥 Get attendees
router.get(
  "/attendees/:eventId",
  verifyToken,
  authorize("ORGANIZER"),
  getEventAttendees
)

// 🔥 Upload payment proof
router.patch(
  "/:id/upload-proof",
  verifyToken,
  uploadSingle("image"),
  uploadPaymentProof
)

// ================= EXPORT =================
module.exports = router