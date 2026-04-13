import { useEffect, useState } from "react"
import api from "../api/axios"
import toast from "react-hot-toast"
import useAuthStore from "../store/authStore"

export default function Profile() {
  const { user: authUser, updateUser } = useAuthStore()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)

  
  // ================= FETCH =================
const fetchProfile = async () => {
  try {
    const token = localStorage.getItem("token")

    const res = await api.get("/profile", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    setUser(res.data.data)
    setError(false)
  } catch (err) {
    console.error(err)
    setError(true)
    toast.error("Backend tidak terhubung")
  } finally {
    setLoading(false)
  }
}

// 🔥 TAMBAHKAN INI
useEffect(() => {
  fetchProfile()
}, [])

  // ================= CLEANUP PREVIEW =================
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  // ================= IMAGE =================
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      return toast.error("File harus gambar")
    }

    if (file.size > 2 * 1024 * 1024) {
      return toast.error("Max 2MB")
    }

    setImage(file)
    setPreview(URL.createObjectURL(file))
  }


//   const handleUpload = async () => {
//   if (!image) return alert("Pilih gambar dulu")

//   const formData = new FormData()
//   formData.append("image", image)

//   try {
//     const res = await fetch("http://localhost:3000/api/auth/upload-profile", {
//       method: "PATCH",
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("token")}`
//       },
//       body: formData
//     })

//     const data = await res.json()
//     console.log(data)

//   } catch (err) {
//     console.error(err)
//   }
// }

  const handleUpload = async () => {
    if (!image) return toast.error("Pilih gambar dulu")

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append("image", image)

      const res = await api.patch("/auth/upload-profile", formData)

      const newImage = res.data.data.profileImage // SESUAI RESPONSE BACKEND

      toast.success("Foto berhasil diupdate")

      // 🔥 update local state
      setUser((prev) => ({
        ...prev,
        profileImage: newImage
      }))

      // 🔥 update global store (INI KUNCI NAVBAR UPDATE)
      updateUser({ profileImage: newImage })

      setImage(null)
      setPreview(null)

    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || "Upload gagal")
    } finally {
      setUploading(false)
    }
  }

  // ================= PASSWORD =================
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const validatePassword = (pwd) => {
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[!@#$%^&*]/.test(pwd)
    )
  }

  const handleChangePassword = async () => {
    setPasswordError("")
    setPasswordSuccess("")

    if (!validatePassword(passwordForm.newPassword)) {
      return setPasswordError("Password tidak kuat")
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordError("Konfirmasi tidak sama")
    }

    try {
      setPasswordLoading(true)

      await api.patch("/auth/change-password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      })

      toast.success("Password updated")

      setPasswordSuccess("Password berhasil diubah")
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      })

    } catch (err) {
      setPasswordError(err.response?.data?.message || "Gagal")
    } finally {
      setPasswordLoading(false)
    }
  }

  // ================= COPY =================
  const handleCopy = () => {
    if (!user?.referralCode) return
    navigator.clipboard.writeText(user.referralCode)
    toast.success("Copied!")
  }

  // ================= STATES =================
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0B0F1A] text-white">
        Loading profile...
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-red-400 bg-[#0B0F1A]">
        <p>Backend tidak terhubung</p>
        <button onClick={fetchProfile} className="mt-4 px-4 py-2 bg-purple-600 rounded">
          Retry
        </button>
      </div>
    )
  }

  if (!user) {
    return <p className="text-center text-gray-400 mt-20">No profile data</p>
  }

  // ================= UI =================
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        <h1 className="text-3xl font-bold">Profile</h1>

        {/* PROFILE */}
        <div className="glass p-6 rounded-2xl flex flex-col md:flex-row gap-6">

          {/* IMAGE */}
          <div className="text-center">
            <img
              src={
                preview ||
                user.profileImage ||
                `https://ui-avatars.com/api/?name=${user.email}`
              }
              className="w-32 h-32 rounded-full object-cover border-2 border-purple-500"
            />

            <input type="file" onChange={handleImageChange} className="mt-3 text-sm" />

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-3 px-4 py-2 bg-purple-600 rounded-lg"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {/* INFO */}
          <div className="space-y-3">
            <p>📧 {user.email}</p>
            <p>👤 {user.role}</p>

            <div className="flex gap-2 items-center">
              <span className="text-purple-400 font-bold">
                {user.referralCode}
              </span>
              <button onClick={handleCopy} className="text-sm underline">
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* POINTS */}
        <div className="glass p-6 rounded-2xl">
          <h2 className="mb-2">Points</h2>
          <p className="text-2xl text-purple-400">
            {user.points || 0}
          </p>
        </div>

        {/* COUPONS */}
        <div className="glass p-6 rounded-2xl">
          <h2 className="mb-2">Coupons</h2>

          {!user.coupons?.length ? (
            <p className="text-gray-400">No coupons</p>
          ) : (
            user.coupons.map((c) => (
              <div key={c.id} className="flex justify-between border-b border-white/10 py-2">
                <span>{c.code}</span>
                <span>{c.discount}%</span>
              </div>
            ))
          )}
        </div>

        {/* PASSWORD */}
        <div className="glass p-6 rounded-2xl">
          <h2 className="mb-3">Change Password</h2>

          <input
            name="oldPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Old Password"
            value={passwordForm.oldPassword}
            onChange={handlePasswordChange}
            className="input mb-2"
          />

          <input
            name="newPassword"
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            className="input mb-2"
          />

          <input
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            className="input mb-2"
          />

          <label className="text-sm">
            <input
              type="checkbox"
              onChange={() => setShowPassword(!showPassword)}
            /> Show Password
          </label>

          {passwordError && <p className="text-red-400">{passwordError}</p>}
          {passwordSuccess && <p className="text-green-400">{passwordSuccess}</p>}

          <button
            onClick={handleChangePassword}
            disabled={passwordLoading}
            className="mt-3 px-4 py-2 bg-purple-600 rounded"
          >
            {passwordLoading ? "Updating..." : "Update Password"}
          </button>
        </div>

      </div>
    </div>
  )
}