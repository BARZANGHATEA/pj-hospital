import "server-only"

const URGENCY_RANK: Record<string, number> = { emergency: 0, high: 1, medium: 2, low: 3 }

export function byUrgencyThenAge<T extends { urgency?: string | null; createdAt?: Date | null }>(a: T, b: T) {
  const rank = (URGENCY_RANK[a.urgency ?? "low"] ?? 3) - (URGENCY_RANK[b.urgency ?? "low"] ?? 3)
  if (rank !== 0) return rank
  return (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0)
}

/**
 * What a patient may see. The AI draft (diagnosis, drugs, urgency) stays
 * hidden until a doctor has approved it.
 */
export function forPatient<T extends {
  status?: string | null
  diagnosis?: string | null
  medications?: unknown[] | null
  recommendations?: string | null
  urgency?: string | null
}>(p: T) {
  if (p.status === "approved") return p
  return { ...p, diagnosis: undefined, medications: [], recommendations: undefined, urgency: undefined }
}
