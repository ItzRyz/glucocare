import AppointmentScheduler from "@/components/telemedicine/appointment-scheduler"

export default function TelemedicinePage() {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Telemedicine Scheduling</h1>
        <p className="text-muted-foreground mt-1">Book an online consultation with our specialized healthcare professionals.</p>
      </div>
      <AppointmentScheduler />
    </div>
  )
}
