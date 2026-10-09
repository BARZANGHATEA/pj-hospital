import { Suspense } from "react"
import { LoginForm } from "@/components/auth/login-form"

export default function PatientLogin() {
  return (
    <Suspense>
      <LoginForm role="patient" />
    </Suspense>
  )
}
