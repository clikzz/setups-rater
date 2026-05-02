"use client"

import { useEffect, useRef, useState } from "react"
import { createTwitchClient, parseVote } from "@/lib/twitch"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/lib/types"

interface ChatPanelProps {
  channel: string
  isVotingActive: boolean
  onVote: (user: string, value: number) => void
}

export function ChatPanel({ channel, isVotingActive, onVote }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const votingActiveRef = useRef(isVotingActive)
  const onVoteRef = useRef(onVote)

  useEffect(() => {
    votingActiveRef.current = isVotingActive
    onVoteRef.current = onVote
  }, [isVotingActive, onVote])

  useEffect(() => {
    let client: { disconnect: () => void } | null = null
    let cancelled = false

    async function connect() {
      try {
        client = await createTwitchClient(
          channel,
          (username, message) => {
            const vote = parseVote(message)
            setMessages((prev) => [
              ...prev.slice(-199),
              {
                id: `${Date.now()}-${Math.random()}`,
                user: username,
                message,
                isVote: vote !== null,
                voteValue: vote ?? undefined,
              },
            ])
            if (votingActiveRef.current && vote !== null) {
              onVoteRef.current(username, vote)
            }
          },
          () => { if (!cancelled) setIsConnected(true) },
          () => { if (!cancelled) setIsConnected(false) }
        )
        if (cancelled) client.disconnect()
      } catch (err) {
        console.error("Twitch connection error:", err)
      }
    }

    connect()

    return () => {
      cancelled = true
      client?.disconnect()
      setIsConnected(false)
    }
    }, [channel])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-sm font-medium text-foreground">
          Chat de Twitch
        </span>
        <div className="flex items-center gap-1.5">
          <div className={cn("size-2 rounded-full", isConnected ? "bg-green-500" : "bg-muted-foreground")} />
          <span className="text-xs text-muted-foreground">
            {isConnected ? `#${channel}` : "Conectando..."}
          </span>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 space-y-0.5 min-h-0"
      >
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Esperando mensajes...
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={cn("text-sm px-1 py-0.5 rounded", msg.isVote && "bg-primary/10")}>
            <span className="font-semibold text-primary">{msg.user}: </span>
            <span className={msg.isVote ? "font-bold text-foreground" : "text-muted-foreground"}>
              {msg.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}