// ================= ROLE MIDDLEWARE =================
module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // 🔒 Pastikan auth middleware sudah jalan
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - user not authenticated"
        })
      }

      // 🔒 Validasi role tidak kosong
      if (!allowedRoles || allowedRoles.length === 0) {
        console.warn("ROLE MIDDLEWARE WARNING: No roles provided")

        return res.status(500).json({
          success: false,
          message: "Server configuration error"
        })
      }

      // 🔥 Normalize role (anti case mismatch)
      const userRole = String(req.user.role).toUpperCase()
      const roles = allowedRoles.map(r => String(r).toUpperCase())

      // 🔒 Check permission
      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden - insufficient permissions"
        })
      }

      next()

    } catch (err) {
      console.error("ROLE MIDDLEWARE ERROR:", err)

      return res.status(500).json({
        success: false,
        message: "Internal server error"
      })
    }
  }
}