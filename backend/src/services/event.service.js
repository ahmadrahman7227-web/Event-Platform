const prisma = require("../prisma/client")

// ================= CREATE EVENT =================
exports.createEventService = async (data, userId) => {
  const {
    title,
    description,
    location,
    price,
    availableSeats,
    startDate,
    endDate
  } = data

  if (new Date(startDate) >= new Date(endDate)) {
    const err = new Error("End date must be after start date")
    err.status = 400
    throw err
  }

  return await prisma.event.create({
    data: {
      title,
      description,
      location,
      price,
      availableSeats,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      organizerId: userId
    }
  })
}

// ================= GET ALL EVENTS =================
exports.getEventsService = async (query) => {
  const { search, page = 1, limit = 10 } = query

  const skip = (page - 1) * limit

  return await prisma.event.findMany({
    where: {
      title: {
        contains: search || "",
        mode: "insensitive"
      }
    },
    skip: Number(skip),
    take: Number(limit),
    orderBy: {
      createdAt: "desc"
    }
  })
}

// ================= GET EVENT DETAIL =================
exports.getEventByIdService = async (id) => {
  const event = await prisma.event.findUnique({
    where: { id }
  })

  if (!event) {
    const err = new Error("Event not found")
    err.status = 404
    throw err
  }

  return event
}

// ================= UPDATE EVENT =================
exports.updateEventService = async (id, data, userId) => {
  const event = await prisma.event.findUnique({
    where: { id }
  })

  if (!event) {
    throw new Error("Event not found")
  }

  if (event.organizerId !== userId) {
    const err = new Error("Forbidden")
    err.status = 403
    throw err
  }

  return await prisma.event.update({
    where: { id },
    data
  })
}

// ================= DELETE EVENT =================
exports.deleteEventService = async (id, userId) => {
  const event = await prisma.event.findUnique({
    where: { id }
  })

  if (!event) {
    throw new Error("Event not found")
  }

  if (event.organizerId !== userId) {
    const err = new Error("Forbidden")
    err.status = 403
    throw err
  }

  return await prisma.event.delete({
    where: { id }
  })
}