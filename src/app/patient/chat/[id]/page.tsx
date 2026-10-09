"use client"

import { use, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, Bot, Send, User } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ChatStatusBadge } from "@/components/status-badge"
import { apiFetch, type Chat, type ChatMessage } from "@/lib/client"
import { cn } from "@/lib/utils"

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [chat, setChat] = useState<Chat | null>(null)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    apiFetch<{ chat: Chat }>(`/api/chats/${id}`)
      .then((d) => setChat(d.chat))
      .catch((e: Error) => toast.error(e.message))
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chat?.messages.length, sending])

  async function send(e?: React.FormEvent) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || !chat || sending) return

    const optimistic: ChatMessage = { _id: `local-${Date.now()}`, from: "patient", text, timestamp: new Date().toISOString() }
    setChat({ ...chat, messages: [...chat.messages, optimistic] })
    setInput("")
    setSending(true)
    try {
      const { messages } = await apiFetch<{ messages: ChatMessage[] }>(`/api/chats/${id}/messages`, {
        method: "POST",
        body: JSON.stringify({ text }),
      })
      setChat((c) => (c ? { ...c, messages } : c))
    } catch (err) {
      toast.error((err as Error).message)
      setChat((c) => (c ? { ...c, messages: c.messages.filter((m) => m._id !== optimistic._id) } : c))
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  async function submit() {
    setSubmitting(true)
    try {
      await apiFetch(`/api/chats/${id}/submit`, { method: "POST" })
      toast.success("پرونده شما برای پزشک ارسال شد")
      setChat((c) => (c ? { ...c, status: "submitted" } : c))
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const isOpen = chat?.status === "open"
  const hasPatientMessage = chat?.messages.some((m) => m.from === "patient") ?? false

  return (
    <main className="container mx-auto flex h-[calc(100dvh-3.5rem)] max-w-3xl flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/patient">
            <ArrowRight className="size-4" />
            بازگشت
          </Link>
        </Button>
        {chat && <ChatStatusBadge status={chat.status} />}
      </div>

      <Card className="flex-1 gap-0 overflow-y-auto p-4">
        {chat === null ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="mr-auto h-12 w-1/2" />
          </div>
        ) : (
          <div className="space-y-4">
            {chat.messages.map((m) => (
              <MessageBubble key={m._id} message={m} />
            ))}
            {sending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bot className="size-4" />
                <span className="animate-pulse">دستیار در حال نوشتن است...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </Card>

      {chat && isOpen && (
        <div className="space-y-2">
          <form onSubmit={send} className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder="علائم خود را بنویسید... (Enter برای ارسال، Shift+Enter برای خط جدید)"
              className="max-h-40 min-h-12 resize-none"
              maxLength={4000}
              disabled={sending || submitting}
            />
            <Button type="submit" size="icon" disabled={sending || submitting || !input.trim()} aria-label="ارسال پیام">
              <Send className="size-4 -scale-x-100" />
            </Button>
          </form>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="secondary" className="w-full" disabled={!hasPatientMessage || sending || submitting}>
                {submitting ? "در حال آماده‌سازی پرونده..." : "ارسال برای پزشک"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>ارسال پرونده برای پزشک</AlertDialogTitle>
                <AlertDialogDescription>
                  پس از ارسال، گفتگو بسته می‌شود و خلاصه علائم شما برای بررسی پزشک ارسال خواهد شد. ادامه می‌دهید؟
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>انصراف</AlertDialogCancel>
                <AlertDialogAction onClick={submit}>ارسال</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {chat && !isOpen && (
        <p className="rounded-md border bg-muted p-3 text-center text-sm text-muted-foreground">
          این گفتگو برای پزشک ارسال شده است. نتیجه بررسی در{" "}
          <Link href="/patient" className="text-primary underline">
            پنل شما
          </Link>{" "}
          نمایش داده می‌شود.
        </p>
      )}
    </main>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const mine = message.from === "patient"
  return (
    <div className={cn("flex items-start gap-2", mine ? "flex-row" : "flex-row-reverse")}>
      <div className={cn("rounded-full p-1.5", mine ? "bg-primary text-primary-foreground" : "bg-muted")}>
        {mine ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2 text-sm leading-7",
          mine ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
        dir="auto"
      >
        {message.text}
      </div>
    </div>
  )
}
