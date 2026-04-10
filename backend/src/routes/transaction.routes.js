const express = require("express")
const router = express.Router()

// ================= CONTROLLER =================
const {
  createTransaction,
  acceptTransaction,
  rejectTransaction,
  getUserTransactions,
  getOrganizerTransactions
} = require("../controllers/transaction.controller")

// ================= MIDDLEWARE =================
const authenticate = require("../middleware/auth.middleware")
const authorize = require("../middleware/role.middleware")

// ================= USER ROUTES =================

// 🔥 Create transaction (customer only)
router.post(
  "/",
  authenticate,
  authorize("CUSTOMER"),
  createTransaction
)

// 🔥 Get my transactions (history user)
router.get(
  "/me",
  authenticate,
  authorize("CUSTOMER"),
  getUserTransactions
)

// ================= ORGANIZER ROUTES =================

// 🔥 Get all transactions (organizer dashboard)
router.get(
  "/organizer",
  authenticate,
  authorize("ORGANIZER"),
  getOrganizerTransactions
)

// 🔥 Accept transaction
router.patch(
  "/:id/accept",
  authenticate,
  authorize("ORGANIZER"),
  acceptTransaction
)

// 🔥 Reject transaction
router.patch(
  "/:id/reject",
  authenticate,
  authorize("ORGANIZER"),
  rejectTransaction
)

// ================= EXPORT =================
module.exports = router