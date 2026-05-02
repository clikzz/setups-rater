"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Attachment } from "@/lib/types"

interface MediaCarouselProps {
  attachments: Attachment[]
  className?: string
}

export function MediaCarousel({ attachments, className }: MediaCarouselProps) {
  const media = attachments.filter((a) => a.type === "image" || a.type === "video")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const go = useCallback((delta: number) => {
    setCurrentIndex((prev) => (prev + delta + media.length) % media.length)
  }, [media.length])

  useEffect(() => {
    if (!isFullscreen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsFullscreen(false)
      if (e.key === "ArrowLeft") go(-1)
      if (e.key === "ArrowRight") go(1)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [isFullscreen, go])

  if (media.length === 0) return null

  const current = media[currentIndex]

  return (
    <>
      <div className={cn("relative flex flex-col gap-2", className)}>
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl ring-1 ring-foreground/10 bg-muted">
          {current.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current.url}
              alt={current.fileName}
              className="h-full w-full object-contain"
            />
          ) : (
            <video
              key={current.url}
              src={current.url}
              controls
              autoPlay
              muted
              loop
              className="h-full w-full object-contain"
            />
          )}

          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 hover:bg-background transition-colors"
            title="Pantalla completa"
          >
            <Maximize2 className="size-4 text-foreground" />
          </button>

          {media.length > 1 && (
            <>
              <button
                onClick={() => go(-1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 hover:bg-background transition-colors"
              >
                <ChevronLeft className="size-5 text-foreground" />
              </button>
              <button
                onClick={() => go(1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 hover:bg-background transition-colors"
              >
                <ChevronRight className="size-5 text-foreground" />
              </button>
            </>
          )}
        </div>

        {media.length > 1 && (
          <div className="flex shrink-0 justify-center gap-1.5">
            {media.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  "size-2 rounded-full transition-colors",
                  i === currentIndex ? "bg-foreground" : "bg-muted-foreground/40"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative flex h-full w-full items-center justify-center p-12" onClick={(e) => e.stopPropagation()}>
            {current.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.url}
                alt={current.fileName}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <video
                key={current.url}
                src={current.url}
                controls
                autoPlay
                muted
                loop
                className="max-h-full max-w-full object-contain"
              />
            )}

            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors"
            >
              <X className="size-6 text-white" />
            </button>

            {media.length > 1 && (
              <>
                <button
                  onClick={() => go(-1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="size-8 text-white" />
                </button>
                <button
                  onClick={() => go(1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="size-8 text-white" />
                </button>
              </>
            )}

            {media.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {media.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={cn(
                      "size-3 rounded-full transition-colors",
                      i === currentIndex ? "bg-white" : "bg-white/40"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}