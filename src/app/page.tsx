import Link from "next/link"
import { ClipboardCheck, MessageSquareText, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const steps = [
  {
    icon: MessageSquareText,
    title: "گفتگو با دستیار هوشمند",
    text: "علائم خود را توضیح دهید؛ دستیار سؤالات لازم را می‌پرسد و شرح حال کاملی تهیه می‌کند.",
  },
  {
    icon: Stethoscope,
    title: "بررسی توسط پزشک",
    text: "خلاصه پرونده و پیش‌نویس نسخه برای پزشک ارسال می‌شود تا آن را بررسی و ویرایش کند.",
  },
  {
    icon: ClipboardCheck,
    title: "دریافت نسخه",
    text: "پس از تأیید پزشک، نسخه و توصیه‌ها در پنل شما نمایش داده می‌شود.",
  },
]

export default function Home() {
  return (
    <main className="container mx-auto max-w-5xl space-y-12 px-4 py-12 md:py-20">
      <section className="space-y-4 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">به سامانه پزشکی مجازی خوش آمدید</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          مشاوره آنلاین با کمک هوش مصنوعی؛ هر نسخه پیش از رسیدن به دست شما توسط پزشک دارای مجوز بررسی و تأیید می‌شود.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">برای بیماران</CardTitle>
            <CardDescription>ثبت‌نام و مشاوره آنلاین با پزشک</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button asChild>
              <Link href="/auth/patient/login">ورود</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/patient/register">ثبت‌نام</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">برای پزشکان</CardTitle>
            <CardDescription>بررسی پرونده‌ها و تأیید نسخه‌ها</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button asChild>
              <Link href="/auth/doctor/login">ورود</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/doctor/register">ثبت‌نام</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-center text-xl font-semibold">چطور کار می‌کند؟</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="space-y-2 rounded-lg border p-5">
              <div className="flex items-center gap-2 font-medium">
                <Icon className="size-5 text-primary" />
                {(i + 1).toLocaleString("fa-IR")}. {title}
              </div>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
        این سامانه جایگزین خدمات اورژانس نیست. در صورت بروز علائم اورژانسی با ۱۱۵ تماس بگیرید.
      </p>
    </main>
  )
}
