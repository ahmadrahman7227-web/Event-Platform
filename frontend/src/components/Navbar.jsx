import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import useAuthStore from "../store/authStore"
import { motion, AnimatePresence } from "framer-motion"

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const { user, logout, isAuthenticated } = useAuthStore()

  const [open, setOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const dropdownRef = useRef()

  // ================= CLOSE DROPDOWN =================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // ================= ACTIVE =================
  const isActive = (path) =>
    location.pathname.startsWith(path)
      ? "bg-white/20 text-purple-400"
      : "hover:bg-white/10"

  // ================= AVATAR =================
  const avatar =
    user?.profileImage ||
    `https://ui-avatars.com/api/?name=${user?.email || "User"}`

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/50 border-b border-white/10">
      <div className="flex justify-between items-center px-6 py-4 text-white">

        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold">
            EM
          </div>
          <h1 className="font-bold text-lg group-hover:text-purple-400">
            Event Maestro
          </h1>
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-4">

          {!isAuthenticated ? (
            <>
              <button onClick={() => navigate("/login")}>Login</button>
              <button onClick={() => navigate("/register")}>
                Register
              </button>
            </>
          ) : (
            <>
              {/* EVENTS (ALL USER) */}
              <button
                onClick={() => navigate("/events")}
                className={`px-4 py-2 rounded ${isActive("/events")}`}
              >
                Events
              </button>

              {/* ORGANIZER */}
              {user?.role === "ORGANIZER" && (
                <>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className={`px-4 py-2 rounded ${isActive("/dashboard")}`}
                  >
                    Dashboard
                  </button>

                  <button
                    onClick={() => navigate("/create-event")}
                    className={`px-4 py-2 rounded ${isActive("/create-event")}`}
                  >
                    + Create
                  </button>
                </>
              )}

              {/* CUSTOMER */}
              {user?.role === "CUSTOMER" && (
                <button
                  onClick={() => navigate("/transactions")}
                  className={`px-4 py-2 rounded ${isActive("/transactions")}`}
                >
                  Transactions
                </button>
              )}

              {/* PROFILE */}
              <button
                onClick={() => navigate("/profile")}
                className={`px-4 py-2 rounded ${isActive("/profile")}`}
              >
                Profile
              </button>

              {/* AVATAR */}
              <div className="relative" ref={dropdownRef}>
                <img
                  src={avatar}
                  onClick={() => setOpen(!open)}
                  className="w-10 h-10 rounded-full object-cover cursor-pointer border border-white/20 hover:scale-105 transition"
                />

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden"
                    >

                      <div className="p-3 border-b border-white/10 text-sm text-gray-300">
                        {user?.email}
                      </div>

                      <button
                        onClick={() => {
                          navigate("/profile")
                          setOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-white/10"
                      >
                        Profile
                      </button>

                      <button
                        onClick={() => {
                          logout()
                          navigate("/login")
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-500/20 text-red-400"
                      >
                        Logout
                      </button>

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden"
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="md:hidden bg-black/90 border-t border-white/10 px-6 py-4 space-y-3"
          >
            {!isAuthenticated ? (
              <>
                <button onClick={() => navigate("/login")}>Login</button>
                <button onClick={() => navigate("/register")}>
                  Register
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate("/events")}>Events</button>

                {user?.role === "ORGANIZER" && (
                  <>
                    <button onClick={() => navigate("/dashboard")}>
                      Dashboard
                    </button>
                    <button onClick={() => navigate("/create-event")}>
                      Create Event
                    </button>
                  </>
                )}

                {user?.role === "CUSTOMER" && (
                  <button onClick={() => navigate("/transactions")}>
                    Transactions
                  </button>
                )}

                <button onClick={() => navigate("/profile")}>
                  Profile
                </button>

                <button
                  onClick={() => {
                    logout()
                    navigate("/login")
                  }}
                  className="text-red-400"
                >
                  Logout
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}