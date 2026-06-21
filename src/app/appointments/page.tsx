import AppointmentsList from "@/components/appointments/appointments-list"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

export default function AppointmentsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-8 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
          <p className="text-muted-foreground mt-1">View and manage your scheduled telemedicine sessions.</p>
        </div>
        <Link href="/telemedicine">
          <Button>
            <Calendar className="mr-2 h-4 w-4" /> Book New
          </Button>
        </Link>
      </div>
      <AppointmentsList />
    </div>
  )
}
