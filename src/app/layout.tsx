import "./globals.css"
import { Vazirmatn } from "next/font/google"
import { cn } from "@/lib/utils"

const vazirmatn = Vazirmatn({ 
  subsets: ["arabic"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-vazirmatn",
})

export const metadata = {
  title: "سامانه پزشکی مجازی",
  description: "سیستم مشاوره پزشکی آنلاین با هوش مصنوعی",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        vazirmatn.variable
      )}>
        {children}
      </body>
    </html>
  )
}
