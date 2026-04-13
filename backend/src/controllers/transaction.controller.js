// ================= IMPORT =================
const prisma = require("../prisma/client")

const {
  createTransactionService,
  acceptTransactionService,
  rejectTransactionService
} = require("../services/transaction.service")

const { sendEmail } = require("../utils/mailer")

// ================= HELPER =================
const sendEmailAsync = async (email, subject, html) => {
  try {
    if (!email) return
    await sendEmail(email, subject, html)
  } catch (err) {
    console.error("📧 Email failed:", err.message)
  }
}

// ================= EMAIL TEMPLATE =================
const emailTemplate = (title, trx, extra = "") => {
  return `
    <div style="font-family:sans-serif; padding:20px">
      <h2 style="color:purple">${title}</h2>

      <p><b>Event:</b> ${trx.event?.title}</p>
      <p><b>Tickets:</b> ${trx.quantity}</p>
      <p><b>Total:</b> Rp ${trx.totalPrice}</p>
      <p><b>Status:</b> ${trx.status}</p>

      ${extra}

      <hr />
      <p style="font-size:12px;color:gray">
        Event Platform © ${new Date().getFullYear()}
      </p>
    </div>
  `
}

// ================= CREATE =================
exports.createTransaction = async (req, res, next) => {
  try {
    const transaction = await createTransactionService(
      req.body,
      req.user.id
    )

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction
    })
  } catch (err) {
    next(err)
  }
}

// ================= ACCEPT =================
exports.acceptTransaction = async (req, res, next) => {
  try {
    const trx = await acceptTransactionService(
      req.params.id,
      req.user.id
    )

    sendEmailAsync(
      trx.user?.email,
      "Payment Accepted 🎉",
      emailTemplate("Transaction Accepted 🎉", trx)
    )

    res.json({
      success: true,
      message: "Transaction accepted successfully",
      data: trx
    })
  } catch (err) {
    next(err)
  }
}

// ================= REJECT =================
exports.rejectTransaction = async (req, res, next) => {
  try {
    const trx = await rejectTransactionService(
      req.params.id,
      req.user.id
    )

    sendEmailAsync(
      trx.user?.email,
      "Payment Rejected ❌",
      emailTemplate(
        "Transaction Rejected ❌",
        trx,
        `<p>Your points / coupon have been restored.</p>`
      )
    )

    res.json({
      success: true,
      message: "Transaction rejected successfully",
      data: trx
    })
  } catch (err) {
    next(err)
  }
}

// ================= USER =================
exports.getUserTransactions = async (req, res, next) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      include: { event: true, coupon: true },
      orderBy: { createdAt: "desc" }
    })

    res.json({ success: true, data: transactions })
  } catch (err) {
    next(err)
  }
}

// ================= ORGANIZER =================
exports.getOrganizerTransactions = async (req, res, next) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        event: { organizerId: req.user.id }
      },
      include: {
        user: true,
        event: true,
        coupon: true
      },
      orderBy: { createdAt: "desc" }
    })

    res.json({ success: true, data: transactions })
  } catch (err) {
    next(err)
  }
}

// ================= ATTENDEES =================
exports.getEventAttendees = async (req, res, next) => {
  try {
    const { eventId } = req.params

    const attendees = await prisma.transaction.findMany({
      where: {
        eventId,
        status: "ACCEPTED"
      },
      include: {
        user: true
      }
    })

    res.json({
      success: true,
      data: attendees
    })
  } catch (err) {
    next(err)
  }
}

// ================= UPLOAD PROOF =================
exports.uploadPaymentProof = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      })
    }

    const trx = await prisma.transaction.update({
      where: { id },
      data: {
        paymentProof: req.file.path,
        paymentProofId: req.file.filename
      }
    })

    res.json({
      success: true,
      message: "Payment proof uploaded",
      data: trx
    })
  } catch (err) {
    next(err)
  }
}