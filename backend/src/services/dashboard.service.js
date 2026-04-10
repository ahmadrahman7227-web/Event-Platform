const prisma = require("../prisma/client")
const dayjs = require("dayjs")

// ================= STATS =================
exports.getDashboardStatsService = async (organizerId, filter) => {
  const now = dayjs()

  let startDate

  if (filter === "day") {
    startDate = now.startOf("day").toDate()
  } else if (filter === "month") {
    startDate = now.startOf("month").toDate()
  } else {
    startDate = now.startOf("year").toDate()
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      status: "ACCEPTED",
      createdAt: {
        gte: startDate
      },
      event: {
        organizerId
      }
    },
    include: {
      event: true
    }
  })

  const totalRevenue = transactions.reduce(
    (acc, trx) => acc + trx.totalPrice,
    0
  )

  const totalTransactions = transactions.length

  const totalTickets = transactions.reduce(
    (acc, trx) => acc + trx.quantity,
    0
  )

  return {
    totalRevenue,
    totalTransactions,
    totalTickets
  }
}

// ================= ATTENDEE LIST =================
exports.getAttendeesService = async (eventId, organizerId) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  })

  if (!event || event.organizerId !== organizerId) {
    const err = new Error("Forbidden or event not found")
    err.status = 403
    throw err
  }

  const attendees = await prisma.transaction.findMany({
    where: {
      eventId,
      status: "ACCEPTED"
    },
    include: {
      user: true
    }
  })

  return attendees.map((trx) => ({
    name: trx.user.email,
    quantity: trx.quantity,
    totalPaid: trx.totalPrice
  }))
}

// ================= CHART DATA =================
exports.getChartDataService = async (organizerId) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      status: "ACCEPTED",
      event: {
        organizerId
      }
    }
  })

  const grouped = {}

  transactions.forEach((trx) => {
    const date = dayjs(trx.createdAt).format("YYYY-MM-DD")

    if (!grouped[date]) {
      grouped[date] = 0
    }

    grouped[date] += trx.totalPrice
  })

  return Object.entries(grouped).map(([date, revenue]) => ({
    date,
    revenue
  }))
}