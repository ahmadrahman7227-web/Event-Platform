import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import EventList from "../components/EventList"
import CTASection from "../components/CTASection"
import CursorGlow from "../components/CursorGlow"

export default function Home() {
  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"]
  })

  // ================= HERO =================
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.7])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -200])

  // 🔥 FIX BLUR (NO ERROR)
  const blurValue = useTransform(
    scrollYProgress,
    [0, 1],
    ["blur(0px)", "blur(10px)"]
  )

  // ================= EVENT =================
  const eventOpacity = useTransform(scrollYProgress, [0.2, 0.6], [0, 1])
  const eventY = useTransform(scrollYProgress, [0.2, 0.6], [150, 0])

  // ================= CTA =================
  const ctaOpacity = useTransform(scrollYProgress, [0.6, 1], [0, 1])
  const ctaScale = useTransform(scrollYProgress, [0.6, 1], [0.8, 1])

  return (
    <div ref={ref} className="bg-[#0B0F1A] text-white overflow-x-hidden">

      {/* 🔥 SCROLL PROGRESS BAR */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-50"
        style={{
          scaleX: scrollYProgress,
          transformOrigin: "0%"
        }}
      />

      <CursorGlow />
      <Navbar />

      {/* 🎬 SCENE 1 — HERO */}
      <motion.div
        style={{
          scale: heroScale,
          opacity: heroOpacity,
          y: heroY,
          filter: blurValue
        }}
        className="sticky top-0 h-screen"
      >
        <Hero />
      </motion.div>

      {/* 🎬 SCENE 2 — EVENTS */}
      <motion.div
        style={{
          opacity: eventOpacity,
          y: eventY
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      >
        <EventList />
      </motion.div>

      {/* 🎬 SCENE 3 — CTA */}
      <motion.div
        style={{
          opacity: ctaOpacity,
          scale: ctaScale
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      >
        <CTASection />
      </motion.div>

    </div>
  )
}