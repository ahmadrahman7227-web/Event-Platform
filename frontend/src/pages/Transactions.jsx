import { useEffect, useState } from "react"
import api from "../api/axios"
import toast from "react-hot-toast"
import { motion } from "framer-motion"

export default function Transactions() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await api.get("/transactions/me")
      setData(res.data.data || [])
    } catch (err) {
      console.error(err)
      toast.error("Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }

  // ================= FORMAT PRICE =================
  const formatPrice = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR"
    }).format(num)
  }

  // ================= STATUS STYLE =================
  const getStatusStyle = (status) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "REJECTED":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    }
  }

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] p-6 grid md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-28 bg-white/10 animate-pulse rounded-xl"
          />
        ))}
      </div>
    )
  }

  // ================= EMPTY =================
  if (!data.length) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400">
        No transactions yet
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* TITLE */}
        <h1 className="text-3xl font-bold">My Transactions</h1>

        {/* LIST */}
        <div className="grid md:grid-cols-2 gap-4">

          {data.map((t) => (
            <motion.div
              key={t.id}
              whileHover={{ scale: 1.03 }}
              className="
                bg-white/5 backdrop-blur-xl
                border border-white/10
                rounded-2xl p-5
                shadow-lg transition
              "
            >
              {/* HEADER */}
              <div className="flex justify-between items-start mb-3">

                <div>
                  <h2 className="text-lg font-semibold">
                    {t.event?.title || "Event"}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <span
                  className={`
                    px-3 py-1 text-xs rounded-full border
                    ${getStatusStyle(t.status)}
                  `}
                >
                  {t.status}
                </span>

              </div>

              {/* BODY */}
              <div className="space-y-2 text-sm text-gray-300">

                <div className="flex justify-between">
                  <span>Quantity</span>
                  <span>{t.quantity}</span>
                </div>

                <div className="flex justify-between">
                  <span>Total Price</span>
                  <span className="text-purple-400 font-semibold">
                    {formatPrice(t.totalPrice)}
                  </span>
                </div>

                {t.usedPoints > 0 && (
                  <div className="flex justify-between text-blue-400">
                    <span>Points Used</span>
                    <span>-{formatPrice(t.usedPoints)}</span>
                  </div>
                )}

                {t.coupon && (
                  <div className="flex justify-between text-green-400">
                    <span>Coupon</span>
                    <span>{t.coupon.code}</span>
                  </div>
                )}

              </div>

            </motion.div>
          ))}

        </div>

      </div>
    </div>
  )
}