"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"
import Link from "next/link"

export default function PatientRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    age: "",
    medicalHistory: "",
    currentMedications: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement registration logic
    console.log(formData)
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
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
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
            />
          </div>

          <div className="space-y-2">
            <Label>جنسیت</Label>
            <RadioGroup
              value={formData.gender}
              onValueChange={(value) => setFormData({...formData, gender: value})}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">مرد</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
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
              required
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalHistory">سابقه بیماری‌ها</Label>
            <Input
              id="medicalHistory"
              type="text"
              value={formData.medicalHistory}
              onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentMedications">داروهای مصرفی فعلی</Label>
            <Input
              id="currentMedications"
              type="text"
              value={formData.currentMedications}
              onChange={(e) => setFormData({...formData, currentMedications: e.target.value})}
            />
          </div>

          <Button type="submit" className="w-full">
            ثبت‌نام
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
