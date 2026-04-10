const {
  getDashboardStatsService,
  getAttendeesService,
  getChartDataService
} = require("../services/dashboard.service")

// ================= STATS =================
exports.getDashboardStats = async (req, res, next) => {
  try {
    const { filter } = req.query

    const data = await getDashboardStatsService(
      req.user.id,
      filter
    )

    res.json({
      success: true,
      data
    })
  } catch (err) {
    next(err)
  }
}

// ================= ATTENDEES =================
exports.getAttendees = async (req, res, next) => {
  try {
    const data = await getAttendeesService(
      req.params.eventId,
      req.user.id
    )

    res.json({
      success: true,
      data
    })
  } catch (err) {
    next(err)
  }
}

// ================= CHART =================
exports.getChartData = async (req, res, next) => {
  try {
    const data = await getChartDataService(req.user.id)

    res.json({
      success: true,
      data
    })
  } catch (err) {
    next(err)
  }
}