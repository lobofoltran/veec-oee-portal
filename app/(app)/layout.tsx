import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar
          variant="inset"
          user={{
            name: session?.user?.name ?? null,
            email: session?.user?.email ?? null,
            avatar: null,
            role: session?.user?.roles?.[0] ?? (process.env.NODE_ENV !== "production" ? "ADMIN" : null),
          }}
        />
        <SidebarInset>
          <SiteHeader />
          {children}
          <Toaster />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
