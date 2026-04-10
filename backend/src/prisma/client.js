const { PrismaClient } = require("@prisma/client")

// ================= SINGLETON INSTANCE =================
let prisma

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    log: ["error"]
  })
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ["query", "warn", "error"]
    })
  }
  prisma = global.prisma
}

// ================= QUERY LOGGER (OPTIONAL ADVANCED) =================
if (process.env.NODE_ENV !== "production") {
  prisma.$on("query", (e) => {
    console.log("🟡 QUERY:", e.query)
    console.log("🟢 PARAMS:", e.params)
    console.log("⏱️ DURATION:", e.duration + "ms")
  })
}

// ================= GRACEFUL SHUTDOWN =================
process.on("beforeExit", async () => {
  await prisma.$disconnect()
})

// ================= EXPORT =================
module.exports = prisma