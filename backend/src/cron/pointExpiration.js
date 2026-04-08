const cron = require("node-cron")
const prisma = require("../prisma/client")
const dayjs = require("dayjs")

cron.schedule("* * * * *", async () => {
  console.log("RUN CRON: CHECK POINT EXPIRATION")

  const now = new Date()

  await prisma.pointHistory.deleteMany({
    where: {
      expiresAt: {
        lt: now
      }
    }
  })

  console.log("EXPIRED POINTS DELETED")
})