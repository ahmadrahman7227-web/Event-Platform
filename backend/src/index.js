require("dotenv").config()

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")

const app = express()

// ================= CORE MIDDLEWARE =================

app.use(helmet())
app.use(morgan("dev"))

app.use(cors({
  origin: "http://localhost:5173", // ✅ FRONTEND VITE
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ================= RATE LIMIT =================

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later"
  }
})

app.use(globalLimiter)

// ================= LOAD ROUTES (NO MORE SILENT ERROR) =================

// ❌ JANGAN pakai try-catch di sini
// Kalau error → biarkan crash biar kelihatan

const authRoutes = require("./routes/auth.routes")
const eventRoutes = require("./routes/event.routes")
const transactionRoutes = require("./routes/transaction.routes")
const dashboardRoutes = require("./routes/dashboard.routes")

// ================= ROUTES =================

app.use("/api/auth", authRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/transactions", transactionRoutes)
app.use("/api/dashboard", dashboardRoutes)

// ================= ROOT =================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API RUNNING 🚀"
  })
})

// ================= HEALTH CHECK =================

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    timestamp: new Date()
  })
})

// ================= 404 =================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  })
})

// ================= ERROR HANDLER =================

const errorMiddleware = require("./middleware/error.middleware")

app.use(errorMiddleware)

// ================= SERVER =================

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})