import { useRef } from "react"

export default function MagneticButton({ children }) {
  const ref = useRef(null)

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    ref.current.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`
  }

  const reset = () => {
    ref.current.style.transform = "translate(0,0)"
  }

  return (
    <button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white transition-all duration-300 hover:scale-105 active:scale-95"
    >
      {children}
    </button>
  )
}