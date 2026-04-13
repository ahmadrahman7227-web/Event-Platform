const cloudinary = require("cloudinary").v2

// ================= ENV VALIDATION =================
const requiredEnv = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET"
]

requiredEnv.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`❌ Missing environment variable: ${envVar}`)
  }
})

// ================= CONFIG =================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

// ================= DEBUG =================
console.log("☁️ Cloudinary Config Loaded:", {
  cloud: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY ? "OK" : "MISSING"
})

// ================= OPTIONAL MANUAL UPLOAD =================
// (tidak wajib kalau pakai multer-storage-cloudinary)
const uploadToCloudinary = async (filePath, folder = "event-platform") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "image"
    })

    return {
      url: result.secure_url,
      publicId: result.public_id
    }

  } catch (err) {
    console.error("🔥 FULL CLOUDINARY ERROR:", err)

    // 🔥 JANGAN DI-SILENCE
    throw err
  }
}

// ================= DELETE =================
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return

    await cloudinary.uploader.destroy(publicId)

  } catch (err) {
    console.error("🔥 Cloudinary Delete Error:", err)
  }
}

// ================= EXTRACT PUBLIC ID =================
const extractPublicId = (url) => {
  try {
    if (!url) return null

    const parts = url.split("/")
    const file = parts.pop()
    const folder = parts.pop()

    const fileName = file.split(".")[0]

    return `${folder}/${fileName}`

  } catch (err) {
    console.error("🔥 Extract Public ID Error:", err)
    return null
  }
}

// ================= EXPORT =================
module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId
}