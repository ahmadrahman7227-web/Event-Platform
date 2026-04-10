import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

import bg from "../assets/bg.mp4"
import character from "../assets/CHARACTER.jpg"
import texture from "../assets/TEXTURE.png"
import music from "../assets/phonk-music.mp3"

export default function Register() {
  const audioRef = useRef(null)
  const navigate = useNavigate()

  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: ""
  })

  const [errors, setErrors] = useState({})
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // ================= PASSWORD RULE =================
  const passwordChecks = {
    length: (val) => val.length >= 8,
    upper: (val) => /[A-Z]/.test(val),
    lower: (val) => /[a-z]/.test(val),
    number: (val) => /[0-9]/.test(val),
    symbol: (val) => /[!@#$%^&*]/.test(val),
    noSpace: (val) => !/\s/.test(val)
  }

  // ================= VALIDATION =================
  const validate = () => {
    const newErrors = {}

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)

    if (!emailValid) {
      newErrors.email = "Email tidak valid"
    }

    const pwd = form.password

    if (!passwordChecks.length(pwd)) {
      newErrors.password = "Minimal 8 karakter"
    } else if (!passwordChecks.upper(pwd)) {
      newErrors.password = "Harus ada huruf besar"
    } else if (!passwordChecks.lower(pwd)) {
      newErrors.password = "Harus ada huruf kecil"
    } else if (!passwordChecks.number(pwd)) {
      newErrors.password = "Harus ada angka"
    } else if (!passwordChecks.symbol(pwd)) {
      newErrors.password = "Harus ada simbol (!@#$%^&*)"
    } else if (!passwordChecks.noSpace(pwd)) {
      newErrors.password = "Tidak boleh ada spasi"
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Password tidak sama"
    }

    return newErrors
  }

  // ================= HANDLE REGISTER =================
  const handleRegister = async (e) => {
    e.preventDefault()

    const validationErrors = validate()

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setError("")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      await axios.post("http://localhost:3000/api/auth/register", {
        email: form.email,
        password: form.password,
        referralCode: form.referralCode || undefined
      })

      setSuccess("Register berhasil! Redirect...")
      setTimeout(() => navigate("/login"), 1500)

    } catch (err) {
      console.log("🔥 ERROR FULL:", err.response?.data)

      const resData = err.response?.data

      if (resData?.message) {
        setError(resData.message)
      } else if (resData?.errors?.length > 0) {
        setError(resData.errors[0].message)
      } else {
        setError("Register gagal")
      }
    } finally {
      setLoading(false)
    }
  }

  // ================= VALID CHECK =================
  const isValid =
    form.email &&
    form.password &&
    form.confirmPassword &&
    Object.values(passwordChecks).every((fn) => fn(form.password)) &&
    form.password === form.confirmPassword

  // ================= COMPONENT =================
  const Requirement = ({ valid, text }) => (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`w-4 h-4 flex items-center justify-center rounded-full ${
          valid ? "bg-green-500" : "bg-red-500"
        }`}
      >
        {valid ? "✔" : "✖"}
      </span>
      <span className={valid ? "text-green-400" : "text-red-400"}>
        {text}
      </span>
    </div>
  )

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">

      {/* VIDEO */}
      <video autoPlay loop muted playsInline className="absolute w-full h-full object-cover scale-110">
        <source src={bg} type="video/mp4" />
      </video>

      {/* OVERLAY */}
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
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-10">

        <form
          onSubmit={handleRegister}
          className="
            w-full max-w-lg p-10 rounded-2xl
            bg-black/60 backdrop-blur-xl
            border border-white/20
            shadow-[0_0_100px_rgba(168,85,247,0.4)]
          "
        >

          <h1 className="text-3xl font-bold text-center mb-6 text-white drop-shadow-[0_0_20px_rgba(168,85,247,1)]">
            CREATE ACCOUNT
          </h1>

          <div className="space-y-5">

            {/* EMAIL */}
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              placeholder="EMAIL ADDRESS"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40 outline-none"
            />

            {/* PASSWORD */}
            <div className="relative">
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                placeholder="PASSWORD"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40 outline-none"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-pink-400"
              >
                👁
              </span>
            </div>

            {/* CHECKLIST */}
            <div className="space-y-1">
              <Requirement valid={passwordChecks.length(form.password)} text="Minimal 8 karakter" />
              <Requirement valid={passwordChecks.upper(form.password)} text="Huruf besar" />
              <Requirement valid={passwordChecks.lower(form.password)} text="Huruf kecil" />
              <Requirement valid={passwordChecks.number(form.password)} text="Angka" />
              <Requirement valid={passwordChecks.symbol(form.password)} text="Simbol (!@#$%^&*)" />
              <Requirement valid={passwordChecks.noSpace(form.password)} text="Tanpa spasi" />
            </div>

            {/* CONFIRM */}
            <div className="relative">
              <input
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                type={showConfirm ? "text" : "password"}
                placeholder="CONFIRM PASSWORD"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40 outline-none"
              />
              <span
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-pink-400"
              >
                👁
              </span>
            </div>

            {/* REFERRAL */}
            <input
              name="referralCode"
              value={form.referralCode}
              onChange={handleChange}
              type="text"
              placeholder="REFERRAL CODE (OPTIONAL)"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 focus:border-purple-500 outline-none"
            />

            {/* ERROR */}
            {error && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded">
                {error}
              </p>
            )}

            {/* SUCCESS */}
            {success && (
              <p className="text-green-400 text-sm text-center">
                {success}
              </p>
            )}

            {/* BUTTON */}
            <button
              disabled={!isValid || loading}
              className="
                w-full py-3 rounded-lg font-semibold
                bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600
                hover:scale-105 transition disabled:opacity-50
                shadow-[0_0_50px_rgba(236,72,153,0.9)]
                hover:shadow-[0_0_100px_rgba(236,72,153,1)]
              "
            >
              {loading ? "Creating..." : "CREATE ACCOUNT"}
            </button>

          </div>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-purple-400 hover:text-pink-400 cursor-pointer"
            >
              Login
            </span>
          </p>

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