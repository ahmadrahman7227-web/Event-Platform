const prisma = require("../prisma/client")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { generate } = require("voucher-code-generator")
const dayjs = require("dayjs")

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { email, password, referralCode } = req.body

    // cek email sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ message: "Email already used" })
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // generate referral sendiri
    const myReferral = generate({ length: 6 })[0]

    // cari user referral
    let referredUser = null

    if (referralCode) {
      referredUser = await prisma.user.findUnique({
        where: { referralCode }
      })
    }

    // create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "CUSTOMER",
        referralCode: myReferral,
        referredBy: referredUser ? referredUser.id : null
      }
    })

    // kasih reward
    if (referredUser) {
      console.log("REFERRAL VALID → kasih reward")

      // point ke referrer
      await prisma.pointHistory.create({
        data: {
          userId: referredUser.id,
          amount: 10000,
          expiresAt: dayjs().add(3, "month").toDate()
        }
      })

      // coupon ke user baru
      await prisma.coupon.create({
        data: {
          code: generate({ length: 6 })[0],
          discount: 10,
          userId: user.id,
          expiresAt: dayjs().add(3, "month").toDate()
        }
      })
    }

    res.json({
      message: "Register success",
      user: {
        id: user.id,
        email: user.email,
        referralCode: user.referralCode,
        referredBy: user.referredBy
      }
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" })
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )

    res.json({
      message: "Login success",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  try {
    const { email } = req.body

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { email }
    })

    res.json({
      message: "Profile updated",
      user: {
        id: user.id,
        email: user.email
      }
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const resetToken = Math.random().toString(36).substring(2, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExp: dayjs().add(1, "hour").toDate()
      }
    })

    res.json({
      message: "Reset token created",
      resetToken   // ⚠️ biasanya dikirim via email, tapi kita tampilkan
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
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
      return res.status(400).json({ message: "Invalid or expired token" })
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

    res.json({
      message: "Password reset success"
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
