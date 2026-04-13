export default function StatusBadge({ status }) {
  const colors = {
    PENDING: "bg-yellow-500",
    ACCEPTED: "bg-green-500",
    REJECTED: "bg-red-500"
  }

  return (
    <span className={`px-2 py-1 rounded text-xs ${colors[status]}`}>
      {status}
    </span>
  )
}