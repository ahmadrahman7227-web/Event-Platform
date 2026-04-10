module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // pastikan user ada (auth middleware sudah jalan)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        })
      }

      // validasi role
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden - insufficient permissions"
        })
      }

      next()
    } catch (err) {
      next(err)
    }
  }
}