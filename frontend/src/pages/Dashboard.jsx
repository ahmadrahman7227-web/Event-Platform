import { useEffect, useState } from "react"
import api from "../api/axios"
import toast from "react-hot-toast"
import { motion } from "framer-motion"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, transRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/transactions/organizer")
      ])

      setStats(statsRes.data.data)
      setTransactions(transRes.data.data)
    } catch {
      toast.error("Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] p-6 grid md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass p-6 rounded-2xl animate-pulse">
            <div className="h-6 bg-white/10 mb-2"></div>
            <div className="h-10 bg-white/10"></div>
          </div>
        ))}
      </div>
    )
  }

  // ================= EMPTY =================
  if (!stats) {
    return (
      <div className="text-center text-gray-400 mt-20">
        No dashboard data
      </div>
    )
  }

  const chartData = transactions.map((t) => ({
    name: t.event.title.slice(0, 5),
    value: t.totalPrice
  }))

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        <h1 className="text-3xl font-bold">Dashboard</h1>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: "Events", value: stats.totalEvents },
            { label: "Transactions", value: stats.totalTransactions },
            { label: "Revenue", value: `Rp ${stats.totalRevenue}` }
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="glass p-6 rounded-2xl shadow-lg"
            >
              <p className="text-gray-400">{item.label}</p>
              <h2 className="text-2xl font-bold">{item.value}</h2>
            </motion.div>
          ))}
        </div>

        {/* CHART */}
        <div className="glass p-6 rounded-2xl">
          <h2 className="mb-4 font-semibold">Revenue Chart</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* TRANSACTIONS */}
        <div className="glass p-6 rounded-2xl space-y-3">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>

          {transactions.map((t) => (
            <motion.div
              key={t.id}
              whileHover={{ scale: 1.02 }}
              className="flex justify-between border-b border-white/10 pb-2"
            >
              <span>{t.user.email}</span>
              <span>{t.event.title}</span>
              <span className={
                t.status === "ACCEPTED"
                  ? "text-green-400"
                  : t.status === "REJECTED"
                  ? "text-red-400"
                  : "text-yellow-400"
              }>
                {t.status}
              </span>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  )
}