import { useEffect, useState } from "react"
import { getProfile } from "../services/user.service"
import axios from "../utils/axios"

export default function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)

  // 🔐 PASSWORD STATE
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await getProfile()
      setUser(res.data.user)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 📸 IMAGE HANDLER
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setImage(file)

    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleUpload = async () => {
    if (!image) return

    const formData = new FormData()
    formData.append("image", image)

    try {
      await axios.patch("/auth/profile", formData)
      fetchProfile()
      alert("Profile updated!")
    } catch (err) {
      console.error(err)
    }
  }

  // 📋 COPY REFERRAL
  const handleCopy = () => {
    navigator.clipboard.writeText(user.referralCode)
    alert("Referral copied!")
  }

  // 🔐 PASSWORD VALIDATION
  const passwordChecks = {
    length: (val) => val.length >= 8,
    upper: (val) => /[A-Z]/.test(val),
    lower: (val) => /[a-z]/.test(val),
    number: (val) => /[0-9]/.test(val),
    symbol: (val) => /[!@#$%^&*]/.test(val),
    noSpace: (val) => !/\s/.test(val)
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleChangePassword = async () => {
    setPasswordError("")
    setPasswordSuccess("")

    const pwd = passwordForm.newPassword

    if (!Object.values(passwordChecks).every((fn) => fn(pwd))) {
      setPasswordError("Password tidak memenuhi syarat")
      return
    }

    if (pwd !== passwordForm.confirmPassword) {
      setPasswordError("Konfirmasi password tidak sama")
      return
    }

    try {
      setPasswordLoading(true)

      await axios.patch("/auth/change-password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      })

      setPasswordSuccess("Password berhasil diubah")

      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      })

    } catch (err) {
      setPasswordError(
        err.response?.data?.message || "Gagal ubah password"
      )
    } finally {
      setPasswordLoading(false)
    }
  }

  // CHECKLIST UI
  const Requirement = ({ valid, text }) => (
    <div className="flex items-center gap-2 text-xs">
      <span className={`w-4 h-4 flex items-center justify-center rounded-full ${valid ? "bg-green-500" : "bg-red-500"}`}>
        {valid ? "✔" : "✖"}
      </span>
      <span className={valid ? "text-green-400" : "text-red-400"}>
        {text}
      </span>
    </div>
  )

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6">

      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">Profile</h1>

        {/* PROFILE */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-6">

          <div className="text-center">
            <img
              src={preview || user.image || "https://via.placeholder.com/150"}
              className="w-32 h-32 rounded-full object-cover border"
            />

            <input type="file" onChange={handleImageChange} className="mt-2" />

            <button
              onClick={handleUpload}
              className="mt-2 px-4 py-2 bg-purple-500 rounded"
            >
              Upload
            </button>
          </div>

          <div>
            <p>Email: {user.email}</p>

            <div className="flex gap-2 items-center">
              <p>Referral: {user.referralCode}</p>
              <button onClick={handleCopy}>Copy</button>
            </div>

            <p>Role: {user.role}</p>
          </div>

        </div>

        {/* POINTS */}
        <div className="mt-6 bg-white/5 p-6 rounded-2xl border border-white/10">
          <h2>Points</h2>
          <p>{user.points || 0}</p>
        </div>

        {/* COUPONS */}
        <div className="mt-6 bg-white/5 p-6 rounded-2xl border border-white/10">
          <h2>Coupons</h2>

          {user.coupons?.length === 0 ? (
            <p>No coupons</p>
          ) : (
            user.coupons.map((c) => (
              <div key={c.id}>
                {c.code} - {c.discount}%
              </div>
            ))
          )}
        </div>

        {/* 🔐 CHANGE PASSWORD */}
        <div className="mt-6 bg-white/5 p-6 rounded-2xl border border-white/10">

          <h2 className="mb-4">Change Password</h2>

          <input
            name="oldPassword"
            value={passwordForm.oldPassword}
            onChange={handlePasswordChange}
            type="password"
            placeholder="Old Password"
            className="w-full mb-2"
          />

          <input
            name="newPassword"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            type="password"
            placeholder="New Password"
            className="w-full mb-2"
          />

          <div className="space-y-1">
            <Requirement valid={passwordChecks.length(passwordForm.newPassword)} text="Min 8 karakter" />
            <Requirement valid={passwordChecks.upper(passwordForm.newPassword)} text="Huruf besar" />
            <Requirement valid={passwordChecks.lower(passwordForm.newPassword)} text="Huruf kecil" />
            <Requirement valid={passwordChecks.number(passwordForm.newPassword)} text="Angka" />
            <Requirement valid={passwordChecks.symbol(passwordForm.newPassword)} text="Simbol" />
            <Requirement valid={passwordChecks.noSpace(passwordForm.newPassword)} text="No space" />
          </div>

          <input
            name="confirmPassword"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            type="password"
            placeholder="Confirm Password"
            className="w-full mt-2"
          />

          {passwordError && <p className="text-red-400">{passwordError}</p>}
          {passwordSuccess && <p className="text-green-400">{passwordSuccess}</p>}

          <button
            onClick={handleChangePassword}
            className="mt-3 px-4 py-2 bg-purple-500 rounded"
          >
            Update Password
          </button>

        </div>

      </div>

    </div>
  )
}