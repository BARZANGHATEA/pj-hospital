"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch, safeNext } from "@/lib/client"

export function LoginForm({ role }: { role: "patient" | "doctor" }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ ...formData, role }),
      })
      router.replace(safeNext(searchParams.get("next"), `/${role}`))
      router.refresh()
    } catch (err) {
      toast.error((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto max-w-md p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">{role === "doctor" ? "ورود پزشک" : "ورود بیمار"}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@email.com"
              dir="ltr"
              className="text-left"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">رمز عبور</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              dir="ltr"
              className="text-left"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "در حال ورود..." : "ورود"}
          </Button>

          <p className="text-center text-sm">
            حساب کاربری ندارید؟{" "}
            <Link href={`/auth/${role}/register`} className="text-primary hover:underline">
              ثبت‌نام
            </Link>
          </p>
        </form>
      </Card>
    </main>
  )
}
