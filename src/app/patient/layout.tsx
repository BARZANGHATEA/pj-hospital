import { AppHeader } from "@/components/app-header"

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader title="پنل بیمار" home="/patient" />
      {children}
    </>
  )
}
