import { NextResponse } from "next/server"
import { getState, saveState } from "@/lib/storage"
import { type AppState } from "@/lib/types"

export async function GET() {
  const state = await getState()
  return NextResponse.json(state)
}

export async function PUT(request: Request) {
  const body = (await request.json()) as AppState

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 })
  }

  if (!body.setups || typeof body.setups !== "object") {
    return NextResponse.json({ error: "setups requerido" }, { status: 400 })
  }

  if (!body.voting || typeof body.voting !== "object") {
    body.voting = { active: false, setupId: null, startTime: null }
  }

  if (!body.config || typeof body.config !== "object") {
    body.config = { streamerWeight: 50 }
  }

  await saveState({
    setups: body.setups,
    voting: body.voting,
    config: body.config,
  })

  return NextResponse.json({ success: true })
}
