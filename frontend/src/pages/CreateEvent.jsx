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

    try {
      setLoading(true)

      const formData = new FormData()

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key])
      })

      if (image) {
        formData.append("image", image)
      }

      await api.post("/events", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      toast.success("Event created!")

      navigate("/dashboard")

    } catch (err) {
      toast.error(err.response?.data?.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl mb-6">Create Event</h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input name="title" placeholder="Title" onChange={handleChange} className="input" />
          <textarea name="description" placeholder="Description" onChange={handleChange} className="input" />
          <input name="location" placeholder="Location" onChange={handleChange} className="input" />

          <input name="price" type="number" placeholder="Price" onChange={handleChange} className="input" />
          <input name="availableSeats" type="number" placeholder="Seats" onChange={handleChange} className="input" />

          <input name="startDate" type="datetime-local" onChange={handleChange} className="input" />
          <input name="endDate" type="datetime-local" onChange={handleChange} className="input" />

          {/* IMAGE */}
          <input type="file" onChange={handleImage} />

          {preview && (
            <img src={preview} className="w-full h-48 object-cover rounded" />
          )}

          <button
            disabled={loading}
            className="w-full bg-purple-600 py-3 rounded-lg"
          >
            {loading ? "Creating..." : "Create Event"}
          </button>

        </form>

      </div>
    </div>
  )
}