const jwt = require("jsonwebtoken")
const prisma = require("../prisma/client")

// ================= HELPER =================
const extractToken = (req) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  return authHeader.split(" ")[1]
}

// ================= VERIFY TOKEN =================
const verifyToken = async (req, res, next) => {
  try {
    const token = extractToken(req)

    // 🔒 TOKEN WAJIB ADA
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Token missing"
      })
    }

    let decoded

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return res.status(401).json({
        success: false,
        message:
          err.name === "TokenExpiredError"
            ? "Token expired"
            : "Invalid token"
      })
    }

    // 🔥 VALIDASI PAYLOAD
    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload"
      })
    }

    // 🔥 FETCH USER
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        referralCode: true
      }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists"
      })
    }

    req.user = user

    next()
  } catch (err) {
    console.error("AUTH ERROR:", err)

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
}

// ================= ROLE CHECK =================
const requireRole = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        })
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden - Insufficient permissions"
        })
      }

      next()
    } catch (err) {
      console.error("ROLE ERROR:", err)

      return res.status(500).json({
        success: false,
        message: "Internal server error"
      })
    }
  }
}

// ================= OWNERSHIP CHECK =================
const requireOwnership = (field = "userId") => {
  return (req, res, next) => {
    try {
      const resourceUserId = req.body[field] || req.params[field]

      if (!resourceUserId || Number(resourceUserId) !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Forbidden - Not your resource"
        })
      }

      next()
    } catch (err) {
      console.error("OWNERSHIP ERROR:", err)

      return res.status(500).json({
        success: false,
        message: "Internal server error"
      })
    }
  }
}

// ================= EXPORT =================
module.exports = {
  verifyToken,
  requireRole,
  requireOwnership
}
