import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import useAuthStore from "../store/authStore"

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const { user, logout, isAuthenticated } = useAuthStore()

  const [open, setOpen] = useState(false)
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
    location.pathname === path
      ? "bg-white/20 text-purple-400"
      : "hover:bg-white/10"

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

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {!isAuthenticated ? (
            <>
              <button onClick={() => navigate("/login")}>Login</button>
              <button onClick={() => navigate("/register")}>
                Register
              </button>
            </>
          ) : (
            <>
              {/* ROLE NAV */}
              {user?.role === "ORGANIZER" ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className={`px-4 py-2 rounded ${isActive("/dashboard")}`}
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => navigate("/events")}
                  className={`px-4 py-2 rounded ${isActive("/events")}`}
                >
                  Events
                </button>
              )}

              {/* PROFILE */}
              <button
                onClick={() => navigate("/profile")}
                className={`px-4 py-2 rounded ${isActive("/profile")}`}
              >
                Profile
              </button>

              {/* AVATAR + DROPDOWN */}
              <div className="relative" ref={dropdownRef}>
                <img
                  src={
                    user?.image ||
                    `https://ui-avatars.com/api/?name=${user?.email}`
                  }
                  onClick={() => setOpen(!open)}
                  className="w-10 h-10 rounded-full object-cover cursor-pointer border border-white/20 hover:scale-105 transition"
                />

                {open && (
                  <div className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden">

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
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </nav>
  )
}