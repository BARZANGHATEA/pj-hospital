import { AppHeader } from "@/components/app-header"

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader title="پنل پزشک" home="/doctor" />
      {children}
    </>
  )
}
