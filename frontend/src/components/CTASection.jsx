import { motion } from "framer-motion"

export default function CTASection() {
  return (
    <section className="relative h-screen flex items-center justify-center bg-[#0B0F1A] overflow-hidden">

      {/* GLOW BACKGROUND */}
      <div className="absolute w-[600px] h-[600px] bg-purple-600 blur-[150px] opacity-20" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="text-center z-10"
      >
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Ready to Create Your Event?
        </h2>

        <p className="text-gray-400 mb-8">
          Join thousands of creators building amazing experiences
        </p>

        <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
          Get Started 🚀
        </button>
      </motion.div>

      {/* LIGHT OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    </section>
  )
}