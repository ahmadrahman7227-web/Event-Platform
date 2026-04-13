import { create } from "zustand"

const useAuthStore = create((set, get) => ({
  // ================= STATE =================
  user: null,
  token: null,
  isAuthenticated: false,

  // ================= SET AUTH =================
  setAuth: ({ token, user }) => {
    try {
      if (!token || !user) throw new Error("Invalid auth data")

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      set({
        user,
        token,
        isAuthenticated: true
      })
    } catch (err) {
      console.error("SET AUTH ERROR:", err)
    }
  },

  // ================= LOAD AUTH =================
  loadAuth: () => {
    try {
      const token = localStorage.getItem("token")
      const rawUser = localStorage.getItem("user")

      // 🔥 VALIDATION STRONG
      if (!token || !rawUser || rawUser === "undefined") {
        return get().clearAuth()
      }

      const user = JSON.parse(rawUser)

      // 🔥 OPTIONAL VALIDATION
      if (!user?.id || !user?.email) {
        return get().clearAuth()
      }

      set({
        user,
        token,
        isAuthenticated: true
      })
    } catch (err) {
      console.error("AUTH LOAD ERROR:", err)
      get().clearAuth()
    }
  },

  // ================= UPDATE USER =================
  updateUser: (newData) => {
    try {
      const currentUser = get().user

      if (!currentUser) return

      const updatedUser = {
        ...currentUser,
        ...newData
      }

      localStorage.setItem("user", JSON.stringify(updatedUser))

      set({ user: updatedUser })
    } catch (err) {
      console.error("UPDATE USER ERROR:", err)
    }
  },

  // ================= CLEAR AUTH =================
  clearAuth: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    set({
      user: null,
      token: null,
      isAuthenticated: false
    })
  },

  // ================= LOGOUT =================
  logout: () => {
    get().clearAuth()
  },

  // ================= HELPERS =================
  isOrganizer: () => get().user?.role === "ORGANIZER",
  isCustomer: () => get().user?.role === "CUSTOMER"
}))

// ================= 🔥 AUTO SYNC ANTAR TAB =================
window.addEventListener("storage", (e) => {
  if (e.key === "token" || e.key === "user") {
    useAuthStore.getState().loadAuth()
  }
})

export default useAuthStore