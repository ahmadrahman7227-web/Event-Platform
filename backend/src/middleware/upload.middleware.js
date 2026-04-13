const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const { cloudinary } = require("../utils/cloudinary")

// ================= CONSTANT =================
const MAX_FILE_SIZE = 2 * 1024 * 1024
const ALLOWED_FORMATS = ["jpg", "jpeg", "png"]
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/jpg"]

// ================= STORAGE =================
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const format = file.mimetype.split("/")[1]

    if (!ALLOWED_FORMATS.includes(format)) {
      throw new Error("Invalid image format (JPG, JPEG, PNG only)")
    }

    return {
      folder: "event-platform",
      format,
      public_id: `user-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      transformation: [
        { width: 500, height: 500, crop: "limit" },
        { quality: "auto" }
      ]
    }
  }
})

// ================= FILE FILTER =================
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(new Error("Only JPG, JPEG, PNG images are allowed"), false)
  }
  cb(null, true)
}

// ================= MULTER CONFIG =================
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
})

// ================= FIXED SINGLE UPLOAD =================
const uploadSingle = (fieldName) => {
  return (req, res, next) => {

    // 🔥 LANGSUNG PAKAI upload.single
    upload.single(fieldName)(req, res, (err) => {

      if (err instanceof multer.MulterError) {
        console.error("🔥 MULTER ERROR:", err)

        return res.status(400).json({
          success: false,
          message: err.message
        })
      }

      if (err) {
        console.error("🔥 UPLOAD ERROR:", err)

        return res.status(400).json({
          success: false,
          message: err.message || "Upload failed"
        })
      }

      // 🔥 DEBUG (AKTIF SEKARANG)
      console.log("📸 Uploaded File:", req.file)

      next()
    })
  }
}

// ================= MULTIPLE UPLOAD =================
const uploadMultiple = (fieldName, max = 5) => {
  return (req, res, next) => {
    upload.array(fieldName, max)(req, res, (err) => {

      if (err instanceof multer.MulterError) {
        console.error("🔥 MULTER MULTI ERROR:", err)

        return res.status(400).json({
          success: false,
          message: err.message
        })
      }

      if (err) {
        console.error("🔥 MULTI UPLOAD ERROR:", err)

        return res.status(400).json({
          success: false,
          message: err.message
        })
      }

      console.log("📸 Uploaded Files:", req.files)

      next()
    })
  }
}

// ================= EXPORT =================
module.exports = {
  uploadSingle,
  uploadMultiple
}