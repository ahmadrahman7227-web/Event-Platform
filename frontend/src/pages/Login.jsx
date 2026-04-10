import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

import bg from "../assets/bg.mp4"
import character from "../assets/CHARACTER.jpg"
import texture from "../assets/TEXTURE.png"
import music from "../assets/phonk-music.mp3"

export default function Login() {
  const audioRef = useRef(null)
  const navigate = useNavigate()

  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    email: "",
    password: ""
  })

  const [error, setError] = useState("")

  useEffect(() => {
    const handleUserInteraction = () => {
      if (audioRef.current) {
        audioRef.current.volume = 0.05
        audioRef.current.play().catch(() => {})
      }
      setReady(true)
      window.removeEventListener("click", handleUserInteraction)
    }

    window.addEventListener("click", handleUserInteraction)

    return () => {
      window.removeEventListener("click", handleUserInteraction)
    }
  }, [])

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/login",
        form
      )

      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))

      const user = res.data.user

      if (user.role === "ORGANIZER") {
        navigate("/dashboard")
      } else {
        navigate("/events")
      }

    } catch (err) {
      setError(
        err.response?.data?.message || "Login gagal"
      )
    } finally {
      setLoading(false)
    }
  }

  const isValid = form.email && form.password

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white">

      {/* VIDEO */}
      <video autoPlay loop muted playsInline className="absolute w-full h-full object-cover scale-110">
        <source src={bg} type="video/mp4" />
      </video>

      {/* 🔥 OVERLAY (FIX KONTRAS) */}
      <div className="absolute inset-0 bg-black/80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_60%)]" />

      {/* CHARACTER */}
      <img
        src={character}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-40 blur-[3px] scale-110 pointer-events-none"
      />

      {/* TEXTURE */}
      <div
        className="absolute inset-0 mix-blend-overlay opacity-10"
        style={{ backgroundImage: `url(${texture})` }}
      />

      {/* FORM */}
      <div className="relative z-10 flex items-center justify-center h-full px-4">

        <form
          onSubmit={handleLogin}
          className="
            w-full max-w-md p-8 rounded-2xl
            bg-white/10 backdrop-blur-xl
            border border-white/20
            shadow-[0_0_80px_rgba(168,85,247,0.35)]
          "
        >

          <h1 className="text-3xl font-bold text-center mb-6 tracking-wide">
            WELCOME, MAESTRO
          </h1>

          <div className="space-y-4">

            {/* EMAIL */}
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              placeholder="EMAIL ADDRESS"
              className="
                w-full px-4 py-3 rounded-lg
                bg-white/10 text-white
                border border-white/10
                focus:border-purple-500
                focus:ring-2 focus:ring-purple-500/40
                outline-none transition
              "
            />

            {/* PASSWORD */}
            <div className="relative">
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                placeholder="PASSWORD"
                className="
                  w-full px-4 py-3 rounded-lg
                  bg-white/10 text-white
                  border border-white/10
                  focus:border-purple-500
                  focus:ring-2 focus:ring-purple-500/40
                  outline-none transition
                "
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 cursor-pointer text-sm text-gray-400 hover:text-white transition"
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>

            {/* ERROR */}
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            {/* BUTTON */}
            <button
              disabled={!isValid || loading}
              className="
                w-full py-3 rounded-lg font-semibold
                bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500
                hover:scale-105 transition disabled:opacity-50
                shadow-[0_0_30px_rgba(236,72,153,0.6)]
                hover:shadow-[0_0_60px_rgba(236,72,153,0.9)]
              "
            >
              {loading ? "Loading..." : "ENTER BACKSTAGE"}
            </button>

            {/* FORGOT */}
            <p
              onClick={() => navigate("/forgot-password")}
              className="text-center text-sm text-purple-400 hover:text-pink-400 cursor-pointer transition"
            >
              Forgot Password?
            </p>

            {/* REGISTER */}
            <p className="text-center text-gray-400 text-sm">
              Don’t have an account?{" "}
              <span
                onClick={() => navigate("/register")}
                className="text-purple-400 hover:text-pink-400 cursor-pointer transition"
              >
                Register
              </span>
            </p>

          </div>

        </form>

      </div>

      {/* SOUND */}
      <audio ref={audioRef} loop>
        <source src={music} type="audio/mpeg" />
      </audio>

      {!ready && (
        <div className="absolute bottom-6 w-full text-center text-gray-400 text-sm">
          Click anywhere to enable sound 🔊
        </div>
      )}
    </div>
  )
}