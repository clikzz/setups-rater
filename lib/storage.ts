import { promises as fs } from "fs"
import path from "path"
import { type AppState } from "./types"

const DATA_DIR = path.resolve(process.cwd(), "data")
const STATE_FILE = path.join(DATA_DIR, "state.json")

async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

export async function getState(): Promise<AppState> {
  await ensureDataDir()
  try {
    const raw = await fs.readFile(STATE_FILE, "utf-8")
    const parsed = JSON.parse(raw)
    return {
      setups: parsed.setups || {},
      voting: parsed.voting || { active: false, setupId: null, startTime: null },
      config: parsed.config || { streamerWeight: 50 },
    }
  } catch {
    return { setups: {}, voting: { active: false, setupId: null, startTime: null }, config: { streamerWeight: 50 } }
  }
}

export async function saveState(state: AppState): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), "utf-8")
}

export async function resetState(): Promise<AppState> {
  const defaultState: AppState = {
    setups: {},
    voting: { active: false, setupId: null, startTime: null },
    config: { streamerWeight: 50 },
  }
  await saveState(defaultState)
  return defaultState
}