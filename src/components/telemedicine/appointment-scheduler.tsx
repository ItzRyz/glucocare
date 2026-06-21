"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Clock, CheckCircle, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api, ApiClientError } from "@/lib/api-client"
import type { Doctor } from "@/types/api"

export default function AppointmentScheduler() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [isBooked, setIsBooked] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function loadDoctors() {
      try {
        const data = await api.doctors.list()
        if (mounted) setDoctors(data)
      } catch {
        if (mounted) setError("Failed to load doctors")
      } finally {
        if (mounted) setLoadingDoctors(false)
      }
    }
    loadDoctors()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!selectedDoctor || !selectedDate) {
      setTimeSlots([])
      setSelectedTime("")
      return
    }

    let mounted = true
    async function loadSlots() {
      setLoadingSlots(true)
      setSelectedTime("")
      try {
        const data = await api.appointments.slots(selectedDoctor, selectedDate)
        if (mounted) setTimeSlots(data.available)
      } catch {
        if (mounted) setTimeSlots([])
      } finally {
        if (mounted) setLoadingSlots(false)
      }
    }
    loadSlots()
    return () => { mounted = false }
  }, [selectedDoctor, selectedDate])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDoctor || !selectedDate || !selectedTime) return

    setSubmitting(true)
    setError(null)
    try {
      await api.appointments.create({
        doctorId: selectedDoctor,
        date: selectedDate,
        timeSlot: selectedTime,
      })
      setIsBooked(true)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to book appointment")
    } finally {
      setSubmitting(false)
    }
  }

  const selectedDoctorData = doctors.find((d) => d.id === selectedDoctor)

  if (isBooked) {
    return (
      <Card className="text-center py-12 border-green-500 border-2">
        <CardContent className="flex flex-col items-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <h2 className="text-2xl font-bold">Appointment Confirmed!</h2>
          <p className="text-muted-foreground">
            Your telemedicine session is scheduled for{" "}
            <strong className="text-foreground">{selectedDate}</strong> at{" "}
            <strong className="text-foreground">{selectedTime}</strong>
            {selectedDoctorData && <> with <strong className="text-foreground">{selectedDoctorData.name}</strong></>}.
          </p>
          <Button onClick={() => { setIsBooked(false); setSelectedTime("") }} variant="outline" className="mt-4">
            Book Another Session
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Telemedicine</CardTitle>
        <CardDescription>Select a doctor and an available time slot for your online consultation.</CardDescription>
      </CardHeader>
      <form onSubmit={handleBooking}>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Select Doctor</Label>
            {loadingDoctors ? (
              <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            ) : doctors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No doctors available.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoctor(doc.id)}
                    className={`cursor-pointer rounded-xl border p-4 flex gap-4 items-start transition-all
                      ${selectedDoctor === doc.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-input hover:border-primary/50 hover:bg-muted/30"}`}
                  >
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={doc.avatarUrl ?? undefined} alt={doc.name} />
                      <AvatarFallback>{doc.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold leading-none">{doc.name}</p>
                      <p className="text-xs font-medium text-primary">{doc.role.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{doc.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Select Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                id="date"
                type="date"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select Time</Label>
            {!selectedDoctor || !selectedDate ? (
              <p className="text-sm text-muted-foreground">Select a doctor and date first.</p>
            ) : loadingSlots ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : timeSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground">No available slots for this date.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`cursor-pointer rounded-md border p-3 text-center text-sm flex items-center justify-center gap-2 transition-colors
                      ${selectedTime === time
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-input hover:bg-muted"}`}
                  >
                    <Clock className="h-3 w-3" />
                    {time}
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={!selectedDoctor || !selectedDate || !selectedTime || submitting}
          >
            {submitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Booking...</>
            ) : (
              "Confirm Booking"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
