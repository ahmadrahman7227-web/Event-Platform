const prisma = require("../prisma/client")
const bcrypt = require("bcryptjs")
const dayjs = require("dayjs")

const {
  registerService,
  loginService,
  generateResetToken
} = require("../services/auth.service")

const { registerSchema } = require("../validations/auth.validation")

const { deleteFromCloudinary } = require("../utils/cloudinary")

// ================= HELPER =================
const normalizeEmail = (email) => email?.trim().toLowerCase()

// ================= REGISTER =================
exports.register = async (req, res, next) => {
  try {
    const validated = registerSchema.parse(req.body)
    validated.email = normalizeEmail(validated.email)

    const user = await registerService(validated)

    return res.status(201).json({
      success: true,
      message: "Register success",
      data: {
        id: user.id,
        email: user.email,
        referralCode: user.referralCode
      }
    })
  } catch (err) {
    next(err)
  }
}

// ================= LOGIN =================
exports.login = async (req, res, next) => {
  try {
    let { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      })
    }

    email = normalizeEmail(email)

    const result = await loginService({ email, password })

    return res.json({
      success: true,
      message: "Login success",
      data: {
        token: result.token,
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          image: result.user.profileImage
        }
      }
    })
  } catch (err) {
    next(err)
  }
}

// ================= GET PROFILE =================
exports.getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        coupons: true,
        pointHistories: true
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    const points =
      user.pointHistories?.reduce((acc, p) => acc + p.amount, 0) || 0

    return res.json({
      success: true,
      message: "Profile fetched",
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
        image: user.profileImage,
        points,
        coupons: user.coupons
      }
    })
  } catch (err) {
    next(err)
  }
}

// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res, next) => {
  try {
    let { email } = req.body

    if (email) email = normalizeEmail(email)

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { email }
    })

    return res.json({
      success: true,
      message: "Profile updated",
      data: {
        id: updatedUser.id,
        email: updatedUser.email
      }
    })
  } catch (err) {
    next(err)
  }
}

// ================= CHANGE PASSWORD =================
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old and new password are required"
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    })

    if (!user) throw { status: 404, message: "User not found" }

    const isMatch = await bcrypt.compare(oldPassword, user.password)

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Wrong password"
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    return res.json({
      success: true,
      message: "Password updated"
    })
  } catch (err) {
    next(err)
  }
}

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res, next) => {
  try {
    let { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      })
    }

    email = normalizeEmail(email)

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.json({
        success: true,
        message: "If email exists, reset token sent"
      })
    }

    const resetToken = generateResetToken()

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExp: dayjs().add(1, "hour").toDate()
      }
    })

    return res.json({
      success: true,
      message: "Reset token generated",
      data: { token: resetToken } // nanti diganti email
    })
  } catch (err) {
    next(err)
  }
}

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password required"
      })
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: { gt: new Date() }
      }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token"
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExp: null
      }
    })

    return res.json({
      success: true,
      message: "Password reset success"
    })
  } catch (err) {
    next(err)
  }
}

// ================= UPLOAD PROFILE =================
exports.uploadProfile = async (req, res, next) => {
  try {
    console.log("📸 FILE DATA:", req.file)

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      })
    }

    const imageUrl = req.file.path
    const publicId = req.file.filename // Cloudinary public_id

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    // 🔥 DELETE OLD IMAGE
    if (user.profileImageId) {
      await deleteFromCloudinary(user.profileImageId)
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        profileImage: imageUrl,
        profileImageId: publicId
      }
    })

    return res.json({
      success: true,
      message: "Profile image updated",
      data: {
        image: updatedUser.profileImage
      }
    })
  } catch (err) {
    console.error("🔥 UPLOAD ERROR:", err)
    next(err)
  }
}