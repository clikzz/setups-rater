"use client"

import { X } from "lucide-react"

interface ResultsModalProps {
  chatAvg: number | null
  streamerVote: number
  streamerWeight: number
  onClose: () => void
}

function fmt(value: number | null): string {
  if (value === null || value === undefined) return "-"
  return value.toFixed(1)
}

export function ResultsModal({ chatAvg, streamerVote, streamerWeight, onClose }: ResultsModalProps) {
  const chatWeight = 100 - streamerWeight

  function calculateTotal(): string {
    if (chatAvg === null) return "-"
    if (streamerWeight === 100) return fmt(streamerVote)
    if (chatWeight === 100) return fmt(chatAvg)
    const total = (chatAvg * chatWeight + streamerVote * streamerWeight) / 100
    return total.toFixed(1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        <h3 className="mb-6 text-center text-xl font-bold text-foreground">
          Resultados
        </h3>

        <div className="mb-6 text-center">
          <span className="mb-2 block text-sm text-muted-foreground">Total</span>
          <span className="text-6xl font-black text-primary">{calculateTotal()}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center gap-1 rounded-xl bg-muted p-4">
            <span className="text-xs text-muted-foreground">Chat</span>
            <span className="text-3xl font-bold text-foreground">{fmt(chatAvg)}</span>
            <span className="text-xs text-muted-foreground">{chatWeight}%</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl bg-muted p-4">
            <span className="text-xs text-muted-foreground">Tu</span>
            <span className="text-3xl font-bold text-foreground">{fmt(streamerVote)}</span>
            <span className="text-xs text-muted-foreground">{streamerWeight}%</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-primary px-4 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Volver al grid
        </button>
      </div>
    </div>
  )
}