"use client"

import Link from "next/link"
import { Menu, Activity, Shield } from "lucide-react"
import { useOrganization } from "@clerk/nextjs"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { UserButton } from "@clerk/nextjs"

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/diagnose", label: "Diagnose" },
  { href: "/telemedicine", label: "Telemedicine" },
  { href: "/assessment", label: "Assessment" },
  { href: "/records/history", label: "Records" },
]

export default function Navbar() {
  const { membership } = useOrganization()
  const isAdmin = membership?.role === "org:admin"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center mx-auto px-4 sm:px-8">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              GlucoCare
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-1"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
          </nav>
        </div>
        <Sheet>
          <SheetTrigger
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            )}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col justify-between px-8">
            <div>
              <Link href="/" className="flex items-center space-x-2 mb-8 mt-4">
                <Activity className="h-6 w-6 text-primary" />
                <span className="font-bold">GlucoCare</span>
              </Link>
              <div className="flex flex-col space-y-4 text-sm font-medium">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>{link.label}</Link>
                ))}
                {isAdmin && (
                  <Link href="/admin" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}
              </div>
            </div>
            <UserButton showName appearance={{
              elements: {
                userButtonBox: {
                  flexDirection: "row-reverse",
                  gap: "4px",
                  maxWidth: "200px",
                },
                userButtonOuterIdentifier: {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              }
            }}>
              <UserButton.MenuItems>
                <UserButton.Link label="Appointments" href="/appointments" labelIcon={<Activity className="mr-2 h-4 w-4" />} />
                {isAdmin && (
                  <UserButton.Link label="Admin Panel" href="/admin" labelIcon={<Shield className="mr-2 h-4 w-4" />} />
                )}
              </UserButton.MenuItems>
            </UserButton>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none" />
          <nav className="flex items-center">
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Link label="Appointments" href="/appointments" labelIcon={<Activity className="mr-2 h-4 w-4" />} />
                {isAdmin && (
                  <UserButton.Link label="Admin Panel" href="/admin" labelIcon={<Shield className="mr-2 h-4 w-4" />} />
                )}
              </UserButton.MenuItems>
            </UserButton>
          </nav>
        </div>
      </div>
    </header>
  )
}
