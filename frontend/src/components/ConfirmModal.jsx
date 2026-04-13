export default function ConfirmModal({ open, onClose, onConfirm, title }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="glass p-6 rounded-xl w-80 text-center">

        <h2 className="mb-4">{title}</h2>

        <div className="flex gap-2 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 rounded"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 rounded"
          >
            Confirm
          </button>
        </div>

      </div>
    </div>
  )
}