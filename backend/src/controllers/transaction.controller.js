// ================= IMPORT =================
const {
  createTransactionService,
  acceptTransactionService,
  rejectTransactionService
} = require("../services/transaction.service")

const { sendEmail } = require("../utils/mailer")

// ================= HELPER (NON-BLOCKING EMAIL) =================
const sendEmailAsync = async (email, subject, text) => {
  try {
    await sendEmail(email, subject, text)
  } catch (err) {
    console.error("Email failed:", err.message)
  }
}

// ================= CREATE TRANSACTION =================
exports.createTransaction = async (req, res, next) => {
  try {
    const transaction = await createTransactionService(
      req.body,
      req.user.id
    )

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction
    })
  } catch (err) {
    next(err)
  }
}

// ================= ACCEPT TRANSACTION =================
exports.acceptTransaction = async (req, res, next) => {
  try {
    const trx = await acceptTransactionService(
      req.params.id,
      req.user.id
    )

    // 🔥 NON-BLOCKING EMAIL
    sendEmailAsync(
      trx.user.email,
      "Payment Accepted ✅",
      `Your transaction for event has been accepted. Enjoy the event!`
    )

    return res.json({
      success: true,
      message: "Transaction accepted successfully",
      data: trx
    })
  } catch (err) {
    next(err)
  }
}

// ================= REJECT TRANSACTION =================
exports.rejectTransaction = async (req, res, next) => {
  try {
    const trx = await rejectTransactionService(
      req.params.id,
      req.user.id
    )

    // 🔥 NON-BLOCKING EMAIL
    sendEmailAsync(
      trx.user.email,
      "Payment Rejected ❌",
      `Your transaction has been rejected. Points/coupon have been restored.`
    )

    return res.json({
      success: true,
      message: "Transaction rejected successfully",
      data: trx
    })
  } catch (err) {
    next(err)
  }
}

// ================= GET USER TRANSACTIONS =================
exports.getUserTransactions = async (req, res, next) => {
  try {
    const transactions = await require("../prisma/client").transaction.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        event: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return res.json({
      success: true,
      data: transactions
    })
  } catch (err) {
    next(err)
  }
}

// ================= GET ORGANIZER TRANSACTIONS =================
exports.getOrganizerTransactions = async (req, res, next) => {
  try {
    const transactions = await require("../prisma/client").transaction.findMany({
      where: {
        event: {
          organizerId: req.user.id
        }
      },
      include: {
        user: true,
        event: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return res.json({
      success: true,
      data: transactions
    })
  } catch (err) {
    next(err)
  }
}