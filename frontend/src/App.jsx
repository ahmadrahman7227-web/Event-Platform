import { Routes, Route, Navigate } from "react-router-dom"
import { useEffect } from "react"

import useAuthStore from "./store/authStore"

import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"

import Dashboard from "./pages/Dashboard"
import Profile from "./pages/Profile"
import Events from "./pages/Events"
import EventDetail from "./pages/EventDetail"
import Transactions from "./pages/Transactions"
import CreateEvent from "./pages/CreateEvent"

import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"

import { Toaster } from "react-hot-toast"
import ProtectedRoute from "./routes/ProtectedRoute"

function App() {
  const loadAuth = useAuthStore((state) => state.loadAuth)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    loadAuth()
  }, [])

  // 🔥 SMART REDIRECT (LEVEL PRO)
  const getDefaultRoute = () => {
    if (!user) return "/login"
    return user.role === "ORGANIZER" ? "/dashboard" : "/events"
  }

  return (
    <>
      <Toaster />

      <Routes>

        {/* 🌐 PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* 🔐 DEFAULT REDIRECT AFTER LOGIN */}
        <Route path="/redirect" element={<Navigate to={getDefaultRoute()} />} />

        {/* 🔐 ORGANIZER */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="ORGANIZER">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-event"
          element={
            <ProtectedRoute role="ORGANIZER">
              <CreateEvent />
            </ProtectedRoute>
          }
        />

        {/* 🔐 CUSTOMER */}
        <Route
          path="/transactions"
          element={
            <ProtectedRoute role="CUSTOMER">
              <Transactions />
            </ProtectedRoute>
          }
        />

        {/* 🔐 ALL USER (CUSTOMER + ORGANIZER) */}
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/:id"
          element={
            <ProtectedRoute>
              <EventDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* ❌ FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </>
  )
}

export default App
