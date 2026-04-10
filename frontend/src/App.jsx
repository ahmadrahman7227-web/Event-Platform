import { Routes, Route, Navigate } from "react-router-dom"

import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"

import Dashboard from "./pages/Dashboard"
import Profile from "./pages/Profile"
import Events from "./pages/Events" // nanti dibuat
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"

import ProtectedRoute from "./routes/ProtectedRoute"

function App() {
  return (
    <Routes>

      {/* 🌐 PUBLIC ROUTES */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* 🔐 ORGANIZER ONLY */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="ORGANIZER">
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* 🔐 CUSTOMER ONLY */}
      <Route
        path="/events"
        element={
          <ProtectedRoute role="CUSTOMER">
            <Events />
          </ProtectedRoute>
        }
      />

      {/* 🔐 ALL LOGIN USER */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* ❌ FALLBACK (ANTI ERROR PAGE) */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  )
}

export default App
