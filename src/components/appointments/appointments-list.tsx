"use client"

import { useEffect, useState } from "react"
import { format, isFuture } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Clock, XCircle, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api, ApiClientError } from "@/lib/api-client"
import type { Appointment } from "@/types/api"

export default function AppointmentsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await api.appointments.list()
        if (mounted) setAppointments(data)
      } catch (err) {
        if (mounted) setError(err instanceof ApiClientError ? err.message : "Failed to load appointments")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const handleCancel = async (id: string) => {
    setCancellingId(id)
    try {
      await api.appointments.cancel(id)
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: { ...a.status, name: "Cancelled" } } : a))
      )
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to cancel appointment")
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => <Skeleton key={i} className="h-24" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      {appointments.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground text-sm">
            No appointments found. Book one on the Telemedicine page.
          </CardContent>
        </Card>
      ) : (
        appointments.map((appt) => {
          const upcoming = isFuture(new Date(appt.date)) && appt.status.name !== "Cancelled"
          return (
            <Card key={appt.id}>
              <CardHeader className="flex flex-row items-start gap-4 pb-2">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={appt.doctor.avatarUrl ?? undefined} />
                  <AvatarFallback>{appt.doctor.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-base">{appt.doctor.name}</CardTitle>
                  <CardDescription>{appt.notes ?? "Telemedicine consultation"}</CardDescription>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  appt.status.name === "Cancelled"
                    ? "bg-muted text-muted-foreground"
                    : appt.status.name === "Completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                }`}>
                  {appt.status.name}
                </span>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(appt.date), "MMM d, yyyy")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {appt.timeSlot}
                  </span>
                </div>
                {upcoming && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleCancel(appt.id)}
                    disabled={cancellingId === appt.id}
                  >
                    {cancellingId === appt.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <><XCircle className="h-4 w-4 mr-1" /> Cancel</>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
