"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { apiFetch } from "@/lib/client"

const specialties = [
  "پزشک عمومی",
  "متخصص قلب و عروق",
  "متخصص مغز و اعصاب",
  "متخصص داخلی",
  "متخصص اطفال",
  "متخصص زنان و زایمان",
  "متخصص چشم",
  "متخصص گوش و حلق و بینی",
  "متخصص پوست",
  "متخصص ارتوپدی",
  "روانپزشک",
] as const

export default function DoctorRegister() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    specialty: "",
    licenseNumber: "",
    phone: "",
    clinicAddress: "",
    bio: ""
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.specialty) {
      toast.error("تخصص را انتخاب کنید")
      return
    }
    setLoading(true)
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...formData, role: "doctor" }),
      })
      toast.success("ثبت‌نام انجام شد. دسترسی به پرونده‌ها پس از تأیید شماره نظام پزشکی فعال می‌شود.")
      router.replace("/doctor")
      router.refresh()
    } catch (err) {
      toast.error((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto max-w-md p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">ثبت‌نام پزشک</h1>
        
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
              autoComplete="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              dir="ltr"
              className="text-left"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">رمز عبور</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              placeholder="حداقل ۸ کاراکتر"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              dir="ltr"
              className="text-left"
            />
          </div>

          <div className="space-y-2">
            <Label>تخصص</Label>
            <Select
              value={formData.specialty}
              onValueChange={(value) => setFormData({...formData, specialty: value})}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="انتخاب تخصص" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseNumber">شماره نظام پزشکی</Label>
            <Input
              id="licenseNumber"
              type="text"
              required
              value={formData.licenseNumber}
              onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
              dir="ltr"
              className="text-left"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">شماره تماس</Label>
            <Input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              dir="ltr"
              className="text-left"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicAddress">آدرس مطب</Label>
            <Input
              id="clinicAddress"
              type="text"
              value={formData.clinicAddress}
              onChange={(e) => setFormData({...formData, clinicAddress: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">درباره من</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              placeholder="سوابق و تخصص‌های خود را وارد کنید"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
          </Button>

          <p className="text-center text-sm">
            قبلاً ثبت‌نام کرده‌اید؟{" "}
            <Link href="/auth/doctor/login" className="text-primary hover:underline">
              ورود
            </Link>
          </p>
        </form>
      </Card>
    </main>
  )
}
