import { useRef } from "react"

export default function EventCard({ event }) {
  const ref = useRef(null)

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = -(y - centerY) / 15
    const rotateY = (x - centerX) / 15

    ref.current.style.transform = `
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.05)
    `

    ref.current.style.background = `
      radial-gradient(circle at ${x}px ${y}px,
      rgba(255,255,255,0.15),
      transparent 40%)
    `
  }

  const reset = () => {
    ref.current.style.transform = "rotateX(0) rotateY(0) scale(1)"
    ref.current.style.background = "rgba(255,255,255,0.05)"
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-white transition-all duration-200"
    >
      <h2 className="text-lg font-bold">{event.title}</h2>
      <p className="text-gray-400">{event.location}</p>
      <p className="text-blue-400 font-semibold mt-2">
        Rp {event.price}
      </p>
    </div>
  )
}