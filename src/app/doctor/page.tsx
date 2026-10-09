"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PrescriptionStatusBadge, UrgencyBadge } from "@/components/status-badge"
import { apiFetch, formatDate, genderLabels, type Prescription } from "@/lib/client"

type Scope = "pending" | "reviewed"

export default function DoctorDashboard() {
  const [lists, setLists] = useState<Record<Scope, Prescription[] | null>>({ pending: null, reviewed: null })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    for (const scope of ["pending", "reviewed"] as const) {
      apiFetch<{ prescriptions: Prescription[] }>(`/api/prescriptions?scope=${scope}`)
        .then((d) => setLists((l) => ({ ...l, [scope]: d.prescriptions })))
        .catch((e: Error) => setError(e.message))
    }
  }, [])

  if (error) {
    return (
      <main className="container mx-auto max-w-5xl p-4 md:p-6">
        <p className="rounded-lg border bg-muted p-6 text-center text-sm">{error}</p>
      </main>
    )
  }

  return (
    <main className="container mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">پرونده‌های بیماران</h1>
        <p className="text-sm text-muted-foreground">
          پیش‌نویس‌ها توسط هوش مصنوعی تهیه شده‌اند و تا تأیید شما برای بیمار نمایش داده نمی‌شوند.
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            در انتظار بررسی{lists.pending ? ` (${lists.pending.length.toLocaleString("fa-IR")})` : ""}
          </TabsTrigger>
          <TabsTrigger value="reviewed">بررسی‌شده توسط من</TabsTrigger>
        </TabsList>
        {(["pending", "reviewed"] as const).map((scope) => (
          <TabsContent key={scope} value={scope} className="mt-4">
            <CaseList items={lists[scope]} empty={scope === "pending" ? "پرونده‌ای در صف بررسی نیست." : "هنوز پرونده‌ای را بررسی نکرده‌اید."} />
          </TabsContent>
        ))}
      </Tabs>
    </main>
  )
}

function CaseList({ items, empty }: { items: Prescription[] | null; empty: string }) {
  if (items === null) return <Skeleton className="h-24 w-full" />
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((p) => (
        <Link key={p._id} href={`/doctor/prescriptions/${p._id}`}>
          <Card className="h-full gap-3 py-4 transition-colors hover:bg-accent">
            <CardHeader className="gap-2 px-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">{p.patientId?.name ?? "بیمار"}</CardTitle>
                {p.status === "pending" && p.urgency ? (
                  <UrgencyBadge urgency={p.urgency} />
                ) : (
                  <PrescriptionStatusBadge status={p.status} />
                )}
              </div>
              <CardDescription>
                {[
                  p.patientId?.age !== undefined ? `${p.patientId.age.toLocaleString("fa-IR")} ساله` : null,
                  p.patientId?.gender ? genderLabels[p.patientId.gender] : null,
                  formatDate(p.createdAt),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </CardDescription>
              {p.symptomsSummary && <p className="line-clamp-2 text-sm">{p.symptomsSummary}</p>}
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  )
}
