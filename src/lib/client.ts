// Client-side helpers and the JSON shapes returned by /api routes.

export type Medication = { name: string; dosage: string; duration: string }
export type Urgency = "low" | "medium" | "high" | "emergency"
export type PrescriptionStatus = "pending" | "approved" | "rejected"
export type ChatStatus = "open" | "submitted" | "reviewed"

export type ChatMessage = { _id: string; from: "patient" | "ai"; text: string; timestamp: string }

export type ChatSummary = { _id: string; title: string; status: ChatStatus; createdAt: string; updatedAt: string }

export type Chat = ChatSummary & { messages: ChatMessage[]; symptomsSummary?: string }

export type PersonRef = {
  _id: string
  name: string
  age?: number
  gender?: "male" | "female"
  phone?: string
  specialty?: string
  medicalHistory?: string
  currentMedications?: string
}

export type Prescription = {
  _id: string
  chatId: string
  patientId: PersonRef
  doctorId?: PersonRef | null
  generatedByAI: boolean
  symptomsSummary?: string
  diagnosis?: string
  urgency?: Urgency
  recommendations?: string
  medications: Medication[]
  status: PrescriptionStatus
  doctorNotes?: string
  reviewedAt?: string
  createdAt: string
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "خطایی رخ داد. دوباره تلاش کنید.")
  }
  return data as T
}

/** Only allow same-origin relative paths as post-login redirects. */
export function safeNext(next: string | null, fallback: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
}

export const urgencyLabels: Record<Urgency, string> = {
  low: "کم",
  medium: "متوسط",
  high: "زیاد",
  emergency: "اورژانسی",
}

export const genderLabels = { male: "مرد", female: "زن" } as const
