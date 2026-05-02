"use client"

import { cn } from "@/lib/utils"
import type { Setup } from "@/lib/types"

interface SetupCardProps {
  setup: Setup
  setupState: { flipped: boolean; chatAvg?: number; streamerAvg?: number }
  isFlipping: boolean
  onClick: () => void
}

export function SetupCard({ setup, setupState, isFlipping, onClick }: SetupCardProps) {
  const isFlipped = setupState.flipped || isFlipping
  const media = setup.attachments.find((a) => a.type === "image") ?? setup.attachments.find((a) => a.type === "video")
  const src = media?.url ?? setup.avatar

  function calculateTotal() {
    if (setupState.chatAvg === undefined && setupState.streamerAvg === undefined) return "-"
    const total =
      ((setupState.chatAvg ?? 0) + (setupState.streamerAvg ?? 0)) /
      ((setupState.chatAvg !== undefined ? 1 : 0) + (setupState.streamerAvg !== undefined ? 1 : 0))
    return total.toFixed(1)
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "card-flip-perspective w-full cursor-pointer",
        setupState.flipped && "opacity-90",
        !setupState.flipped && "hover:scale-[1.02] transition-transform duration-200"
      )}
    >
      <div className={cn("card-flip-inner relative aspect-[4/3] w-full", isFlipped && "flipped")}>
        <div className="card-flip-face absolute inset-0 rounded-xl ring-1 ring-foreground/10 bg-muted flex flex-col items-center justify-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={setup.avatar}
            alt={setup.nickname}
            className="h-16 w-16 rounded-full object-cover ring-2 ring-foreground/20"
          />
          <span className="text-sm font-medium text-muted-foreground">{setup.nickname}</span>
        </div>

        <div className="card-flip-face card-flip-front absolute inset-0 rounded-xl overflow-hidden ring-1 ring-foreground/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={setup.nickname}
            className="h-full w-full object-cover"
          />
          {!setupState.flipped && (
            <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/80 to-transparent px-2 py-1 text-xs font-medium text-foreground truncate">
              {setup.nickname}
            </span>
          )}
          {setupState.flipped && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="text-lg font-bold text-foreground">{calculateTotal()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}