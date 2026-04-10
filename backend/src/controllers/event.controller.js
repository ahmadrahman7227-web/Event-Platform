const {
  createEventService,
  getEventsService,
  getEventByIdService,
  updateEventService,
  deleteEventService
} = require("../services/event.service")

// CREATE
exports.createEvent = async (req, res, next) => {
  try {
    const event = await createEventService(req.body, req.user.id)

    res.status(201).json({
      success: true,
      message: "Event created",
      data: event
    })
  } catch (err) {
    next(err)
  }
}

// GET ALL
exports.getEvents = async (req, res, next) => {
  try {
    const events = await getEventsService(req.query)

    res.json({
      success: true,
      data: events
    })
  } catch (err) {
    next(err)
  }
}

// GET BY ID
exports.getEventById = async (req, res, next) => {
  try {
    const event = await getEventByIdService(req.params.id)

    res.json({
      success: true,
      data: event
    })
  } catch (err) {
    next(err)
  }
}

// UPDATE
exports.updateEvent = async (req, res, next) => {
  try {
    const event = await updateEventService(
      req.params.id,
      req.body,
      req.user.id
    )

    res.json({
      success: true,
      message: "Event updated",
      data: event
    })
  } catch (err) {
    next(err)
  }
}

// DELETE
exports.deleteEvent = async (req, res, next) => {
  try {
    await deleteEventService(req.params.id, req.user.id)

    res.json({
      success: true,
      message: "Event deleted"
    })
  } catch (err) {
    next(err)
  }
}