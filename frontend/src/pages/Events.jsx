import { useEffect, useState } from "react"
import api from "../api/axios"
import toast from "react-hot-toast"
import { motion } from "framer-motion"

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // 🔥 NEW: SEARCH
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // ================= DEBOUNCE =================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // ================= FETCH =================
  useEffect(() => {
    fetchEvents()
  }, [debouncedSearch])

  const fetchEvents = async () => {
    try {
      setLoading(true)

      const res = await api.get(`/events?search=${debouncedSearch}`)
      setEvents(res.data.data || [])
    } catch (err) {
      console.error(err)
      toast.error("Failed to load events")
    } finally {
      setLoading(false)
    }
  }

  // ================= FORMAT =================
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR"
    }).format(price)
  }

  // ================= BOOK =================
  const handleBook = async (eventId) => {
    try {
      await api.post("/transactions", {
        eventId,
        quantity: 1
      })

      toast.success("Booking success!")
      fetchEvents()
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking gagal")
    }
  }

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] p-6 grid md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass p-5 rounded-2xl animate-pulse">
            <div className="h-6 bg-white/10 rounded mb-3"></div>
            <div className="h-4 bg-white/10 rounded mb-2"></div>
            <div className="h-4 bg-white/10 rounded mb-4"></div>
            <div className="h-10 bg-white/10 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  // ================= EMPTY =================
  if (!events.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
        <h2 className="text-xl mb-2">No events found</h2>
        <p>Try different keyword</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">Explore Events</h1>

        {/* 🔥 SEARCH */}
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-full mb-6"
        />

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-6">

          {events.map((event) => (
            <motion.div
              key={event.id}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-5 rounded-2xl shadow-lg"
            >
              <h2 className="text-xl font-semibold mb-2">
                {event.title}
              </h2>

              <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                {event.description}
              </p>

              <div className="text-sm text-gray-300 space-y-1 mb-3">
                <p>📍 {event.location}</p>
                <p>🎟 Seats: {event.availableSeats}</p>
              </div>

              <p className="text-purple-400 font-bold mb-4">
                {formatPrice(event.price)}
              </p>

              <button
                onClick={() => handleBook(event.id)}
                disabled={event.availableSeats === 0}
                className={`
                  w-full py-2 rounded-lg font-semibold transition
                  ${
                    event.availableSeats === 0
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105"
                  }
                `}
              >
                {event.availableSeats === 0 ? "Sold Out" : "Book Now"}
              </button>

            </motion.div>
          ))}

        </div>

      </div>
    </div>
  )
}