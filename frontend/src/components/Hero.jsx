import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function HeroUltra() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)

  // DETECT DEVICE
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // MOUSE PARALLAX
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 40, stiffness: 150 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)

  const rotateX = useTransform(
    smoothY,
    [-500, 500],
    [isMobile ? 0 : 5, isMobile ? 0 : -5]
  )
  const rotateY = useTransform(
    smoothX,
    [-500, 500],
    [isMobile ? 0 : -5, isMobile ? 0 : 5]
  )

  const handleMouseMove = (e) => {
    if (isMobile) return
    const { clientX, clientY } = e
    const { innerWidth, innerHeight } = window
    mouseX.set(clientX - innerWidth / 2)
    mouseY.set(clientY - innerHeight / 2)
  }

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full bg-[#030303] flex items-center justify-center overflow-hidden select-none"
    >

      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] pointer-events-none" />

      {/* CONTENT */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          perspective: 1000,
          transformStyle: "preserve-3d"
        }}
        className="relative z-10 text-center px-6"
      >

        {/* BADGE */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-purple-300">
            Event Platform
          </span>
        </motion.div>

        {/* HEADLINE */}
        <h1 className="text-5xl sm:text-7xl md:text-[100px] font-black tracking-tighter text-white mb-8 leading-[0.9] italic">

          <motion.span
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="block"
          >
            DISCOVER <span className="text-transparent stroke-text">EVENTS</span>
          </motion.span>

          <motion.span
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="block bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-fast"
          >
            CLAIM YOUR ACCESS
          </motion.span>

        </h1>

        {/* DESCRIPTION */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 text-base md:text-xl max-w-2xl mx-auto mb-10"
        >
          Discover, create, and manage events effortlessly.  
          Join thousands of people experiencing events like never before.
        </motion.p>

        {/* 🔥 CTA BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">

          {/* PRIMARY → REGISTER */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/register")}
            className="
              w-full sm:w-auto px-12 py-4 
              bg-gradient-to-r from-purple-600 to-pink-600 
              rounded-xl font-black text-white uppercase 
              tracking-widest text-xs 
              shadow-lg shadow-purple-500/20
            "
          >
            Create Account 
          </motion.button>

          {/* SECONDARY → LOGIN */}
          <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={() => navigate("/login")}
  className="
    w-full sm:w-auto px-10 py-4
    rounded-xl font-bold text-xs uppercase tracking-widest
    border border-white/20
    bg-white/5 backdrop-blur-md
    text-white
    hover:bg-white/10
    hover:border-purple-400
    transition-all duration-300
  "
>
  Login
</motion.button>
          {/* <motion.button
            onClick={() => navigate("/login")}
            className="
              text-white/70 hover:text-white 
              font-bold tracking-widest text-xs uppercase 
              transition-all
            "
          >
            Login
          </motion.button> */}

        </div>

        {/* EXPLORE */}
        <div className="mt-8">
          <button
            onClick={() => navigate("/events")}
            className="text-white/40 hover:text-pink-400 text-xs tracking-widest uppercase transition"
          >
            Explore Events ↓
          </button>
        </div>

      </motion.div>

      {/* DECORATION (DESKTOP ONLY) */}
      {!isMobile && (
        <motion.div
          style={{
            y: useTransform(smoothY, (v) => v * -0.1),
            x: useTransform(smoothX, (v) => v * -0.1)
          }}
          className="absolute top-1/4 left-10 opacity-10 pointer-events-none"
        >
          <div className="w-32 h-32 border-2 border-purple-500 rounded-full" />
        </motion.div>
      )}

      {/* STYLE */}
      <style>{`
        .stroke-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.3);
        }

        @keyframes gradient-fast {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-gradient-fast {
          animation: gradient-fast 4s ease infinite;
        }
      `}</style>

    </section>
  )
}