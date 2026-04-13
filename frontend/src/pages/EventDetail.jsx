import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../api/axios"
import toast from "react-hot-toast"
import { motion } from "framer-motion"

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [user, setUser] = useState(null)

  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)

  const [quantity, setQuantity] = useState(1)
  const [usePoints, setUsePoints] = useState(false)
  const [couponCode, setCouponCode] = useState("")

  // ================= FETCH =================
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [eventRes, profileRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get("/auth/profile")
      ])

      setEvent(eventRes.data.data)
      setUser(profileRes.data.data)
    } catch {
      toast.error("Failed to load")
      navigate("/events")
    } finally {
      setLoading(false)
    }
  }

  // ================= GUARD =================
  if (!event) {
    return (
      <div className="text-center text-gray-400 mt-20">
        Event not found
      </div>
    )
  }

  // ================= PRICE ENGINE =================
  const price = event.price || 0
  const subtotal = price * quantity

  // 🔥 COUPON
  const validCoupon = user?.coupons?.find(
    (c) =>
      c.code === couponCode &&
      !c.isUsed &&
      new Date(c.expiresAt) > new Date()
  )

  const isCouponValid = !!validCoupon

  const discount = isCouponValid
    ? (subtotal * validCoupon.discount) / 100
    : 0

  // 🔥 POINTS
  const availablePoints = user?.points || 0

  const pointsUsed = usePoints
    ? Math.min(availablePoints, subtotal - discount)
    : 0

  const total = Math.max(0, subtotal - discount - pointsUsed)

  // ================= QUANTITY =================
  const maxQty = event.availableSeats || 0

  const increaseQty = () => {
    setQuantity((q) => Math.min(maxQty, q + 1))
  }

  const decreaseQty = () => {
    setQuantity((q) => Math.max(1, q - 1))
  }

  // ================= BUTTON =================
  const isDisabled =
    booking ||
    quantity > maxQty ||
    maxQty === 0 ||
    (couponCode && !isCouponValid)

  // ================= FORMAT =================
  const formatPrice = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR"
    }).format(num)

  // ================= BOOK =================
  const handleBooking = async () => {
    try {
      setBooking(true)

      await api.post("/transactions", {
        eventId: event.id,
        quantity,
        usePoints,
        couponCode: couponCode || null
      })

      toast.success("Booking success!")
      navigate("/transactions")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed")
    } finally {
      setBooking(false)
    }
  }

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center text-white">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold"
        >
          {event.title}
        </motion.h1>

        {/* DESCRIPTION */}
        <div className="glass p-4 rounded-xl">
          <p>{event.description}</p>
        </div>

        {/* BOOKING */}
        <div className="glass p-6 rounded-2xl space-y-4">

          <h2 className="text-xl font-semibold">Booking</h2>

          {/* QUANTITY */}
          <div className="flex items-center gap-3">
            <button onClick={decreaseQty} className="px-3 py-1 bg-white/10 rounded">-</button>
            <span>{quantity}</span>
            <button onClick={increaseQty} className="px-3 py-1 bg-white/10 rounded">+</button>
          </div>

          <p className="text-sm text-gray-400">
            Available Seats: {maxQty}
          </p>

          {/* COUPON */}
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Coupon code"
            className="input"
          />

          {couponCode && !isCouponValid && (
            <p className="text-red-400 text-sm">
              Invalid / expired coupon
            </p>
          )}

          {isCouponValid && (
            <p className="text-green-400 text-sm">
              Coupon applied ({validCoupon.discount}%)
            </p>
          )}

          {/* POINTS */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={usePoints}
              onChange={() => setUsePoints(!usePoints)}
            />
            Use Points ({availablePoints})
          </label>

          {/* PRICE */}
          <div className="bg-black/30 p-4 rounded space-y-2 text-sm">

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Coupon</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}

            {pointsUsed > 0 && (
              <div className="flex justify-between text-blue-400">
                <span>Points</span>
                <span>-{formatPrice(pointsUsed)}</span>
              </div>
            )}

            <div className="flex justify-between text-lg font-bold text-purple-400 border-t pt-2">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

          </div>

          {/* BUTTON */}
          <button
            onClick={handleBooking}
            disabled={isDisabled}
            className={`
              w-full py-3 rounded-lg font-semibold transition
              ${
                isDisabled
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105"
              }
            `}
          >
            {booking ? "Processing..." : "Confirm Booking"}
          </button>

        </div>

      </div>
    </div>
  )
}