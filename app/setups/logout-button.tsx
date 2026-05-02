"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

export function LogOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={loading}
    >
      <LogOut />
      {loading ? "Saliendo..." : "Cerrar sesión"}
    </Button>
  )
}
