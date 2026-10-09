import { Suspense } from "react"
import { LoginForm } from "@/components/auth/login-form"

export default function DoctorLogin() {
  return (
    <Suspense>
      <LoginForm role="doctor" />
    </Suspense>
  )
}
