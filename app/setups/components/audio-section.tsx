"use client"

import { Music } from "lucide-react"
import type { Attachment } from "@/lib/types"

interface AudioSectionProps {
  attachments: Attachment[]
}

export function AudioSection({ attachments }: AudioSectionProps) {
  const audios = attachments.filter((a) => a.type === "audio")

  if (audios.length === 0) return null

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Music className="size-3.5" />
        Audio
      </div>
      {audios.map((audio) => (
        <div key={audio.url} className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground truncate">{audio.fileName}</span>
          <audio controls src={audio.url} className="h-7 w-full" />
        </div>
      ))}
    </div>
  )
}