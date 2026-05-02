export interface Attachment {
  url: string
  type: "image" | "video" | "audio"
  fileName: string
}

export interface Setup {
  id: string
  name: string
  nickname: string
  color: string
  avatar: string
  content: string
  attachments: Attachment[]
}

export interface SetupState {
  flipped: boolean
  chatAvg?: number
  streamerAvg?: number
}

export interface VotingState {
  active: boolean
  setupId: string | null
  startTime: number | null
}

export interface ConfigState {
  streamerWeight: number
}

export interface AppState {
  setups: Record<string, SetupState>
  voting: VotingState
  config: ConfigState
}

export interface ChatMessage {
  id: string
  user: string
  message: string
  isVote: boolean
  voteValue?: number
}

export function getDefaultState(): AppState {
  return {
    setups: {},
    voting: { active: false, setupId: null, startTime: null },
    config: { streamerWeight: 50 },
  }
}