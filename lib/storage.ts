import { Redis } from "@upstash/redis"
import { type AppState } from "./types"

let redis: Redis | null = null

function getRedis(): Redis | null {
  if (redis) return redis
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
    return redis
  }
  return null
}

const STATE_KEY = "state"

const DEFAULT_STATE: AppState = {
  setups: {},
  voting: { active: false, setupId: null, startTime: null },
  config: { streamerWeight: 50 },
}

export async function getState(): Promise<AppState> {
  const r = getRedis()
  if (!r) return { ...DEFAULT_STATE }
  try {
    const state = await r.get<AppState>(STATE_KEY)
    return state ?? { ...DEFAULT_STATE }
  } catch {
    return { ...DEFAULT_STATE }
  }
}

export async function saveState(state: AppState): Promise<void> {
  const r = getRedis()
  if (!r) return
  await r.set(STATE_KEY, state)
}

export async function resetState(): Promise<AppState> {
  const r = getRedis()
  if (r) await r.set(STATE_KEY, DEFAULT_STATE)
  return { ...DEFAULT_STATE }
}