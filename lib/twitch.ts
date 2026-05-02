export function parseVote(message: string): number | null {
  const trimmed = message.trim().replace(/,/g, ".")

  if (trimmed.includes("-")) return null

  const exactMatch = trimmed.match(/^(\d+(?:\.\d+)?)$/)
  if (exactMatch) {
    const num = parseFloat(exactMatch[1])
    if (num >= 0 && num <= 10) return num
    return null
  }

  const ratioMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*\/\s*10/)
  if (ratioMatch) {
    const num = parseFloat(ratioMatch[1])
    if (num >= 0 && num <= 10) return num
  }

  const allNumbers = [...trimmed.matchAll(/(\d+(?:\.\d+)?)/g)]
    .map((m) => parseFloat(m[1]))
    .filter((n) => n >= 0 && n <= 10)

  if (allNumbers.length === 1) return allNumbers[0]

  return null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TmiClient = any

export async function createTwitchClient(
  channel: string,
  onMessage: (username: string, message: string) => void,
  onConnect: () => void,
  onDisconnect: () => void
): Promise<{ disconnect: () => void }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tmiModule: any = await import("tmi.js")
  const tmi = tmiModule.default ?? tmiModule
  const ClientClass = tmi.Client ?? tmi

  const client: TmiClient = new ClientClass({
    channels: [channel],
  })

  client.on("message", (_channel: string, tags: { username?: string }, message: string) => {
    onMessage(tags.username || "unknown", message)
  })

  client.on("connected", onConnect)
  client.on("disconnected", onDisconnect)

  await client.connect()

  return {
    disconnect: () => {
      client.disconnect()
    },
  }
}