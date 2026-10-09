"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/client"

export function AppHeader({ title, home }: { title: string; home: string }) {
  const router = useRouter()

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {})
    router.replace("/")
    router.refresh()
  }

  return (
    <header className="border-b bg-background/95 sticky top-0 z-20 backdrop-blur">
      <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href={home} className="flex items-center gap-2 font-semibold">
          <Stethoscope className="size-5 text-primary" />
          {title}
        </Link>
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut className="size-4" />
          خروج
        </Button>
      </div>
    </header>
  )
}
