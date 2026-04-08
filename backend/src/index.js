const express = require("express")
const cors = require("cors")
require("dotenv").config()
require("./cron/pointExpiration") // Jalankan cron untuk cek expired points

const app = express()

// ================= MIDDLEWARE =================
app.use(cors())
app.use(express.json())

// ================= ROUTES =================
const authRoutes = require("./routes/auth.routes")
const authMiddleware = require("./middleware/auth.middleware")
const roleMiddleware = require("./middleware/role.middleware")

app.use("/api/auth", authRoutes)

// ================= ROOT =================
app.get("/", (req, res) => {
  res.send("API RUNNING 🚀")
})

// ================= PROTECTED ROUTE =================
app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({
    message: "SUCCESS ACCESS",
    user: req.user
  })
})

// ================= ROLE BASED ROUTE =================

//  hanya CUSTOMER
app.get(
  "/api/customer",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  (req, res) => {
    res.json({
      message: "WELCOME CUSTOMER",
      user: req.user
    })
  }
)

//  hanya ORGANIZER
app.get(
  "/api/organizer",
  authMiddleware,
  roleMiddleware("ORGANIZER"),
  (req, res) => {
    res.json({
      message: "WELCOME ORGANIZER",
      user: req.user
    })
  }
)

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({
    message: "Internal Server Error"
  })
})

// ================= SERVER =================
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})