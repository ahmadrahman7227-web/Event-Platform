import { useState } from "react"
import api from "../api/axios"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

export default function CreateEvent() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    availableSeats: "",
    startDate: "",
    endDate: ""
  })

  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.title || !form.startDate || !form.endDate) {
      return toast.error("Lengkapi data event")
    }

    if (form.endDate < form.startDate) {
      return toast.error("Tanggal tidak valid")
    }

    try {
      setLoading(true)

      const formData = new FormData()

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key])
      })

      if (image) {
        formData.append("image", image)
      }

      await api.post("/events", formData) // 🔥 TANPA HEADER

      toast.success("Event created!")
      navigate("/dashboard")

    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white flex justify-center items-center p-6">
      <div className="w-full max-w-2xl bg-[#111827] p-6 rounded-2xl shadow-xl space-y-6">

        <h1 className="text-3xl font-bold text-center">Create Event</h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* TITLE */}
          <input
            name="title"
            placeholder="Event Title"
            onChange={handleChange}
            className="input"
          />

          {/* DESCRIPTION */}
          <textarea
            name="description"
            placeholder="Event Description"
            onChange={handleChange}
            className="input h-24"
          />

          {/* LOCATION */}
          <input
            name="location"
            placeholder="Location"
            onChange={handleChange}
            className="input"
          />

          {/* PRICE */}
          <input
            name="price"
            placeholder="Contoh: Rp 50.000 / $10"
            onChange={handleChange}
            className="input"
          />

          {/* SEATS */}
          <input
            name="availableSeats"
            type="number"
            placeholder="Jumlah kursi"
            onChange={handleChange}
            className="input"
          />

          {/* DATE SECTION */}
          <div className="bg-[#1F2937] p-4 rounded-xl space-y-4">

            <div>
              <label className="text-sm text-gray-400">Start</label>
              <input
                type="datetime-local"
                name="startDate"
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">End</label>
              <input
                type="datetime-local"
                name="endDate"
                onChange={handleChange}
                className="input"
              />
            </div>

          </div>

          {/* IMAGE */}
          <div className="border border-dashed border-white/20 p-4 rounded-xl text-center">
            <label className="cursor-pointer">
              Upload Image
              <input type="file" hidden onChange={handleImage} />
            </label>

            {preview && (
              <img
                src={preview}
                className="mt-4 w-full h-48 object-cover rounded-xl"
              />
            )}
          </div>

          {/* BUTTON */}
          <button
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-xl font-semibold transition"
          >
            {loading ? "Creating..." : "Create Event"}
          </button>

        </form>
      </div>
    </div>
  )
}




