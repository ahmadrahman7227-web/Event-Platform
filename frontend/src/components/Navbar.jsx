import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

export default function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  // ✅ SAFE PARSE FUNCTION
  const getUserFromStorage = () => {
    try {
      const data = localStorage.getItem("user")
      if (!data || data === "undefined") return null
      return JSON.parse(data)
    } catch (err) {
      console.error("Invalid user JSON:", err)
      return null
    }
  }

  // ✅ LOAD USER
  useEffect(() => {
    const currentUser = getUserFromStorage()
    setUser(currentUser)
  }, [])

  // ✅ LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    navigate("/")
  }

  return (
    <nav className="fixed w-full z-50 backdrop-blur-md bg-black/40 border-b border-white/10">
      <div className="flex justify-between items-center px-6 py-4 text-white">

        {/* 🔥 LOGO */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold shadow-lg">
            EM
          </div>

          <h1 className="font-bold text-lg tracking-wide group-hover:text-purple-400 transition">
            Event Maestro
          </h1>
        </div>

        {/* 🔥 RIGHT SIDE */}
        <div className="flex gap-3 items-center">

          {!user ? (
            <>
              {/* LOGIN */}
              <button
                onClick={() => navigate("/login")}
                className="
                  px-5 py-2 rounded-lg 
                  border border-white/20
                  bg-white/5 backdrop-blur-md
                  hover:bg-white/10
                  transition
                "
              >
                Login
              </button>

              {/* REGISTER */}
              <button
                onClick={() => navigate("/register")}
                className="
                  px-5 py-2 rounded-lg 
                  bg-gradient-to-r from-purple-500 to-pink-500
                  hover:scale-105 transition
                  font-semibold
                "
              >
                Get Started
              </button>
            </>
          ) : (
            <>
              {/* ROLE BASED */}
              {user.role === "ORGANIZER" ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-4 py-2 text-sm bg-white/10 rounded-lg hover:bg-white/20"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => navigate("/events")}
                  className="px-4 py-2 text-sm bg-white/10 rounded-lg hover:bg-white/20"
                >
                  Events
                </button>
              )}

              {/* PROFILE */}
              <button
                onClick={() => navigate("/profile")}
                className="px-4 py-2 text-sm border border-white/20 rounded-lg hover:bg-white/10"
              >
                Profile
              </button>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-red-500/80 rounded-lg hover:bg-red-500"
              >
                Logout
              </button>
            </>
          )}

        </div>

      </div>
    </nav>
  )
}