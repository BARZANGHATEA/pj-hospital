import "server-only"
import Anthropic from "@anthropic-ai/sdk"
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod"
import * as z from "zod/v4"
import { HttpError } from "@/lib/auth"

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5"
// If a request is declined by the model's safety classifiers, let the API
// retry it on Anthropic's recommended fallback model instead of failing.
const FALLBACK_BETA = "server-side-fallback-2026-07-01"

let client: Anthropic | null = null
function getClient() {
  client ??= new Anthropic()
  return client
}

export type PatientContext = {
  name: string
  age?: number | null
  gender?: string | null
  medicalHistory?: string | null
  currentMedications?: string | null
}

export type ChatTurn = { from: "patient" | "ai"; text: string }

const INTAKE_INSTRUCTIONS = `You are the intake assistant of an online medical clinic in Iran. You talk with a patient before a licensed doctor reviews their case.

Your job is to take a clear history so the doctor can decide quickly:
- Ask about the main complaint, onset, duration, severity, location, what makes it better or worse, associated symptoms, relevant past illnesses, current medications and allergies. Skip anything already in the patient profile or the conversation.
- Ask one or two short questions per message, in plain language.
- Do not give a diagnosis and do not recommend specific medications or doses. If asked, explain that a doctor will review the case and issue any prescription.
- If the patient describes warning signs (for example chest pain, trouble breathing, signs of stroke, severe bleeding, loss of consciousness, suicidal thoughts, high fever in an infant, severe allergic reaction), tell them clearly to call emergency services (115) or go to the nearest emergency department now, before anything else.
- When you have enough information, tell the patient they can press the «ارسال برای پزشک» button to send the case to a doctor.

Always reply in Persian (Farsi). Keep replies short and warm. Use plain text without Markdown headings or tables.`

function profileBlock(patient: PatientContext) {
  const gender = patient.gender === "male" ? "male" : patient.gender === "female" ? "female" : "unknown"
  return [
    "Patient profile (provided by the patient at registration):",
    `- Name: ${patient.name}`,
    `- Age: ${patient.age ?? "unknown"}`,
    `- Gender: ${gender}`,
    `- Medical history: ${patient.medicalHistory || "not provided"}`,
    `- Current medications: ${patient.currentMedications || "not provided"}`,
  ].join("\n")
}

function toMessages(history: ChatTurn[]): Anthropic.Beta.BetaMessageParam[] {
  const messages: Anthropic.Beta.BetaMessageParam[] = history.map((turn) => ({
    role: turn.from === "patient" ? "user" : "assistant",
    content: turn.text,
  }))
  // Conversations open with the assistant's greeting, but the API requires a user turn first.
  if (messages[0]?.role === "assistant") {
    messages.unshift({ role: "user", content: "(The patient opened a new consultation.)" })
  }
  return messages
}

function transcript(history: ChatTurn[]) {
  return history.map((t) => `${t.from === "patient" ? "Patient" : "Assistant"}: ${t.text}`).join("\n\n")
}

function toHttpError(error: unknown): never {
  if (error instanceof HttpError) throw error
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
    console.error("Anthropic credentials rejected:", error.message)
    throw new HttpError(503, "سرویس هوش مصنوعی پیکربندی نشده است")
  }
  if (error instanceof Anthropic.RateLimitError) {
    throw new HttpError(429, "سرویس هوش مصنوعی شلوغ است. چند لحظه دیگر دوباره تلاش کنید.")
  }
  if (error instanceof Anthropic.APIError) {
    console.error(`Anthropic API error ${error.status}:`, error.message)
    throw new HttpError(502, "پاسخ از سرویس هوش مصنوعی دریافت نشد. دوباره تلاش کنید.")
  }
  // e.g. no credentials configured, or the API is unreachable
  console.error("Anthropic client error:", error)
  throw new HttpError(503, "سرویس هوش مصنوعی در دسترس نیست. لطفاً بعداً تلاش کنید.")
}

/** Next assistant message in the intake conversation. `history` must end with a patient turn. */
export async function intakeReply(patient: PatientContext, history: ChatTurn[]) {
  try {
    const response = await getClient().beta.messages.create({
      model: MODEL,
      max_tokens: 8000,
      betas: [FALLBACK_BETA],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: `${INTAKE_INSTRUCTIONS}\n\n${profileBlock(patient)}`,
      messages: toMessages(history),
    })

    if (response.stop_reason === "refusal") {
      return "متأسفم، نمی‌توانم به این پیام پاسخ دهم. اگر وضعیت شما اورژانسی است با ۱۱۵ تماس بگیرید؛ در غیر این صورت می‌توانید پرونده را برای پزشک ارسال کنید."
    }

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim()
    if (!text) throw new HttpError(502, "پاسخی از دستیار دریافت نشد. دوباره تلاش کنید.")
    return text
  } catch (error) {
    toHttpError(error)
  }
}

const CaseSummarySchema = z.object({
  title: z.string().describe("Very short Persian title for the case, e.g. «سردرد و تب»"),
  symptomsSummary: z.string().describe("Persian clinical summary of the history for the doctor"),
  preliminaryDiagnosis: z.string().describe("Persian differential / most likely diagnosis, clearly marked as preliminary"),
  urgency: z.enum(["low", "medium", "high", "emergency"]),
  suggestedMedications: z
    .array(
      z.object({
        name: z.string().describe("Generic drug name"),
        dosage: z.string().describe("Dose and frequency, in Persian"),
        duration: z.string().describe("Duration of use, in Persian"),
      }),
    )
    .describe("Draft prescription for the doctor to edit; empty if medication is not appropriate without an in-person visit"),
  recommendations: z.string().describe("Persian non-drug advice and follow-up / referral recommendations"),
})

export type CaseSummary = z.infer<typeof CaseSummarySchema>

const SUMMARY_INSTRUCTIONS = `You prepare case files for licensed doctors at an online clinic. From an intake conversation, write a concise clinical summary, a preliminary diagnosis, an urgency level and a draft prescription. A doctor will review, edit, approve or reject everything you write before the patient sees it.

- Be conservative. Prefer first-line, widely available generic drugs, and account for the patient's age, current medications, allergies and history.
- Leave the medication list empty when the case needs an in-person examination, tests, or emergency care, and say so in the recommendations.
- Use "emergency" urgency for anything that needs immediate in-person care.
- Write all text fields in Persian (Farsi), except generic drug names, which may be in English.`

export async function summarizeCase(patient: PatientContext, history: ChatTurn[]): Promise<CaseSummary> {
  try {
    const response = await getClient().beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: [FALLBACK_BETA],
      fallbacks: "default",
      output_config: { effort: "high", format: betaZodOutputFormat(CaseSummarySchema) },
      system: SUMMARY_INSTRUCTIONS,
      messages: [
        {
          role: "user",
          content: `${profileBlock(patient)}\n\n<intake_conversation>\n${transcript(history)}\n</intake_conversation>`,
        },
      ],
    })

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      throw new HttpError(502, "تهیه خلاصه پرونده ممکن نشد. لطفاً دوباره تلاش کنید.")
    }
    return response.parsed_output
  } catch (error) {
    toHttpError(error)
  }
}
