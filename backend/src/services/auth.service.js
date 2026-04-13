const prisma = require("../prisma/client")
const bcrypt = require("bcryptjs")
const dayjs = require("dayjs")
const crypto = require("crypto")
const { generate } = require("voucher-code-generator")
const jwt = require("jsonwebtoken")

// ================= HELPER =================
const normalizeEmail = (email) => email.trim().toLowerCase()

async function generateUniqueReferral() {
  let code
  let exists = true

  while (exists) {
    code = generate({ length: 6 })[0]

    const check = await prisma.user.findUnique({
      where: { referralCode: code }
    })

    if (!check) exists = false
  }

  return code
}

// ================= REGISTER =================
exports.registerService = async ({ email, password, referralCode }) => {
  try {
    // 🔥 normalize semua input
    email = normalizeEmail(email)
    referralCode = referralCode?.trim()

    // cek email unik
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw { status: 400, message: "Email already used" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const myReferral = await generateUniqueReferral()

    let referredUser = null

    // ✅ validasi referral
    if (referralCode) {
      referredUser = await prisma.user.findUnique({
        where: { referralCode }
      })

      if (!referredUser) {
        throw { status: 400, message: "Invalid referral code" }
      }
    }

    // 🔥 TRANSACTION SAFE
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "CUSTOMER",
          referralCode: myReferral,
          referredBy: referredUser?.id || null
        }
      })

      // 🎁 reward system
      if (referredUser) {
        const expiry = dayjs().add(3, "month").toDate()

        await tx.pointHistory.create({
          data: {
            userId: referredUser.id,
            amount: 10000,
            expiresAt: expiry
          }
        })

        await tx.coupon.create({
          data: {
            code: generate({ length: 8 })[0],
            discount: 10,
            userId: user.id,
            expiresAt: expiry,
            isUsed: false
          }
        })
      }

      return user
    })

    return newUser

  } catch (err) {
    console.log("REGISTER ERROR:", err)
    throw err.status ? err : { status: 500, message: "Register failed" }
  }
}

// ================= LOGIN =================
exports.loginService = async ({ email, password }) => {
  try {
    // 🔥 normalize (WAJIB)
    email = normalizeEmail(email)

    console.log("LOGIN SERVICE EMAIL:", email)

    const user = await prisma.user.findUnique({
      where: { email }
    })

    // 🔒 anti user enumeration (optional hardcore)
    if (!user) {
      throw { status: 400, message: "Invalid email or password" }
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      throw { status: 400, message: "Invalid email or password" }
    }

    // 🔥 JWT SAFE
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

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    }

  } catch (err) {
    console.log("LOGIN ERROR:", err)
    throw err.status ? err : { status: 500, message: "Login failed" }
  }
}

// ================= RESET TOKEN =================
exports.generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex")
}