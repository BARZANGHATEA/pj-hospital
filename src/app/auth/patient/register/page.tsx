"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { apiFetch } from "@/lib/client"

export default function PatientRegister() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    age: "",
    medicalHistory: "",
    currentMedications: ""
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.gender) {
      toast.error("جنسیت را انتخاب کنید")
      return
    }
    setLoading(true)
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...formData, role: "patient" }),
      })
      toast.success("ثبت‌نام با موفقیت انجام شد")
      router.replace("/patient")
      router.refresh()
    } catch (err) {
      toast.error((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto max-w-md p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">ثبت‌نام بیمار</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">نام و نام خانوادگی</Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="example@email.com"
              dir="ltr"
              className="text-left"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">رمز عبور</Label>
            <Input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="حداقل ۸ کاراکتر"
              dir="ltr"
              className="text-left"
            />
          </div>

          <div className="space-y-2">
            <Label>جنسیت</Label>
            <RadioGroup
              value={formData.gender}
              onValueChange={(value) => setFormData({...formData, gender: value})}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">مرد</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">زن</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">سن</Label>
            <Input
              id="age"
              type="number"
              min={0}
              max={130}
              required
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalHistory">سابقه بیماری‌ها</Label>
            <Textarea
              id="medicalHistory"
              value={formData.medicalHistory}
              onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
              placeholder="مثلاً دیابت، فشار خون، آلرژی دارویی"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentMedications">داروهای مصرفی فعلی</Label>
            <Textarea
              id="currentMedications"
              value={formData.currentMedications}
              onChange={(e) => setFormData({...formData, currentMedications: e.target.value})}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
          </Button>

          <p className="text-center text-sm">
            قبلاً ثبت‌نام کرده‌اید؟{" "}
            <Link href="/auth/patient/login" className="text-primary hover:underline">
              ورود
            </Link>
          </p>
        </form>
      </Card>
    </main>
  )
}
