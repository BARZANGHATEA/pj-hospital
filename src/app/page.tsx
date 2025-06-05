"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <div className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0">
            سامانه پزشکی مجازی
          </div>
        </div>
      </div>

      <div className="relative flex place-items-center">
        <h1 className="text-4xl font-bold text-center mb-8">
          به سامانه پزشکی مجازی خوش آمدید
        </h1>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-2 lg:text-right gap-8">
        <Card className="group rounded-lg border px-5 py-4 transition-colors">
          <h2 className="mb-3 text-2xl font-semibold">
            برای بیماران
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            ثبت‌نام و مشاوره آنلاین با پزشک
          </p>
          <div className="mt-4 flex gap-2">
            <Button asChild>
              <Link href="/auth/patient/login">
                ورود
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/patient/register">
                ثبت‌نام
              </Link>
            </Button>
          </div>
        </Card>

        <Card className="group rounded-lg border px-5 py-4 transition-colors">
          <h2 className="mb-3 text-2xl font-semibold">
            برای پزشکان
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            ثبت‌نام و مدیریت بیماران
          </p>
          <div className="mt-4 flex gap-2">
            <Button asChild>
              <Link href="/auth/doctor/login">
                ورود
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/doctor/register">
                ثبت‌نام
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </main>
  )
}
