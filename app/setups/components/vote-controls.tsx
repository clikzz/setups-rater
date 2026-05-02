"use client"

import { useEffect, useState } from "react"
import { Play, Square, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VoteControlsProps {
  isVotingActive: boolean
  startTime: number | null
  isRevoting: boolean
  onStart: () => void
  onStop: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

export function VoteControls({ isVotingActive, startTime, isRevoting, onStart, onStop }: VoteControlsProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!isVotingActive || !startTime) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset timer when voting stops
      setElapsed(0)
      return
    }

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [isVotingActive, startTime])

  if (isVotingActive) {
    return (
      <Button variant="destructive" onClick={onStop} size="lg" className="w-full text-base">
        <Square className="size-5" />
        Cerrar votacion {formatTime(elapsed)}
      </Button>
    )
  }

  if (isRevoting) {
    return (
      <Button onClick={onStart} size="lg" className="w-full text-base">
        <RotateCcw className="size-5" />
        Revotar
      </Button>
    )
  }

  return (
    <Button onClick={onStart} size="lg" className="w-full text-base">
      <Play className="size-5" />
      Iniciar votacion
    </Button>
  )
}