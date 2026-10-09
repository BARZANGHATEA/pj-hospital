"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PrescriptionStatusBadge, UrgencyBadge } from "@/components/status-badge"
import {
  apiFetch,
  formatDate,
  genderLabels,
  type ChatMessage,
  type Medication,
  type Prescription,
} from "@/lib/client"

type Detail = { prescription: Prescription; messages: ChatMessage[] }

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [data, setData] = useState<Detail | null>(null)
  const [diagnosis, setDiagnosis] = useState("")
  const [medications, setMedications] = useState<Medication[]>([])
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiFetch<Detail>(`/api/prescriptions/${id}`)
      .then((d) => {
        setData(d)
        setDiagnosis(d.prescription.diagnosis ?? "")
        setMedications(d.prescription.medications)
        setNotes(d.prescription.doctorNotes ?? "")
      })
      .catch((e: Error) => toast.error(e.message))
  }, [id])

  if (!data) {
    return (
      <main className="container mx-auto max-w-4xl space-y-4 p-4 md:p-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </main>
    )
  }

  const { prescription: p, messages } = data
  const editable = p.status === "pending"
  const patient = p.patientId

  function updateMed(index: number, field: keyof Medication, value: string) {
    setMedications((meds) => meds.map((m, i) => (i === index ? { ...m, [field]: value } : m)))
  }

  async function review(action: "approve" | "reject") {
    if (action === "reject" && !notes.trim()) {
      toast.error("برای رد نسخه، توضیحی برای بیمار بنویسید")
      return
    }
    const meds = medications.filter((m) => m.name.trim())
    if (action === "approve" && meds.some((m) => !m.dosage.trim() || !m.duration.trim())) {
      toast.error("دوز و مدت مصرف همه داروها را وارد کنید")
      return
    }
    setSaving(true)
    try {
      await apiFetch(`/api/prescriptions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(
          action === "approve"
            ? { action, diagnosis, medications: meds, doctorNotes: notes }
            : { action, doctorNotes: notes },
        ),
      })
      toast.success(action === "approve" ? "نسخه تأیید و برای بیمار ارسال شد" : "نسخه رد شد")
      router.push("/doctor")
    } catch (e) {
      toast.error((e as Error).message)
      setSaving(false)
    }
  }

  return (
    <main className="container mx-auto max-w-4xl space-y-4 p-4 md:p-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/doctor">
          <ArrowRight className="size-4" />
          بازگشت به فهرست
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-xl">{patient?.name}</CardTitle>
            <div className="flex gap-2">
              {p.urgency && <UrgencyBadge urgency={p.urgency} />}
              <PrescriptionStatusBadge status={p.status} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <Info label="سن" value={patient?.age?.toLocaleString("fa-IR")} />
          <Info label="جنسیت" value={patient?.gender ? genderLabels[patient.gender] : undefined} />
          <Info label="شماره تماس" value={patient?.phone} />
          <Info label="تاریخ ثبت" value={formatDate(p.createdAt)} />
          <Info label="سابقه بیماری" value={patient?.medicalHistory} wide />
          <Info label="داروهای مصرفی" value={patient?.currentMedications} wide />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>خلاصه علائم (تهیه‌شده توسط هوش مصنوعی)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="whitespace-pre-line leading-7">{p.symptomsSummary || "—"}</p>
          {p.recommendations && (
            <p className="whitespace-pre-line leading-7">
              <span className="font-medium">توصیه‌های پیشنهادی: </span>
              {p.recommendations}
            </p>
          )}
          <Accordion type="single" collapsible>
            <AccordionItem value="transcript">
              <AccordionTrigger>مشاهده متن کامل گفتگو ({messages.length.toLocaleString("fa-IR")} پیام)</AccordionTrigger>
              <AccordionContent className="space-y-2">
                {messages.map((m) => (
                  <p key={m._id} className="whitespace-pre-line rounded-md bg-muted p-2" dir="auto">
                    <span className="font-medium">{m.from === "patient" ? "بیمار: " : "دستیار: "}</span>
                    {m.text}
                  </p>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{editable ? "بررسی و ویرایش نسخه" : "نسخه نهایی"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="diagnosis">تشخیص</Label>
            <Textarea id="diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} disabled={!editable} />
          </div>

          <div className="space-y-3">
            <Label>داروها</Label>
            {medications.length === 0 && <p className="text-sm text-muted-foreground">دارویی ثبت نشده است.</p>}
            {medications.map((m, i) => (
              <div key={i} className="grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
                <Input placeholder="نام دارو" value={m.name} onChange={(e) => updateMed(i, "name", e.target.value)} disabled={!editable} dir="auto" />
                <Input placeholder="دوز و دفعات مصرف" value={m.dosage} onChange={(e) => updateMed(i, "dosage", e.target.value)} disabled={!editable} />
                <Input placeholder="مدت مصرف" value={m.duration} onChange={(e) => updateMed(i, "duration", e.target.value)} disabled={!editable} />
                {editable && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="حذف دارو"
                    onClick={() => setMedications((meds) => meds.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            ))}
            {editable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMedications((meds) => [...meds, { name: "", dosage: "", duration: "" }])}
              >
                <Plus className="size-4" />
                افزودن دارو
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">یادداشت برای بیمار</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!editable}
              placeholder="توضیحات، توصیه‌ها یا دلیل رد نسخه (در صورت رد، الزامی است)"
            />
          </div>

          {editable ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button className="flex-1" onClick={() => review("approve")} disabled={saving}>
                تأیید و ارسال برای بیمار
              </Button>
              <Button variant="destructive" className="flex-1" onClick={() => review("reject")} disabled={saving}>
                رد نسخه
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {p.doctorId ? `بررسی‌شده توسط دکتر ${p.doctorId.name}` : "بررسی‌شده"}
              {p.reviewedAt ? ` در ${formatDate(p.reviewedAt)}` : ""}
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

function Info({ label, value, wide }: { label: string; value?: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <span className="text-muted-foreground">{label}: </span>
      <span>{value || "—"}</span>
    </div>
  )
}
