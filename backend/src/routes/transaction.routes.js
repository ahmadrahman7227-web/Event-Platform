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
const { verifyToken } = require("../middleware/auth.middleware")
const authorize = require("../middleware/role.middleware")

// ================= USER ROUTES =================

// 🔥 Create transaction (customer only)
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

// ================= EXPORT =================
module.exports = router