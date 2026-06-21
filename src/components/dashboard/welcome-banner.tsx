"use client"

import { useUser } from "@clerk/nextjs"
import { Button, buttonVariants } from "@/components/ui/button"
import { Activity, Calendar } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function WelcomeBanner() {
  const { user } = useUser()
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening"
  const name = user?.firstName ?? user?.fullName ?? "Patient"

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{greeting}, {name}!</h1>
        <p className="text-muted-foreground mt-1">Here is an overview of your health status and upcoming schedules.</p>
      </div>
      <div className="flex gap-3 w-full md:w-auto">
        <Link href="/diagnose" className={cn(buttonVariants({ variant: "default" }), "flex-1 md:flex-none")}>
          New Diagnosis <Activity className="ml-2 h-4 w-4" />
        </Link>
        <Link href="/telemedicine" className={cn(buttonVariants({ variant: "outline" }), "flex-1 md:flex-none")}>
          Schedule <Calendar className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
