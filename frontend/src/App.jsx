import { Routes, Route, Navigate } from "react-router-dom"
import { useEffect } from "react"

import useAuthStore from "./store/authStore"

import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"

import Dashboard from "./pages/Dashboard"
import Profile from "./pages/Profile"
import Events from "./pages/Events"
import EventDetail from "./pages/EventDetail" // 🔥 TAMBAHAN
import Transactions from "./pages/Transactions"
import CreateEvent from "./pages/CreateEvent"

import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"

import { Toaster } from "react-hot-toast"
import ProtectedRoute from "./routes/ProtectedRoute"

function App() {
  const loadAuth = useAuthStore((state) => state.loadAuth)

  useEffect(() => {
    loadAuth()
  }, [])

  return (
    <>
      <Toaster />

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

        {/* 🔥 EVENT DETAIL (NEW) */}
        <Route
          path="/events/:id"
          element={
            <ProtectedRoute role="CUSTOMER">
              <EventDetail />
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

        <Route
  path="/transactions"
  element={
    <ProtectedRoute role="CUSTOMER">
      <Transactions />
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

        {/* ❌ FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </>
  )
}

export default App
