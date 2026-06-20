"use client"

import Link from "next/link"
import { Menu, User, Activity } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { UserButton } from "@clerk/nextjs"

export default function Navbar() {
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
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/diagnose"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Diagnose
            </Link>
            <Link
              href="/telemedicine"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Telemedicine
            </Link>
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
                <Link href="/">Dashboard</Link>
                <Link href="/diagnose">Diagnose</Link>
                <Link href="/telemedicine">Telemedicine</Link>
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
              </UserButton.MenuItems>
            </UserButton>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search or other elements could go here */}
          </div>
          <nav className="flex items-center">
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Link label="Appointments" href="/appointments" labelIcon={<Activity className="mr-2 h-4 w-4" />} />
              </UserButton.MenuItems>
            </UserButton>
          </nav>
        </div>
      </div>
    </header>
  )
}
