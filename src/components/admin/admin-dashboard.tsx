"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Activity, Calendar, Clock, Cpu, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api-client"
import type { AdminStats, Appointment } from "@/types/api"

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [statsData, apptData] = await Promise.all([
          api.admin.stats(),
          api.appointments.list(),
        ])
        if (mounted) {
          setStats(statsData)
          setAppointments(apptData)
        }
      } catch {
        // show empty state
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-48" />
      </div>
    )
  }

  const statCards = stats
    ? [
        { label: "Users", value: stats.userCount, icon: Users },
        { label: "Appointments", value: stats.appointmentCount, icon: Calendar },
        { label: "Glucose Records", value: stats.glucoseCount, icon: Activity },
        { label: "ML Predictions", value: stats.predictionCount, icon: Cpu },
      ]
    : []

  const mlOnline = stats?.mlService.status === "ok"

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Overview of platform activity.</p>
        </div>
        <Badge variant={mlOnline ? "default" : "destructive"}>
          ML Service: {mlOnline ? "Online" : "Offline"}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats && stats.appointmentsByStatus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Appointments by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {stats.appointmentsByStatus.map((row) => (
                <Badge key={row.status} variant="secondary">
                  {row.status}: {row.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Appointments</CardTitle>
          <CardDescription>Latest scheduled and completed sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No appointments yet.</p>
          ) : (
            <div className="divide-y">
              {appointments.slice(0, 10).map((appt) => (
                <div key={appt.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{appt.patient.name} → {appt.doctor.name}</p>
                    <p className="text-xs text-muted-foreground">{appt.notes ?? "Telemedicine"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(appt.date), "MMM d")} · {appt.timeSlot}
                    </p>
                    <p className="text-xs text-muted-foreground">{appt.status.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
