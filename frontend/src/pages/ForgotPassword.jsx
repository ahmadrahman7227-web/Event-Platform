import { useState } from "react"
import axios from "../api/axios"
import { useNavigate } from "react-router-dom"
import AuthLayout from "../components/AuthLayout"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post("/auth/forgot-password", { email })
      setMessage("Link reset dikirim ke email kamu 📧")
    } catch (err) {
      setMessage(err.response?.data?.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>

      <form
        onSubmit={handleSubmit}
        className="
          w-full max-w-md p-8 rounded-2xl
          bg-black/60 backdrop-blur-xl
          border border-white/20
          shadow-[0_0_80px_rgba(168,85,247,0.35)]
          transition
        "
      >

        {/* TITLE */}
        <h1 className="
          text-2xl font-bold text-center mb-6
          text-white
          drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]
        ">
          RESET ACCESS
        </h1>

        {/* INPUT */}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="EMAIL ADDRESS"
          className="
            w-full px-4 py-3 mb-4 rounded-lg
            bg-white/10 text-white
            border border-white/10
            focus:border-purple-500
            focus:ring-2 focus:ring-purple-500/40
            hover:border-purple-400
            outline-none transition
          "
        />

        {/* BUTTON */}
        <button
          className="
            w-full py-3 rounded-lg font-semibold
            bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600
            hover:scale-105 transition
            shadow-[0_0_40px_rgba(236,72,153,0.7)]
            hover:shadow-[0_0_80px_rgba(236,72,153,1)]
            active:scale-95
          "
        >
          {loading ? "Sending..." : "SEND RESET LINK"}
        </button>

        {/* MESSAGE */}
        {message && (
          <p className="mt-4 text-sm text-center text-gray-300">
            {message}
          </p>
        )}

        {/* BACK */}
        <p
          onClick={() => navigate("/login")}
          className="
            mt-4 text-center text-purple-400
            cursor-pointer
            hover:text-pink-400
            hover:underline
            transition
          "
        >
          Back to Login
        </p>

      </form>

    </AuthLayout>
  )
}