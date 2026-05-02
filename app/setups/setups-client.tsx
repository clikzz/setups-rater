"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { AppState, Setup } from "@/lib/types"
import { getDefaultState } from "@/lib/types"
import { CardGrid } from "./components/card-grid"
import { VotingView } from "./components/voting-view"
import { ResultsModal } from "./components/results-modal"
import { LeaderboardModal } from "./components/leaderboard-modal"

interface SetupsClientProps {
  twitchChannel: string
  streamerWeight: number
}

function calcChatAvg(votes: Record<string, number>): number | null {
  const values = Object.values(votes)
  if (values.length === 0) return null
  return values.reduce((s, v) => s + v, 0) / values.length
}

export function SetupsClient({ twitchChannel, streamerWeight }: SetupsClientProps) {
  const chatWeight = 100 - streamerWeight
  const [setups, setSetups] = useState<Setup[]>([])
  const [state, setState] = useState<AppState>(getDefaultState())
  const [view, setView] = useState<"grid" | "voting">("grid")
  const [selectedSetupId, setSelectedSetupId] = useState<string | null>(null)
  const [flippingSetup, setFlippingSetup] = useState<string | null>(null)
  const [chatVotes, setChatVotes] = useState<Record<string, number>>({})
  const [streamerVote, setStreamerVote] = useState(5)
  const [showResults, setShowResults] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const hasLoaded = useRef(false)

  const saveState = useCallback(async (newState: AppState) => {
    try {
      await fetch("/api/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newState),
      })
    } catch (err) {
      console.error("Error saving state:", err)
    }
  }, [])

  useEffect(() => {
    if (hasLoaded.current) return
    hasLoaded.current = true

    async function load() {
      try {
        const [setupsRes, stateRes] = await Promise.all([
          fetch("/api/setups"),
          fetch("/api/state"),
        ])
        const { setups: loadedSetups } = await setupsRes.json()
        const serverState: AppState = await stateRes.json()

        setSetups(loadedSetups)
        setState(serverState)

        if (serverState.voting.active && serverState.voting.setupId) {
          setSelectedSetupId(serverState.voting.setupId)
          setView("voting")
        }
      } catch (err) {
        console.error("Error loading state:", err)
      }
      setIsLoading(false)
    }

    load()
  }, [])

  function handleSelectSetup(id: string) {
    setSelectedSetupId(id)
    setChatVotes({})
    setStreamerVote(5)
    setShowResults(false)

    if (state.setups[id]?.flipped) {
      setView("voting")
    } else {
      setFlippingSetup(id)
      setTimeout(() => {
        setFlippingSetup(null)
        setView("voting")
      }, 600)
    }
  }

  async function handleStartVoting() {
    if (!selectedSetupId) return
    setChatVotes({})
    setStreamerVote(5)
    const newState: AppState = {
      ...state,
      voting: {
        active: true,
        setupId: selectedSetupId,
        startTime: Date.now(),
      },
    }
    setState(newState)
    await saveState(newState)
  }

  async function handleStopVoting() {
    if (!selectedSetupId) return
    const avg = calcChatAvg(chatVotes)
    const newState: AppState = {
      ...state,
      setups: {
        ...state.setups,
        [selectedSetupId]: {
          flipped: true,
          chatAvg: avg ?? undefined,
          streamerAvg: streamerVote,
        },
      },
      voting: { active: false, setupId: null, startTime: null },
    }
    setState(newState)
    setChatVotes({})
    setStreamerVote(5)
    await saveState(newState)
    setShowResults(true)
  }

  async function handleReset() {
    const res = await fetch("/api/reset", { method: "POST" })
    const { state: newState } = await res.json()
    setState(newState)
    setView("grid")
    setSelectedSetupId(null)
    setFlippingSetup(null)
    setChatVotes({})
    setStreamerVote(5)
    setShowResults(false)
    setShowLeaderboard(false)
  }

  async function handleRandomFill() {
    const newSetups: Record<string, { flipped: boolean; chatAvg?: number; streamerAvg?: number }> = {}
    for (const setup of setups) {
      const chatAvg = Math.round((Math.random() * 7 + 2) * 10) / 10
      const streamerAvg = Math.round((Math.random() * 7 + 2) * 10) / 10
      newSetups[setup.id] = { flipped: true, chatAvg, streamerAvg }
    }
    const newState: AppState = {
      ...state,
      setups: newSetups,
      voting: { active: false, setupId: null, startTime: null },
    }
    setState(newState)
    await saveState(newState)
  }

  function handleBack() {
    setView("grid")
    setSelectedSetupId(null)
    setShowResults(false)
  }

  function handleVote(user: string, value: number) {
    setChatVotes((prev) => ({ ...prev, [user]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  const chatAvg = calcChatAvg(chatVotes)
  const chatVoteCount = Object.keys(chatVotes).length
  const selectedSetup = setups.find((s) => s.id === selectedSetupId) ?? null
  const isFlipped = selectedSetupId ? !!state.setups[selectedSetupId]?.flipped : false
  const savedChatAvg = selectedSetupId ? (state.setups[selectedSetupId]?.chatAvg ?? null) : null
  const savedStreamerAvg = selectedSetupId ? (state.setups[selectedSetupId]?.streamerAvg ?? null) : null

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="flex min-h-0 flex-1 flex-col transition-opacity duration-300"
        style={{ display: view === "grid" ? "flex" : "none" }}
      >
        <CardGrid
          setups={setups}
          state={state}
          flippingSetup={flippingSetup}
          onSelect={handleSelectSetup}
          onReset={handleReset}
          onRandomFill={handleRandomFill}
          onViewLeaderboard={() => setShowLeaderboard(true)}
          streamerWeight={streamerWeight}
          chatWeight={chatWeight}
        />
      </div>

      {view === "voting" && selectedSetup && (
        <div className="flex min-h-0 flex-1 flex-col transition-opacity duration-300">
          <VotingView
            setup={selectedSetup}
            streamerVote={streamerVote}
            isVotingActive={state.voting.active}
            chatAvg={chatAvg}
            chatVoteCount={chatVoteCount}
            isFlipped={isFlipped}
            savedChatAvg={savedChatAvg}
            savedStreamerAvg={savedStreamerAvg}
            streamerWeight={streamerWeight}
            chatWeight={chatWeight}
            startTime={state.voting.startTime}
            onStartVoting={handleStartVoting}
            onStopVoting={handleStopVoting}
            onStreamerVote={setStreamerVote}
            onVote={handleVote}
            onBack={handleBack}
            twitchChannel={twitchChannel}
          />
        </div>
      )}

      {showResults && selectedSetupId && (
        <ResultsModal
          chatAvg={state.setups[selectedSetupId]?.chatAvg ?? null}
          streamerVote={state.setups[selectedSetupId]?.streamerAvg ?? 0}
          streamerWeight={streamerWeight}
          onClose={handleBack}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal
          setups={setups}
          state={state}
          streamerWeight={streamerWeight}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  )
}