"use client"

import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AppState, Setup } from "@/lib/types"

type SortMode = "weighted" | "streamer" | "chat"

interface LeaderboardModalProps {
  setups: Setup[]
  state: AppState
  streamerWeight: number
  onClose: () => void
}

function getScore(s: { chatAvg?: number; streamerAvg?: number } | undefined, mode: SortMode, streamerWeight: number): number | null {
  if (!s) return null
  if (mode === "streamer") return s.streamerAvg ?? null
  if (mode === "chat") return s.chatAvg ?? null
  const chatWeight = 100 - streamerWeight
  if (s.chatAvg === undefined && s.streamerAvg === undefined) return null
  if (streamerWeight === 100) return s.streamerAvg ?? null
  if (chatWeight === 100) return s.chatAvg ?? null
  return ((s.chatAvg ?? 0) * chatWeight + (s.streamerAvg ?? 0) * streamerWeight) / 100
}

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = ["#f59e0b", "#ef4444", "#3b82f6", "#22c55e", "#a855f7", "#ec4899", "#06b6d4"]
    const particles: { x: number; y: number; w: number; h: number; color: string; vx: number; vy: number; rotation: number; vr: number }[] = []

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 10 + 5,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
      })
    }

    let animId: number
    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05
        p.rotation += p.vr

        if (p.y > canvas!.height + 20) {
          p.y = -20
          p.x = Math.random() * canvas!.width
          p.vy = Math.random() * 3 + 2
        }

        ctx!.save()
        ctx!.translate(p.x, p.y)
        ctx!.rotate((p.rotation * Math.PI) / 180)
        ctx!.fillStyle = p.color
        ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx!.restore()
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[60]"
    />
  )
}

const MODE_LABELS: { key: SortMode; label: string }[] = [
  { key: "weighted", label: "Ponderado" },
  { key: "streamer", label: "Streamer" },
  { key: "chat", label: "Chat" },
]

export function LeaderboardModal({ setups, state, streamerWeight, onClose }: LeaderboardModalProps) {
  const [sortMode, setSortMode] = useState<SortMode>("weighted")

  const ranked = setups
    .map((setup) => {
      const s = state.setups[setup.id]
      if (!s?.flipped) return null
      const score = getScore(s, sortMode, streamerWeight)
      if (score === null) return null
      return { setup, score }
    })
    .filter((x): x is { setup: Setup; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)

  return (
    <>
      <Confetti />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
        <div
          className="mx-4 w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </button>

          <h2 className="mb-4 text-center text-2xl font-black text-foreground">
            Leaderboard
          </h2>

          <div className="mb-5 flex rounded-lg border border-border bg-muted p-1">
            {MODE_LABELS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortMode(key)}
                className={cn(
                  "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  sortMode === key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {ranked.length > 0 && (
            <div className="mb-6 flex items-end justify-center gap-3">
              {ranked[1] && (
                <div className="flex flex-col items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ranked[1].setup.avatar}
                    alt={ranked[1].setup.nickname}
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-muted-foreground/30"
                  />
                  <div className="mt-1.5 h-16 w-24 rounded-t-lg bg-muted flex flex-col items-center justify-end pb-2">
                    <span className="text-2xl font-bold text-foreground">2</span>
                  </div>
                  <span className="mt-1 text-xs font-medium text-foreground truncate max-w-24">{ranked[1].setup.nickname}</span>
                  <span className="text-sm font-bold text-foreground">{ranked[1].score.toFixed(1)}</span>
                </div>
              )}
              {ranked[0] && (
                <div className="flex flex-col items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ranked[0].setup.avatar}
                    alt={ranked[0].setup.nickname}
                    className="h-[4.5rem] w-[4.5rem] rounded-full object-cover ring-4 ring-primary"
                  />
                  <div className="mt-1.5 h-24 w-28 rounded-t-lg bg-primary/20 flex flex-col items-center justify-end pb-2">
                    <span className="text-3xl font-black text-primary">1</span>
                  </div>
                  <span className="mt-1 text-sm font-semibold text-foreground truncate max-w-28">{ranked[0].setup.nickname}</span>
                  <span className="text-lg font-black text-primary">{ranked[0].score.toFixed(1)}</span>
                </div>
              )}
              {ranked[2] && (
                <div className="flex flex-col items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ranked[2].setup.avatar}
                    alt={ranked[2].setup.nickname}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-muted-foreground/30"
                  />
                  <div className="mt-1.5 h-12 w-24 rounded-t-lg bg-muted/70 flex flex-col items-center justify-end pb-2">
                    <span className="text-xl font-bold text-foreground">3</span>
                  </div>
                  <span className="mt-1 text-xs font-medium text-foreground truncate max-w-24">{ranked[2].setup.nickname}</span>
                  <span className="text-sm font-bold text-foreground">{ranked[2].score.toFixed(1)}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            {ranked.map((entry, index) => (
              <div
                key={entry.setup.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2",
                  index === 0
                    ? "bg-primary/10 ring-1 ring-primary/30"
                    : index === 1
                      ? "bg-muted/80"
                      : index === 2
                        ? "bg-muted/50"
                        : ""
                )}
              >
                <span className="w-6 text-center text-sm font-bold text-muted-foreground">
                  {index + 1}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={entry.setup.avatar}
                  alt={entry.setup.nickname}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="flex-1 text-sm font-medium text-foreground truncate">
                  {entry.setup.nickname}
                </span>
                <span className="text-lg font-bold text-foreground">
                  {entry.score.toFixed(1)}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full rounded-lg bg-primary px-4 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </>
  )
}