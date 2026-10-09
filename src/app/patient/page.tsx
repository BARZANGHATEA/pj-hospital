"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MessageSquarePlus, Pill } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChatStatusBadge, PrescriptionStatusBadge } from "@/components/status-badge"
import { apiFetch, formatDate, type ChatSummary, type Prescription } from "@/lib/client"

export default function PatientDashboard() {
  const router = useRouter()
  const [chats, setChats] = useState<ChatSummary[] | null>(null)
  const [prescriptions, setPrescriptions] = useState<Prescription[] | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    apiFetch<{ chats: ChatSummary[] }>("/api/chats")
      .then((d) => setChats(d.chats))
      .catch((e: Error) => toast.error(e.message))
    apiFetch<{ prescriptions: Prescription[] }>("/api/prescriptions")
      .then((d) => setPrescriptions(d.prescriptions))
      .catch((e: Error) => toast.error(e.message))
  }, [])

  async function newConsultation() {
    setCreating(true)
    try {
      const { chat } = await apiFetch<{ chat: { _id: string } }>("/api/chats", { method: "POST" })
      router.push(`/patient/chat/${chat._id}`)
    } catch (e) {
      toast.error((e as Error).message)
      setCreating(false)
    }
  }

  return (
    <main className="container mx-auto max-w-5xl space-y-8 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">مشاوره‌های من</h1>
          <p className="text-sm text-muted-foreground">
            علائم خود را برای دستیار هوشمند توضیح دهید؛ پرونده شما پس از ارسال توسط پزشک بررسی می‌شود.
          </p>
        </div>
        <Button onClick={newConsultation} disabled={creating}>
          <MessageSquarePlus className="size-4" />
          {creating ? "در حال ایجاد..." : "مشاوره جدید"}
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">گفتگوها</h2>
        {chats === null ? (
          <Skeleton className="h-20 w-full" />
        ) : chats.length === 0 ? (
          <p className="text-sm text-muted-foreground">هنوز مشاوره‌ای ثبت نکرده‌اید.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {chats.map((chat) => (
              <Link key={chat._id} href={`/patient/chat/${chat._id}`}>
                <Card className="gap-2 py-4 transition-colors hover:bg-accent">
                  <CardHeader className="px-4">
                    <CardTitle className="text-base">{chat.title}</CardTitle>
                    <CardDescription>{formatDate(chat.updatedAt)}</CardDescription>
                  </CardHeader>
                  <CardContent className="px-4">
                    <ChatStatusBadge status={chat.status} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">نسخه‌ها</h2>
        {prescriptions === null ? (
          <Skeleton className="h-20 w-full" />
        ) : prescriptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">هنوز نسخه‌ای برای شما صادر نشده است.</p>
        ) : (
          <div className="space-y-3">
            {prescriptions.map((p) => (
              <PrescriptionCard key={p._id} prescription={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function PrescriptionCard({ prescription: p }: { prescription: Prescription }) {
  return (
    <Card className="gap-4 py-4">
      <CardHeader className="px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">نسخه {formatDate(p.createdAt)}</CardTitle>
          <PrescriptionStatusBadge status={p.status} />
        </div>
        {p.doctorId && (
          <CardDescription>
            دکتر {p.doctorId.name}
            {p.doctorId.specialty ? ` - ${p.doctorId.specialty}` : ""}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3 px-4 text-sm">
        {p.status === "pending" && (
          <p className="text-muted-foreground">پرونده شما در صف بررسی پزشک است. پس از تأیید، نسخه در اینجا نمایش داده می‌شود.</p>
        )}
        {p.status === "approved" && (
          <>
            {p.diagnosis && (
              <p>
                <span className="font-medium">تشخیص: </span>
                {p.diagnosis}
              </p>
            )}
            {p.medications.length > 0 ? (
              <ul className="space-y-2">
                {p.medications.map((m, i) => (
                  <li key={i} className="flex gap-2 rounded-md border p-2">
                    <Pill className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <div className="font-medium" dir="auto">{m.name}</div>
                      <div className="text-muted-foreground">
                        {m.dosage} - {m.duration}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">دارویی تجویز نشده است.</p>
            )}
            {p.recommendations && (
              <p className="whitespace-pre-line">
                <span className="font-medium">توصیه‌ها: </span>
                {p.recommendations}
              </p>
            )}
          </>
        )}
        {p.doctorNotes && (
          <p className="whitespace-pre-line">
            <span className="font-medium">یادداشت پزشک: </span>
            {p.doctorNotes}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
