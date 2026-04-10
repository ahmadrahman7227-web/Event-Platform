const cloudinary = require("cloudinary").v2

// ================= ENV VALIDATION =================
const requiredEnv = [
  "CLOUDINARY_NAME",
  "CLOUDINARY_KEY",
  "CLOUDINARY_SECRET"
]

requiredEnv.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing environment variable: ${envVar}`)
  }
})

// ================= CONFIG =================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true // wajib untuk HTTPS
})

// ================= HELPER FUNCTIONS =================

// upload manual (optional future use)
const uploadToCloudinary = async (filePath, folder = "event-platform") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "image"
    })

    return result
  } catch (err) {
    throw new Error("Cloudinary upload failed")
  }
}

// delete file (important for update profile / event)
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (err) {
    console.error("Cloudinary delete error:", err.message)
  }
}

// ================= EXPORT =================
module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary
}