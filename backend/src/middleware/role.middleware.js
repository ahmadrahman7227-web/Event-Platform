module.exports = (role) => {
  return (req, res, next) => {
    try {
      if (req.user.role !== role) {
        return res.status(403).json({
          message: "Forbidden access"
        })
      }

      next()
    } catch (err) {
      return res.status(500).json({
        message: err.message
      })
    }
  }
}