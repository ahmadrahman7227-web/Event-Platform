const cron = require("node-cron")
const prisma = require("../prisma/client")

// ================= CRON SCHEDULE =================
// jalan setiap hari jam 00:00 (production safe)
cron.schedule("0 0 * * *", async () => {
  console.log("🟡 CRON START: Expiration Check")

  try {
    const now = new Date()

    // ================= POINT EXPIRATION =================
    const expiredPoints = await prisma.pointHistory.findMany({
      where: {
        expiresAt: {
          lt: now
        }
      },
      select: {
        id: true,
        userId: true,
        amount: true
      }
    })

    console.log(`Found ${expiredPoints.length} expired point records`)

    // 🔥 OPTION 1 (RECOMMENDED): MARK AS EXPIRED (tidak delete)
    await prisma.pointHistory.updateMany({
      where: {
        expiresAt: {
          lt: now
        }
      },
      data: {
        amount: 0 // invalidate point
      }
    })

    // ================= COUPON EXPIRATION =================
    const expiredCoupons = await prisma.coupon.updateMany({
      where: {
        expiresAt: {
          lt: now
        },
        isUsed: false
      },
      data: {
        isUsed: true // mark as unusable
      }
    })

    console.log(`Expired coupons updated: ${expiredCoupons.count}`)

    console.log("🟢 CRON SUCCESS: Expiration processed")

  } catch (err) {
    console.error("🔴 CRON ERROR:", err.message)
  }
})