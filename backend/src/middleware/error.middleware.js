const { ZodError } = require("zod")
const { Prisma } = require("@prisma/client")

const errorHandler = (err, req, res, next) => {
  console.error("🔥 FULL ERROR:", err)

  // ================= ZOD =================
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: err.errors[0]?.message || "Validation error",
      errors: err.errors.map((e) => ({
        field: e.path[0],
        message: e.message
      }))
    })
  }

  // ================= PRISMA =================
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Data already exists",
        field: err.meta?.target || null
      })
    }
  }

  // ================= JWT =================
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    })
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired"
    })
  }

  // ================= MULTER =================
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.message
    })
  }

  // ================= CLOUDINARY =================
  if (
    err.message?.toLowerCase().includes("cloudinary") ||
    err.http_code // dari cloudinary response
  ) {
    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? err.message // 🔥 tampilkan error asli
          : "Image upload failed"
    })
  }

  // ================= CUSTOM =================
  if (err.status) {
    return res.status(err.status).json({
      success: false,
      message: err.message
    })
  }

  // ================= DEFAULT =================
  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "development"
        ? err.message // 🔥 DEBUG MODE
        : "Internal Server Error"
  })
}

module.exports = {
  errorHandler
}