const prisma = require("../prisma/client")
const bcrypt = require("bcryptjs")
const dayjs = require("dayjs")
const crypto = require("crypto")
const { generate } = require("voucher-code-generator")

// ================= HELPER =================

// generate referral unik
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
exports.registerService = async ({ email, password }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw { status: 400, message: "Email already used" }
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const referralCode = await generateUniqueReferral()

  return await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      referralCode
    }
  })
}
// exports.registerService = async ({ email, password, referralCode }) => {
//   // cek email
//   const existingUser = await prisma.user.findUnique({
//     where: { email }
//   })

//   if (existingUser) {
//     const err = new Error("Email already used")
//     err.status = 400
//     throw err
//   }

//   const hashedPassword = await bcrypt.hash(password, 10)
//   const myReferral = await generateUniqueReferral()

//   let referredUser = null

//   // validasi referral
//   if (referralCode) {
//     referredUser = await prisma.user.findUnique({
//       where: { referralCode }
//     })

//     if (!referredUser) {
//       const err = new Error("Invalid referral code")
//       err.status = 400
//       throw err
//     }
//   }

//   // 🔥 TRANSACTION (WAJIB)
//   const newUser = await prisma.$transaction(async (tx) => {
//     const user = await tx.user.create({
//       data: {
//         email,
//         password: hashedPassword,
//         role: "CUSTOMER",
//         referralCode: myReferral,
//         referredBy: referredUser?.id || null
//       }
//     })

//     if (referredUser) {
//       const expiry = dayjs().add(3, "month").toDate()

//       // anti self referral
//       if (referredUser.id === user.id) {
//         const err = new Error("Cannot use your own referral")
//         err.status = 400
//         throw err
//       }

//       // tambah point (tidak overwrite)
//       await tx.pointHistory.create({
//         data: {
//           userId: referredUser.id,
//           amount: 10000,
//           expiresAt: expiry
//         }
//       })

//       // coupon user baru
//       await tx.coupon.create({
//         data: {
//           code: generate({ length: 8 })[0],
//           discount: 10,
//           userId: user.id,
//           expiresAt: expiry,
//           isUsed: false
//         }
//       })
//     }

//     return user
//   })

//   return newUser
// }

// ================= LOGIN =================
exports.loginService = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    const err = new Error("User not found")
    err.status = 404
    throw err
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    const err = new Error("Wrong password")
    err.status = 400
    throw err
  }

  return user
}

// ================= RESET TOKEN =================
exports.generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex")
}