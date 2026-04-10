import { useEffect, useRef, useState } from "react"

import bg from "../assets/bg.mp4"
import character from "../assets/CHARACTER.jpg"
import texture from "../assets/TEXTURE.png"
import music from "../assets/phonk-music.mp3"

export default function AuthLayout({ children }) {
  const audioRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const handleUserInteraction = () => {
      if (audioRef.current) {
        audioRef.current.volume = 0.05
        audioRef.current.play().catch(() => {})
      }
      setReady(true)
      window.removeEventListener("click", handleUserInteraction)
    }

    window.addEventListener("click", handleUserInteraction)

    return () => {
      window.removeEventListener("click", handleUserInteraction)
    }
  }, [])

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white">

      {/* VIDEO */}
      <video autoPlay loop muted playsInline className="absolute w-full h-full object-cover scale-110">
        <source src={bg} type="video/mp4" />
      </video>

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_60%)]" />

      {/* CHARACTER */}
      <img
        src={character}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-40 blur-[3px] scale-110 pointer-events-none"
      />

      {/* TEXTURE */}
      <div
        className="absolute inset-0 mix-blend-overlay opacity-10"
        style={{ backgroundImage: `url(${texture})` }}
      />

      {/* CONTENT */}
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        {children}
      </div>

      {/* SOUND */}
      <audio ref={audioRef} loop>
        <source src={music} type="audio/mpeg" />
      </audio>

      {!ready && (
        <div className="absolute bottom-6 w-full text-center text-gray-400 text-sm">
          Click anywhere to enable sound 🔊
        </div>
      )}
    </div>
  )
}