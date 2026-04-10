const jwt = require("jsonwebtoken")
const prisma = require("../prisma/client")

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    // ================= VALIDASI HEADER =================
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Token missing"
      })
    }

    const token = authHeader.split(" ")[1]

    // ================= VERIFY TOKEN =================
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

    // ================= FETCH USER FROM DB =================
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        referralCode: true
      }
    })

    // user sudah dihapus / tidak ada
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists"
      })
    }

    // ================= ATTACH USER =================
    req.user = user

    next()

  } catch (err) {
    next(err)
  }
}
