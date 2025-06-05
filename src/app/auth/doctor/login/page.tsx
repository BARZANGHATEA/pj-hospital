"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import Link from "next/link"

export default function DoctorLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement login logic
    console.log(formData)
  }

  return (
    <main className="container mx-auto max-w-md p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">ورود پزشک</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <Input
              id="email"
              type="email"
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
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              dir="ltr"
              className="text-left"
            />
          </div>

          <Button type="submit" className="w-full">
            ورود
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm">
              حساب کاربری ندارید؟{" "}
              <Link href="/auth/doctor/register" className="text-primary hover:underline">
                ثبت‌نام
              </Link>
            </p>
            <Link href="/auth/password-reset" className="text-sm text-muted-foreground hover:underline">
              رمز عبور خود را فراموش کرده‌اید؟
            </Link>
          </div>
        </form>
      </Card>
    </main>
  )
}
