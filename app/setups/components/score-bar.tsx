"use client"

interface ScoreBarProps {
  chatAvg: number | null
  chatVoteCount: number | null
  streamerVote: number
  streamerWeight: number
  chatWeight: number
  isVotingActive: boolean
}

function fmt(value: number | null): string {
  if (value === null || value === undefined) return "-"
  return value.toFixed(1)
}

export function ScoreBar({ chatAvg, chatVoteCount, streamerVote, streamerWeight, chatWeight, isVotingActive }: ScoreBarProps) {
  function calculateTotal(): string {
    if (chatAvg === null && !isVotingActive) return "-"
    if (streamerWeight === 100) return fmt(streamerVote)
    if (chatWeight === 100) return fmt(chatAvg)
    const chat = chatAvg ?? 0
    const streamer = streamerVote
    const total = (chat * chatWeight + streamer * streamerWeight) / 100
    return total.toFixed(1)
  }

  const chatLabel = chatVoteCount !== null
    ? `${chatWeight}% · ${chatVoteCount} votos`
    : `${chatWeight}%`

  return (
    <div className="grid grid-cols-3 gap-4 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-muted-foreground">Chat</span>
        <span className="text-2xl font-bold text-foreground">{fmt(chatAvg)}</span>
        <span className="text-xs text-muted-foreground">{chatLabel}</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-muted-foreground">Tu</span>
        <span className="text-2xl font-bold text-foreground">{fmt(streamerVote)}</span>
        <span className="text-xs text-muted-foreground">{streamerWeight}%</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-muted-foreground">Total</span>
        <span className="text-2xl font-bold text-primary">{calculateTotal()}</span>
        <span className="text-xs text-muted-foreground">100%</span>
      </div>
    </div>
  )
}