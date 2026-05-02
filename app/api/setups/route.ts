import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import type { Setup } from "@/lib/types"

export async function GET() {
  const filePath = path.resolve(process.cwd(), "data", "setups.json")

  try {
    const raw = await fs.readFile(filePath, "utf-8")
    const setups: Setup[] = JSON.parse(raw)
    return NextResponse.json({ setups })
  } catch {
    return NextResponse.json({ setups: [] })
  }
}
