require("dotenv").config()

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")

const app = express()

// ================= CORE =================
const { errorHandler } = require("./middleware/error.middleware")
const { verifyToken } = require("./middleware/auth.middleware")
const authorize = require("./middleware/role.middleware")

// ================= ROUTES =================
const authRoutes = require("./routes/auth.routes")
const eventRoutes = require("./routes/event.routes")
const transactionRoutes = require("./routes/transaction.routes")
const dashboardRoutes = require("./routes/dashboard.routes")

// ================= CRON =================
try {
  require("./cron/pointExpiration")
  console.log("✅ Cron loaded")
} catch (err) {
  console.warn("⚠️ Cron not loaded:", err.message)
}

// ================= RATE LIMIT =================
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many login attempts"
  }
})

// ================= MIDDLEWARE =================

// 🔥 Helmet fix (biar tidak ganggu CORS)
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
)

app.use(morgan("dev"))

// 🔥 CORS FIX (SIMPLE & STABLE)
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true
  })
)

// ❌ HAPUS INI (BIKIN CRASH DI EXPRESS BARU)
// app.options("*", cors())

app.use(globalLimiter)

app.use(express.json({ limit: "10kb" }))
app.use(express.urlencoded({ extended: true }))

// ================= ROUTES =================

// 🔐 AUTH
app.use("/api/auth", authLimiter, authRoutes)

// 🎟 EVENTS
app.use("/api/events", eventRoutes)

// 💳 TRANSACTIONS
app.use("/api/transactions", transactionRoutes)

// 📊 DASHBOARD
app.use("/api/dashboard", dashboardRoutes)

// ================= ROOT =================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API RUNNING 🚀"
  })
})

// ================= HEALTH =================
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    timestamp: new Date()
  })
})

// ================= TEST =================
app.get("/api/profile", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "SUCCESS ACCESS",
    data: req.user
  })
})

// ================= ROLE =================
app.get("/api/customer", verifyToken, authorize("CUSTOMER"), (req, res) => {
  res.json({
    success: true,
    message: "WELCOME CUSTOMER",
    data: req.user
  })
})

app.get("/api/organizer", verifyToken, authorize("ORGANIZER"), (req, res) => {
  res.json({
    success: true,
    message: "WELCOME ORGANIZER",
    data: req.user
  })
})

// ================= 404 =================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  })
})

// ================= ERROR =================
app.use(errorHandler)

// ================= SERVER =================
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})