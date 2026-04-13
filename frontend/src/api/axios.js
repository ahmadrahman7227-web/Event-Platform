import axios from "axios"
import useAuthStore from "../store/authStore"

// ================= BASE CONFIG =================
const instance = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 5000,
})

// ================= REQUEST INTERCEPTOR =================
instance.interceptors.request.use(
  (config) => {
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

    if (status === 401) {
      console.warn("🔒 Unauthorized - auto logout")
      const logout = useAuthStore.getState().logout
      logout()
      window.location.href = "/login"
    }

    if (status === 500) {
      console.error("🔥 Server error")
    }

    if (!error.response) {
      console.error("🌐 Network error / backend down")
    }

    return Promise.reject(error)
  }
)

export default instance