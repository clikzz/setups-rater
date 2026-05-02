"use client"

import { type SetupState, type Setup, type AppState } from "@/lib/types"
import { SetupCard } from "./setup-card"
import { ResetButton } from "./reset-button"
import { Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CardGridProps {
  setups: Setup[]
  state: AppState
  flippingSetup: string | null
  onSelect: (id: string) => void
  onReset: () => void
  onRandomFill: () => void
  onViewLeaderboard: () => void
  streamerWeight: number
  chatWeight: number
}

export function CardGrid({
  setups,
  state,
  flippingSetup,
  onSelect,
  onReset,
  onRandomFill,
  onViewLeaderboard,
}: CardGridProps) {
  const scoredCount = setups.filter((s) => state.setups[s.id]?.flipped).length
  const totalCount = setups.length
  const progress =
    totalCount === 0 ? 0 : Math.round((scoredCount / totalCount) * 100)
  const isComplete = progress === 100

  if (setups.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">
          No hay setups en <code className="text-foreground">data/setups.json</code>
        </p>
        <p className="text-sm text-muted-foreground">
          Agrega setups al archivo JSON y recarga.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col p-6">
      <div className="flex items-center justify-between pb-3">
        <h1 className="text-2xl font-semibold text-foreground">Setups</h1>
        <ResetButton onReset={onReset} onRandomFill={onRandomFill} />
      </div>

      <div className="flex shrink-0 items-center gap-4 pb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-muted-foreground">
              {scoredCount}/{totalCount} votados
            </span>
            <span className="text-sm font-semibold text-foreground">{progress}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        {isComplete && (
          <Button onClick={onViewLeaderboard} size="lg">
            <Trophy className="size-5" />
            Ver resultados
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-4 xl:grid-cols-4 2xl:grid-cols-5">
          {setups.map((setup) => (
            <SetupCard
              key={setup.id}
              setup={setup}
              setupState={
                (state.setups[setup.id] as SetupState | undefined) ?? {
                  flipped: false,
                }
              }
              isFlipping={flippingSetup === setup.id}
              onClick={() => onSelect(setup.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}