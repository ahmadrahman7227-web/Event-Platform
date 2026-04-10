const prisma = require("../prisma/client")

exports.createTransactionService = async (data, userId) => {
  const { eventId, quantity, couponCode, usePoints } = data

  // ================= VALIDATION =================
  if (!quantity || quantity <= 0) {
    const err = new Error("Invalid quantity")
    err.status = 400
    throw err
  }

  return await prisma.$transaction(async (tx) => {

    // ================= GET EVENT =================
    const event = await tx.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      const err = new Error("Event not found")
      err.status = 404
      throw err
    }

    // ❗ event sudah lewat
    if (new Date(event.endDate) < new Date()) {
      const err = new Error("Event already ended")
      err.status = 400
      throw err
    }

    // ================= LOCK SEAT (ANTI RACE CONDITION) =================
    const updatedEvent = await tx.event.update({
      where: {
        id: eventId,
        availableSeats: {
          gte: quantity
        }
      },
      data: {
        availableSeats: {
          decrement: quantity
        }
      }
    }).catch(() => null)

    if (!updatedEvent) {
      const err = new Error("Not enough seats")
      err.status = 400
      throw err
    }

    // ================= BASE PRICE =================
    let totalPrice = event.price * quantity
    let coupon = null

    // ================= APPLY COUPON =================
    if (couponCode) {
      coupon = await tx.coupon.findFirst({
        where: {
          code: couponCode,
          userId,
          isUsed: false,
          expiresAt: {
            gt: new Date()
          }
        }
      })

      if (!coupon) {
        const err = new Error("Invalid or expired coupon")
        err.status = 400
        throw err
      }

      totalPrice -= (totalPrice * coupon.discount) / 100
    }

    // ================= APPLY POINTS =================
    let usedPoints = 0

    if (usePoints) {
      const points = await tx.pointHistory.aggregate({
        _sum: { amount: true },
        where: {
          userId,
          expiresAt: {
            gt: new Date()
          },
          amount: {
            gt: 0
          }
        }
      })

      const availablePoints = points._sum.amount || 0

      usedPoints = Math.min(availablePoints, totalPrice)
      totalPrice -= usedPoints
    }

    if (totalPrice < 0) totalPrice = 0

    // ================= CREATE TRANSACTION =================
    const transaction = await tx.transaction.create({
      data: {
        userId,
        eventId,
        quantity,
        totalPrice,
        usedPoints,
        couponId: coupon?.id || null
      }
    })

    // ================= MARK COUPON =================
    if (coupon) {
      await tx.coupon.update({
        where: { id: coupon.id },
        data: { isUsed: true }
      })
    }

    // ================= REDUCE POINTS (FIFO) =================
    if (usedPoints > 0) {
      const histories = await tx.pointHistory.findMany({
        where: {
          userId,
          expiresAt: {
            gt: new Date()
          },
          amount: {
            gt: 0
          }
        },
        orderBy: { createdAt: "asc" }
      })

      let remaining = usedPoints

      for (const h of histories) {
        if (remaining <= 0) break

        if (h.amount <= remaining) {
          remaining -= h.amount

          await tx.pointHistory.update({
            where: { id: h.id },
            data: { amount: 0 }
          })
        } else {
          await tx.pointHistory.update({
            where: { id: h.id },
            data: {
              amount: h.amount - remaining
            }
          })
          remaining = 0
        }
      }
    }

    return transaction
  })
}


// ================= ACCEPT TRANSACTION (ORGANIZER) =================
exports.acceptTransactionService = async (transactionId, organizerId) => {
  return await prisma.$transaction(async (tx) => {

    const trx = await tx.transaction.findUnique({
      where: { id: transactionId },
      include: { event: true, user: true }
    })

    if (!trx) {
      const err = new Error("Transaction not found")
      err.status = 404
      throw err
    }

    if (trx.event.organizerId !== organizerId) {
      const err = new Error("Forbidden")
      err.status = 403
      throw err
    }

    if (trx.status !== "PENDING") {
      const err = new Error("Transaction already processed")
      err.status = 400
      throw err
    }

    const updated = await tx.transaction.update({
      where: { id: transactionId },
      data: { status: "ACCEPTED" }
    })

    return updated
  })
}


// ================= REJECT TRANSACTION (ORGANIZER) =================
exports.rejectTransactionService = async (transactionId, organizerId) => {
  return await prisma.$transaction(async (tx) => {

    const trx = await tx.transaction.findUnique({
      where: { id: transactionId },
      include: { event: true, user: true }
    })

    if (!trx) {
      const err = new Error("Transaction not found")
      err.status = 404
      throw err
    }

    if (trx.event.organizerId !== organizerId) {
      const err = new Error("Forbidden")
      err.status = 403
      throw err
    }

    if (trx.status !== "PENDING") {
      const err = new Error("Transaction already processed")
      err.status = 400
      throw err
    }

    // ================= RESTORE SEAT =================
    await tx.event.update({
      where: { id: trx.eventId },
      data: {
        availableSeats: {
          increment: trx.quantity
        }
      }
    })

    // ================= RESTORE COUPON =================
    if (trx.couponId) {
      await tx.coupon.update({
        where: { id: trx.couponId },
        data: { isUsed: false }
      })
    }

    // ================= RESTORE POINTS (FIFO STYLE 🔥) =================
    if (trx.usedPoints > 0) {
      let remaining = trx.usedPoints

      // ambil point history lama (yang masih valid)
      const histories = await tx.pointHistory.findMany({
        where: {
          userId: trx.userId
        },
        orderBy: {
          createdAt: "asc"
        }
      })

      for (const h of histories) {
        if (remaining <= 0) break

        // restore ke history yang sudah kosong dulu
        if (h.amount === 0) {
          const restoreAmount = Math.min(remaining, 10000) // optional cap

          await tx.pointHistory.update({
            where: { id: h.id },
            data: {
              amount: restoreAmount
            }
          })

          remaining -= restoreAmount
        }
      }

      // kalau masih ada sisa → buat record baru
      if (remaining > 0) {
        await tx.pointHistory.create({
          data: {
            userId: trx.userId,
            amount: remaining,
            expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 3))
          }
        })
      }
    }

    // ================= UPDATE STATUS =================
    const updated = await tx.transaction.update({
      where: { id: transactionId },
      data: { status: "REJECTED" }
    })

    return updated
  })
}