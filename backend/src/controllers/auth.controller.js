const jwt = require("jsonwebtoken")
const prisma = require("../prisma/client")
const bcrypt = require("bcryptjs")
const dayjs = require("dayjs")

const {
  registerService,
  loginService,
  generateResetToken
} = require("../services/auth.service")

const { registerSchema } = require("../validations/auth.validation")

// ================= REGISTER =================
exports.register = async (req, res, next) => {
  try {
    const validated = registerSchema.parse(req.body)

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
    const { email, password } = req.body

    const user = await loginService({ email, password })

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    )

    return res.json({
      success: true,
      message: "Login success",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
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
      select: {
        id: true,
        email: true,
        role: true,
        profileImage: true,
        referralCode: true
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    return res.json({
      success: true,
      message: "Profile fetched",
      data: user
    })
  } catch (err) {
    next(err)
  }
}

// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res, next) => {
  try {
    const { email } = req.body

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

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email already exists"
      })
    }

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
      message: "Password updated successfully"
    })
  } catch (err) {
    next(err)
  }
}

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
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

    // 🔥 nanti kirim via email (nodemailer)
    return res.json({
      success: true,
      message: "Reset token generated (check email in production)"
    })
  } catch (err) {
    next(err)
  }
}

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: {
          gt: new Date()
        }
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

// ================= UPLOAD PROFILE IMAGE =================
exports.uploadProfile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      })
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        profileImage: req.file.path
      }
    })

    return res.json({
      success: true,
      message: "Profile image updated",
      data: {
        profileImage: updatedUser.profileImage
      }
    })
  } catch (err) {
    next(err)
  }
}