import axios from "axios"
import useAuthStore from "../store/authStore"

// ================= BASE CONFIG =================
const instance = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
})

// ================= REQUEST INTERCEPTOR =================
instance.interceptors.request.use(
  (config) => {
    // 🔥 ambil token dari Zustand (bukan localStorage)
    const token = useAuthStore.getState().token

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ================= RESPONSE INTERCEPTOR =================
instance.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status

    // 🔥 AUTO LOGOUT (TOKEN INVALID / EXPIRED)
    if (status === 401) {
      console.warn("🔒 Unauthorized - auto logout")

      const logout = useAuthStore.getState().logout
      logout()

      // redirect clean
      window.location.href = "/login"
    }

    // 🔥 SERVER ERROR
    if (status === 500) {
      console.error("🔥 Server error")
    }

    // 🔥 NETWORK ERROR
    if (!error.response) {
      console.error("🌐 Network error / backend down")
    }

    return Promise.reject(error)
  }
)

export default instance