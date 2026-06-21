"use client"

import { useEffect, useState } from "react"
import { format, formatDistanceToNow, isFuture } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Activity, Clock } from "lucide-react"
import { api } from "@/lib/api-client"
import type { Appointment, DiagnosisPrediction, GlucoseRecord } from "@/types/api"

export default function StatCards() {
  const [glucose, setGlucose] = useState<GlucoseRecord | null>(null)
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [diagnosisCount, setDiagnosisCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const [glucoseData, appointments, diagnoses] = await Promise.all([
          api.glucose.list(),
          api.appointments.list(),
          api.diagnose.list(),
        ])

        if (!mounted) return

        setGlucose(glucoseData[0] ?? null)

        const upcoming = appointments
          .filter((a) => a.status.name !== "Cancelled" && isFuture(new Date(a.date)))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        setAppointment(upcoming[0] ?? null)

        const thisMonth = diagnoses.filter((d: DiagnosisPrediction) => {
          const created = new Date(d.createdAt)
          const now = new Date()
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
        })
        setDiagnosisCount(thisMonth.length)
      } catch {
        // silently fail — cards show fallback text
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-4 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-8 w-24 mb-2" /><Skeleton className="h-3 w-40" /></CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      title: "Latest Blood Sugar",
      icon: Activity,
      value: glucose ? `${glucose.level} mg/dL` : "No records",
      description: glucose
        ? `${glucose.type.name}. ${formatDistanceToNow(new Date(glucose.createdAt), { addSuffix: true })}.`
        : "Log your first reading on the Diagnose page.",
      contentIcon: null,
    },
    {
      title: "Next Appointment",
      icon: Calendar,
      value: appointment ? appointment.doctor.name : "None scheduled",
      description: appointment
        ? `${format(new Date(appointment.date), "MMM d")} at ${appointment.timeSlot} (Telemedicine)`
        : "Book a session on the Telemedicine page.",
      contentIcon: Clock,
    },
    {
      title: "Recent Diagnoses",
      icon: Activity,
      value: `${diagnosisCount} Log${diagnosisCount === 1 ? "" : "s"}`,
      description: "Recorded this month.",
      contentIcon: null,
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              {stat.contentIcon && <stat.contentIcon className="mr-1 h-3 w-3" />}
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
