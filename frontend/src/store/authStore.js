import { create } from "zustand"

const useAuthStore = create((set) => ({
  // ================= STATE =================
  user: null,
  token: null,
  isAuthenticated: false,

  // ================= SET AUTH =================
  setAuth: ({ token, user }) => {
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))

    set({
      user,
      token,
      isAuthenticated: true
    })
  },

  // ================= LOAD FROM STORAGE =================
  loadAuth: () => {
    try {
      const token = localStorage.getItem("token")
      const rawUser = localStorage.getItem("user")

      if (!token || !rawUser || rawUser === "undefined") {
        return set({
          user: null,
          token: null,
          isAuthenticated: false
        })
      }

      const user = JSON.parse(rawUser)

      set({
        user,
        token,
        isAuthenticated: true
      })

    } catch (err) {
      console.error("AUTH LOAD ERROR:", err)

      set({
        user: null,
        token: null,
        isAuthenticated: false
      })
    }
  },

  // ================= 🔥 UPDATE USER (PENTING BANGET) =================
  updateUser: (newData) => {
    set((state) => {
      const updatedUser = {
        ...state.user,
        ...newData
      }

      localStorage.setItem("user", JSON.stringify(updatedUser))

      return { user: updatedUser }
    })
  },

  // ================= LOGOUT =================
  logout: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    set({
      user: null,
      token: null,
      isAuthenticated: false
    })
  }
}))

export default useAuthStore