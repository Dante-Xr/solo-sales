"use client"

import { BottomNav } from "@/components/storefront/BottomNav"
import { usePathname } from "next/navigation"
import { Toaster } from "sonner"

export function ClientLayout() {
  const pathname = usePathname()
  const isAdminRoute = /^\/(?:zh|en)\/admin(?:\/|$)/.test(pathname) || /^\/admin(?:\/|$)/.test(pathname)

  return (
    <>
      {!isAdminRoute && <BottomNav />}
      <Toaster
        position="bottom-center"
        richColors
        toastOptions={{ className: isAdminRoute ? "mb-4" : "mb-20 md:mb-4" }}
      />
    </>
  )
}
