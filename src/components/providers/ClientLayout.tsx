"use client"

import { BottomNav } from "@/components/storefront/BottomNav"
import { Toaster } from "sonner"

export function ClientLayout() {
  return (
    <>
      <BottomNav />
      <Toaster position="bottom-center" richColors toastOptions={{ className: "mb-20 md:mb-4" }} />
    </>
  )
}
