"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, CheckCircle } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const DOCTORS = [
  { 
    id: "1", 
    name: "Dr. Sarah Smith", 
    specialty: "Endocrinologist",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    bio: "Specializes in diabetes management and hormonal imbalances. Over 10 years of experience."
  },
  { 
    id: "2", 
    name: "Dr. John Doe", 
    specialty: "General Practitioner",
    avatar: "https://i.pravatar.cc/150?u=john",
    bio: "Focuses on comprehensive family medicine and preventative care."
  },
  { 
    id: "3", 
    name: "Dr. Emily Chen", 
    specialty: "Nutritionist",
    avatar: "https://i.pravatar.cc/150?u=emily",
    bio: "Expert in creating customized dietary plans for diabetic patients."
  },
]

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:30 AM", "01:00 PM", "03:00 PM", "04:30 PM"
]

export default function AppointmentScheduler() {
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [isBooked, setIsBooked] = useState(false)

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDoctor || !selectedDate || !selectedTime) return
    setIsBooked(true)
  }

  if (isBooked) {
    return (
      <Card className="text-center py-12 border-green-500 border-2">
        <CardContent className="flex flex-col items-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <h2 className="text-2xl font-bold">Appointment Confirmed!</h2>
          <p className="text-muted-foreground">
            Your telemedicine session is scheduled for <strong className="text-foreground">{selectedDate}</strong> at <strong className="text-foreground">{selectedTime}</strong>.
          </p>
          <Button onClick={() => setIsBooked(false)} variant="outline" className="mt-4">
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
            <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
              {DOCTORS.map((doc) => (
                <div 
                  key={doc.id}
                  onClick={() => setSelectedDoctor(doc.id)}
                  className={`cursor-pointer rounded-xl border p-4 flex gap-4 items-start transition-all
                    ${selectedDoctor === doc.id 
                      ? "border-primary bg-primary/5 ring-1 ring-primary" 
                      : "border-input hover:border-primary/50 hover:bg-muted/30"}`}
                >
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={doc.avatar} alt={doc.name} />
                    <AvatarFallback>{doc.name.substring(4, 6)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold leading-none">{doc.name}</p>
                    <p className="text-xs font-medium text-primary">{doc.specialty}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.bio}</p>
                  </div>
                </div>
              ))}
            </div>
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
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select Time</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TIME_SLOTS.map((time) => (
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
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!selectedDoctor || !selectedDate || !selectedTime}
          >
            Confirm Booking
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
