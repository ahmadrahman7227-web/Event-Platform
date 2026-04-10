const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("../utils/cloudinary")

// ================= STORAGE =================
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "event-platform",
      format: file.mimetype.split("/")[1], // auto format
      public_id: `user-${Date.now()}`
    }
  }
})

// ================= FILE FILTER =================
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"]

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPG, JPEG, PNG allowed"), false)
  }

  cb(null, true)
}

// ================= UPLOAD CONFIG =================
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
})

// ================= ERROR HANDLER =================
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const handler = upload.single(fieldName)

    handler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: err.message
        })
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        })
      }

      next()
    })
  }
}

module.exports = {
  uploadSingle
}