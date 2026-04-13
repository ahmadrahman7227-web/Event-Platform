import { useEffect, useState } from "react"
import api from "../api/axios"
import toast from "react-hot-toast"

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // ================= FETCH EVENTS =================
  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events")
      setEvents(res.data.data || [])
    } catch (err) {
      console.error(err)
      toast.error("Failed to load events")
    } finally {
      setLoading(false)
    }
  }

  // ================= FORMAT PRICE =================
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR"
    }).format(price)
  }

  // ================= HANDLE BOOK =================
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
          <div
            key={i}
            className="h-60 bg-white/10 animate-pulse rounded-xl"
          />
        ))}
      </div>
    )
  }

  // ================= EMPTY =================
  if (!events.length) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400">
        No events available
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">Explore Events</h1>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-6">

          {events.map((event) => (
            <div
              key={event.id}
              className="
                bg-white/5 backdrop-blur-xl 
                border border-white/10 
                rounded-2xl p-5 
                hover:scale-105 transition
                shadow-lg
              "
            >
              {/* TITLE */}
              <h2 className="text-xl font-semibold mb-2">
                {event.title}
              </h2>

              {/* DESC */}
              <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                {event.description}
              </p>

              {/* INFO */}
              <div className="text-sm text-gray-300 space-y-1 mb-3">
                <p>📍 {event.location}</p>
                <p>🎟 Seats: {event.availableSeats}</p>
              </div>

              {/* PRICE */}
              <p className="text-purple-400 font-bold mb-4">
                {formatPrice(event.price)}
              </p>

              {/* BUTTON */}
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

            </div>
          ))}

        </div>

      </div>
    </div>
  )
}