import axios from "../api/axios"

export const getProfile = () => {
  return axios.get("/auth/profile")
}

export const updateProfile = (data) => {
  return axios.patch("/auth/profile", data)
}