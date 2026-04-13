import { useState } from "react"
import axios from "../api/axios"
import { useParams, useNavigate } from "react-router-dom"

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const passwordChecks = {
    length: (val) => val.length >= 8,
    upper: (val) => /[A-Z]/.test(val),
    lower: (val) => /[a-z]/.test(val),
    number: (val) => /[0-9]/.test(val),
    symbol: (val) => /[!@#$%^&*]/.test(val),
    noSpace: (val) => !/\s/.test(val)
  }

  const handleReset = async () => {
    if (password !== confirm) {
      return setMessage("Password tidak sama")
    }

    if (!Object.values(passwordChecks).every(fn => fn(password))) {
      return setMessage("Password tidak valid")
    }

    try {
      setLoading(true)

      await axios.post("/auth/reset-password", {
        token,
        newPassword: password
      })

      setMessage("Password berhasil direset 🎉")
      setTimeout(() => navigate("/login"), 1500)

    } catch (err) {
      setMessage(err.response?.data?.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">

      <div className="bg-white/5 p-8 rounded-xl border border-white/10 w-full max-w-md">

        <h1 className="text-xl mb-4">Reset Password</h1>

        <input
          type="password"
          placeholder="New Password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 px-4 py-2 bg-white/10"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full mb-3 px-4 py-2 bg-white/10"
        />

        <button
          onClick={handleReset}
          className="w-full bg-purple-500 py-2 rounded"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        {message && <p className="mt-3 text-sm">{message}</p>}

      </div>

    </div>
  )
}