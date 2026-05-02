import { NextResponse } from "next/server"
import { resetState } from "@/lib/storage"

export async function POST() {
  const state = await resetState()
  return NextResponse.json({ success: true, state })
}
