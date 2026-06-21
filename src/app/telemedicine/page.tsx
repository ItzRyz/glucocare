import AppointmentScheduler from "@/components/telemedicine/appointment-scheduler"
import ChatPanel from "@/components/telemedicine/chat-panel"

export default function TelemedicinePage() {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Telemedicine</h1>
        <p className="text-muted-foreground mt-1">
          Book an online consultation and chat with your healthcare provider.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <AppointmentScheduler />
        <ChatPanel />
      </div>
    </div>
  )
}
