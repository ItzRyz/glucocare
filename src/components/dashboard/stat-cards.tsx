import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Activity, Clock } from "lucide-react"

// Mock data array for statistics
const statsData = [
  {
    id: 1,
    title: "Latest Blood Sugar",
    icon: Activity,
    value: "110 mg/dL",
    description: "Normal range. Taken 2 days ago.",
    contentIcon: null,
  },
  {
    id: 2,
    title: "Next Appointment",
    icon: Calendar,
    value: "Dr. Sarah Smith",
    description: "Tomorrow at 10:00 AM (Telemedicine)",
    contentIcon: Clock,
  },
  {
    id: 3,
    title: "Recent Diagnoses",
    icon: Activity,
    value: "3 Logs",
    description: "Recorded this month.",
    contentIcon: null,
  },
]

export default function StatCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {statsData.map((stat) => (
        <Card key={stat.id}>
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
