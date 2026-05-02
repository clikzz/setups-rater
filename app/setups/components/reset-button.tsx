"use client"

import { RotateCcw, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ResetButtonProps {
  onReset: () => void
  onRandomFill?: () => void
}

export function ResetButton({ onReset, onRandomFill }: ResetButtonProps) {
  return (
    <div className="flex gap-2">
      {onRandomFill && (
        <Button variant="outline" size="sm" onClick={onRandomFill}>
          <Shuffle className="size-4" />
          Llenar aleatorio
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={() => {
        if (window.confirm("Estas seguro de que quieres reiniciar todo? Se borraran todos los puntajes y las cartas se daran vuelta.")) {
          onReset()
        }
      }}>
        <RotateCcw className="size-4" />
        Reiniciar
      </Button>
    </div>
  )
}