import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { urgencyLabels, type ChatStatus, type PrescriptionStatus, type Urgency } from "@/lib/client"

const prescriptionStatus: Record<PrescriptionStatus, { label: string; className: string }> = {
  pending: { label: "در انتظار بررسی پزشک", className: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100" },
  approved: { label: "تأیید شده", className: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100" },
  rejected: { label: "رد شده", className: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100" },
}

const chatStatus: Record<ChatStatus, { label: string; className: string }> = {
  open: { label: "در حال گفتگو", className: "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-100" },
  submitted: prescriptionStatus.pending,
  reviewed: { label: "بررسی شده", className: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100" },
}

const urgencyStyles: Record<Urgency, string> = {
  low: "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
  medium: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
  high: "bg-orange-200 text-orange-950 dark:bg-orange-900/50 dark:text-orange-100",
  emergency: "bg-red-600 text-white",
}

export function PrescriptionStatusBadge({ status }: { status: PrescriptionStatus }) {
  const s = prescriptionStatus[status]
  return <Badge className={cn("border-transparent", s.className)}>{s.label}</Badge>
}

export function ChatStatusBadge({ status }: { status: ChatStatus }) {
  const s = chatStatus[status]
  return <Badge className={cn("border-transparent", s.className)}>{s.label}</Badge>
}

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return <Badge className={cn("border-transparent", urgencyStyles[urgency])}>فوریت: {urgencyLabels[urgency]}</Badge>
}
