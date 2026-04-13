import { useEffect, useState } from "react"
import api from "../api/axios"
import EventCard from "./EventCard"
import SkeletonCard from "./SkeletonCard"
import { motion } from "framer-motion"

export default function EventList() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await api.get("/events")
      setEvents(res.data.data)
      setLoading(false)
    }
    fetchEvents()
  }, [])

  return (
    <section className="px-6 py-20 bg-[#0B0F1A]">
      <h2 className="text-4xl font-bold text-white text-center mb-10">
        Upcoming Events
      </h2>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            show: {
              transition: { staggerChildren: 0.15 }
            }
          }}
          className="grid md:grid-cols-3 gap-6"
        >
          {events.map((event) => (
            <motion.div
              key={event.id}
              variants={{
                hidden: { opacity: 0, y: 50 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <EventCard event={event} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  )
}