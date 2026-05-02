"use client"

import { Slider } from "@/components/ui/slider"

interface StreamerVoteInputProps {
  value: number
  onChange: (value: number) => void
  disabled: boolean
}

export function StreamerVoteInput({ value, onChange, disabled }: StreamerVoteInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">
        Tu voto
      </label>
      <div className="flex items-center gap-4">
        <Slider
          min={0}
          max={10}
          step={0.5}
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          disabled={disabled}
          className="flex-1"
        />
        <span className="w-8 text-center text-lg font-bold text-foreground">
          {value.toFixed(1)}
        </span>
      </div>
    </div>
  )
}