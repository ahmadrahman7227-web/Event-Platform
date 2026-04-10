const { ZodError } = require("zod")
const { Prisma } = require("@prisma/client")

module.exports = (err, req, res, next) => {
  console.error("🔥 ERROR:", err)

  // ================= ZOD ERROR =================
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

  // ================= PRISMA UNIQUE =================
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Data already exists",
        field: err.meta?.target || null
      })
    }
  }

  // ================= JWT ERROR =================
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

  // ================= MULTER ERROR =================
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.message
    })
  }

  // ================= CLOUDINARY ERROR =================
  if (err.message?.includes("Cloudinary")) {
    return res.status(500).json({
      success: false,
      message: "Image upload failed"
    })
  }

  // ================= CUSTOM ERROR =================
  if (err.status) {
    return res.status(err.status).json({
      success: false,
      message: err.message
    })
  }

  // ================= UNKNOWN ERROR (SAFE FALLBACK) =================
  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error"
  })
}